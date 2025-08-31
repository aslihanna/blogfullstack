import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Blog from '@/models/Blog';
import Comment from '@/models/Comment';
import { authenticateToken } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Blog'un var olup olmadığını kontrol et
    const blog = await Blog.findById(id);
    if (!blog) {
      return NextResponse.json(
        { error: 'Blog bulunamadı' },
        { status: 404 }
      );
    }

    // Ana yorumları getir (yanıtlar hariç)
    const comments = await Comment.find({ blog: id, parentComment: null })
      .populate('author', 'name email avatar')
      .populate({
        path: 'replies',
        populate: {
          path: 'author',
          select: 'name email avatar'
        },
        options: { sort: { createdAt: 1 } }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Toplam yorum sayısını getir
    const totalComments = await Comment.countDocuments({ blog: id, parentComment: null });

    return NextResponse.json({
      comments,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalComments / limit),
        totalComments,
        hasNextPage: page * limit < totalComments,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Yorumlar getirilirken hata:', error);
    return NextResponse.json(
      { error: 'Yorumlar getirilirken hata oluştu' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const user = await authenticateToken(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Yorum yapmak için giriş yapmanız gerekiyor' },
        { status: 401 }
      );
    }

    const { id } = params;
    const { content, parentCommentId } = await request.json();

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Yorum içeriği zorunludur' },
        { status: 400 }
      );
    }

    if (content.length > 1000) {
      return NextResponse.json(
        { error: 'Yorum 1000 karakterden uzun olamaz' },
        { status: 400 }
      );
    }

    // Blog'un var olup olmadığını kontrol et
    const blog = await Blog.findById(id);
    if (!blog) {
      return NextResponse.json(
        { error: 'Blog bulunamadı' },
        { status: 404 }
      );
    }

    // Eğer yanıt yorumu ise, parent comment'in var olup olmadığını kontrol et
    if (parentCommentId) {
      const parentComment = await Comment.findById(parentCommentId);
      if (!parentComment) {
        return NextResponse.json(
          { error: 'Yanıtlanacak yorum bulunamadı' },
          { status: 404 }
        );
      }
    }

    // Yeni yorum oluştur
    const comment = new Comment({
      content: content.trim(),
      author: user._id,
      blog: id,
      parentComment: parentCommentId || null
    });

    await comment.save();

    // Populate ile yorumu getir
    const populatedComment = await Comment.findById(comment._id)
      .populate('author', 'name email avatar');

    return NextResponse.json({ comment: populatedComment }, { status: 201 });
  } catch (error) {
    console.error('Yorum oluşturulurken hata:', error);
    return NextResponse.json(
      { error: 'Yorum oluşturulurken hata oluştu' },
      { status: 500 }
    );
  }
}
