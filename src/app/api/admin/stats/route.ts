import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { authenticateToken } from '@/lib/auth'
import Blog from '@/models/Blog'
import User from '@/models/User'
import Category from '@/models/Category'

export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const user = await authenticateToken(req)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Giriş yapmanız gerekiyor' },
        { status: 401 }
      )
    }

    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin yetkisi gerekli' },
        { status: 403 }
      )
    }

    const [totalBlogs, totalUsers, totalCategories, blogsForViews] = await Promise.all([
      Blog.countDocuments(),
      User.countDocuments(),
      Category.countDocuments(),
      Blog.find({}, 'views')
    ])

    const totalViews = blogsForViews.reduce((sum, blog) => sum + (blog.views || 0), 0)

    return NextResponse.json({
      totalBlogs,
      totalUsers,
      totalCategories,
      totalViews
    })
  } catch (error: any) {
    console.error('Admin stats error:', error)
    return NextResponse.json(
      { error: 'İstatistikler getirilemedi' },
      { status: 500 }
    )
  }
}


