import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Comment from '@/models/Comment';
import { authenticateToken } from '@/lib/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; commentId: string } }
) {
  try {
    await connectDB();
    
    const user = await authenticateToken(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Yorum düzenlemek için giriş yapmanız gerekiyor' },
        { status: 401 }
      );
    }

    const { commentId } = params;
    const { content } = await request.json();

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

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return NextResponse.json(
        { error: 'Yorum bulunamadı' },
        { status: 404 }
      );
    }

    // Sadece yorum sahibi veya admin düzenleyebilir
    if (comment.author.toString() !== user._id.toString() && user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Bu yorumu düzenleme yetkiniz yok' },
        { status: 403 }
      );
    }

    comment.content = content.trim();
    comment.isEdited = true;
    comment.editedAt = new Date();
    await comment.save();

    const updatedComment = await Comment.findById(commentId)
      .populate('author', 'name email avatar');

    return NextResponse.json({ comment: updatedComment });
  } catch (error) {
    console.error('Yorum güncellenirken hata:', error);
    return NextResponse.json(
      { error: 'Yorum güncellenirken hata oluştu' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; commentId: string } }
) {
  try {
    await connectDB();
    
    const user = await authenticateToken(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Yorum silmek için giriş yapmanız gerekiyor' },
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

    // Sadece yorum sahibi veya admin silebilir
    if (comment.author.toString() !== user._id.toString() && user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Bu yorumu silme yetkiniz yok' },
        { status: 403 }
      );
    }

    // Yorumu ve tüm yanıtlarını sil
    await Comment.deleteMany({
      $or: [
        { _id: commentId },
        { parentComment: commentId }
      ]
    });

    return NextResponse.json({ message: 'Yorum başarıyla silindi' });
  } catch (error) {
    console.error('Yorum silinirken hata:', error);
    return NextResponse.json(
      { error: 'Yorum silinirken hata oluştu' },
      { status: 500 }
    );
  }
}
