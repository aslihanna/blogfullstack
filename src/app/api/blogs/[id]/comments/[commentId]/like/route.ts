import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Comment from '@/models/Comment';
import { authenticateToken } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; commentId: string } }
) {
  try {
    await connectDB();
    
    const user = await authenticateToken(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Yorum beğenmek için giriş yapmanız gerekiyor' },
        { status: 401 }
      );
    }

    const { commentId } = params;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return NextResponse.json(
        { error: 'Yorum bulunamadı' },
        { status: 404 }
      );
    }

    // Beğeniyi toggle et
    await comment.toggleLike(user._id.toString());

    // Güncellenmiş yorumu getir
    const updatedComment = await Comment.findById(commentId)
      .populate('author', 'name email avatar');

    return NextResponse.json({ comment: updatedComment });
  } catch (error) {
    console.error('Yorum beğenme hatası:', error);
    return NextResponse.json(
      { error: 'Yorum beğenirken hata oluştu' },
      { status: 500 }
    );
  }
}

