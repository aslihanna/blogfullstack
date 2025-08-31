import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Blog from '@/models/Blog';
import User from '@/models/User';
import Category from '@/models/Category';
import Tag from '@/models/Tag';
import Comment from '@/models/Comment';
import { authenticateToken } from '@/lib/auth';
import { startOfDay, endOfDay, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const user = await authenticateToken(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '7d'; // 7d, 30d, 90d, 1y
    const type = searchParams.get('type') || 'overview'; // overview, blogs, users, engagement

    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;

    // Zaman aralığını belirle
    switch (period) {
      case '7d':
        startDate = subDays(now, 7);
        break;
      case '30d':
        startDate = subDays(now, 30);
        break;
      case '90d':
        startDate = subDays(now, 90);
        break;
      case '1y':
        startDate = subDays(now, 365);
        break;
      default:
        startDate = subDays(now, 7);
    }

    let analytics: any = {};

    switch (type) {
      case 'overview':
        analytics = await getOverviewStats(startDate, endDate);
        break;
      case 'blogs':
        analytics = await getBlogAnalytics(startDate, endDate);
        break;
      case 'users':
        analytics = await getUserAnalytics(startDate, endDate);
        break;
      case 'engagement':
        analytics = await getEngagementAnalytics(startDate, endDate);
        break;
      default:
        analytics = await getOverviewStats(startDate, endDate);
    }

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Analitik verileri getirilirken hata:', error);
    return NextResponse.json(
      { error: 'Analitik verileri getirilirken hata oluştu' },
      { status: 500 }
    );
  }
}

// Genel istatistikler
async function getOverviewStats(startDate: Date, endDate: Date) {
  const [
    totalBlogs,
    totalUsers,
    totalCategories,
    totalTags,
    totalComments,
    totalViews,
    totalLikes,
    recentBlogs,
    recentUsers,
    recentComments,
    dailyStats
  ] = await Promise.all([
    Blog.countDocuments(),
    User.countDocuments(),
    Category.countDocuments(),
    Tag.countDocuments(),
    Comment.countDocuments(),
    Blog.aggregate([
      { $group: { _id: null, totalViews: { $sum: '$views' } } }
    ]),
    Blog.aggregate([
      { $group: { _id: null, totalLikes: { $sum: '$likes' } } }
    ]),
    Blog.countDocuments({ createdAt: { $gte: startDate, $lte: endDate } }),
    User.countDocuments({ createdAt: { $gte: startDate, $lte: endDate } }),
    Comment.countDocuments({ createdAt: { $gte: startDate, $lte: endDate } }),
    getDailyStats(startDate, endDate)
  ]);

  return {
    overview: {
      totalBlogs,
      totalUsers,
      totalCategories,
      totalTags,
      totalComments,
      totalViews: totalViews[0]?.totalViews || 0,
      totalLikes: totalLikes[0]?.totalLikes || 0,
      recentBlogs,
      recentUsers,
      recentComments
    },
    dailyStats
  };
}

// Blog analitikleri
async function getBlogAnalytics(startDate: Date, endDate: Date) {
  const [
    blogStats,
    topBlogs,
    categoryStats,
    tagStats,
    blogTrends
  ] = await Promise.all([
    Blog.aggregate([
      { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
      {
        $group: {
          _id: null,
          totalBlogs: { $sum: 1 },
          avgViews: { $avg: '$views' },
          avgLikes: { $avg: '$likes' },
          avgComments: { $avg: '$commentCount' }
        }
      }
    ]),
    Blog.find()
      .populate('author', 'name')
      .populate('category', 'name')
      .sort({ views: -1 })
      .limit(10),
    Blog.aggregate([
      { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]),
    Blog.aggregate([
      { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]),
    getBlogTrends(startDate, endDate)
  ]);

  return {
    blogStats: blogStats[0] || {},
    topBlogs,
    categoryStats,
    tagStats,
    blogTrends
  };
}

// Kullanıcı analitikleri
async function getUserAnalytics(startDate: Date, endDate: Date) {
  const [
    userStats,
    topAuthors,
    userGrowth,
    userActivity
  ] = await Promise.all([
    User.aggregate([
      { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          verifiedUsers: { $sum: { $cond: ['$isVerified', 1, 0] } },
          activeUsers: { $sum: { $cond: [{ $gt: ['$loginCount', 0] }, 1, 0] } }
        }
      }
    ]),
    User.aggregate([
      {
        $lookup: {
          from: 'blogs',
          localField: '_id',
          foreignField: 'author',
          as: 'blogs'
        }
      },
      {
        $project: {
          name: 1,
          email: 1,
          blogCount: { $size: '$blogs' },
          totalViews: { $sum: '$blogs.views' },
          totalLikes: { $sum: '$blogs.likes' }
        }
      },
      { $sort: { blogCount: -1 } },
      { $limit: 10 }
    ]),
    getUserGrowth(startDate, endDate),
    getUserActivity(startDate, endDate)
  ]);

  return {
    userStats: userStats[0] || {},
    topAuthors,
    userGrowth,
    userActivity
  };
}

// Engagement analitikleri
async function getEngagementAnalytics(startDate: Date, endDate: Date) {
  const [
    engagementStats,
    commentStats,
    likeStats,
    viewStats
  ] = await Promise.all([
    Blog.aggregate([
      { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
      {
        $group: {
          _id: null,
          avgEngagement: {
            $avg: {
              $add: ['$likes', '$commentCount', { $multiply: ['$views', 0.1] }]
            }
          },
          totalEngagement: {
            $sum: {
              $add: ['$likes', '$commentCount', { $multiply: ['$views', 0.1] }]
            }
          }
        }
      }
    ]),
    Comment.aggregate([
      { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: null, totalComments: { $sum: 1 } } }
    ]),
    Blog.aggregate([
      { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: null, totalLikes: { $sum: '$likes' } } }
    ]),
    Blog.aggregate([
      { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: null, totalViews: { $sum: '$views' } } }
    ])
  ]);

  return {
    engagementStats: engagementStats[0] || {},
    commentStats: commentStats[0] || {},
    likeStats: likeStats[0] || {},
    viewStats: viewStats[0] || {}
  };
}

// Günlük istatistikler
async function getDailyStats(startDate: Date, endDate: Date) {
  const dailyStats = await Blog.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
        },
        blogs: { $sum: 1 },
        views: { $sum: '$views' },
        likes: { $sum: '$likes' }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  return dailyStats;
}

// Blog trendleri
async function getBlogTrends(startDate: Date, endDate: Date) {
  const trends = await Blog.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  return trends;
}

// Kullanıcı büyümesi
async function getUserGrowth(startDate: Date, endDate: Date) {
  const growth = await User.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  return growth;
}

// Kullanıcı aktivitesi
async function getUserActivity(startDate: Date, endDate: Date) {
  const activity = await User.aggregate([
    {
      $match: {
        lastLogin: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$lastLogin' }
        },
        activeUsers: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  return activity;
}

