import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Tag from '@/models/Tag';
import { authenticateToken } from '@/lib/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const user = await authenticateToken(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      );
    }

    const { id } = params;
    const body = await request.json();

    const tag = await Tag.findByIdAndUpdate(
      id,
      { ...body },
      { new: true, runValidators: true }
    );

    if (!tag) {
      return NextResponse.json(
        { error: 'Etiket bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({ tag });
  } catch (error) {
    console.error('Etiket güncelleme hatası:', error);
    return NextResponse.json(
      { error: 'Etiket güncellenirken hata oluştu' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const user = await authenticateToken(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      );
    }

    const { id } = params;

    const tag = await Tag.findByIdAndDelete(id);

    if (!tag) {
      return NextResponse.json(
        { error: 'Etiket bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Etiket başarıyla silindi' });
  } catch (error) {
    console.error('Etiket silme hatası:', error);
    return NextResponse.json(
      { error: 'Etiket silinirken hata oluştu' },
      { status: 500 }
    );
  }
}

