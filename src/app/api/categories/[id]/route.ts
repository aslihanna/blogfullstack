import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Category from '@/models/Category';
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

    const category = await Category.findByIdAndUpdate(
      id,
      { ...body },
      { new: true, runValidators: true }
    );

    if (!category) {
      return NextResponse.json(
        { error: 'Kategori bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({ category });
  } catch (error) {
    console.error('Kategori güncelleme hatası:', error);
    return NextResponse.json(
      { error: 'Kategori güncellenirken hata oluştu' },
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

    const category = await Category.findByIdAndDelete(id);

    if (!category) {
      return NextResponse.json(
        { error: 'Kategori bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Kategori başarıyla silindi' });
  } catch (error) {
    console.error('Kategori silme hatası:', error);
    return NextResponse.json(
      { error: 'Kategori silinirken hata oluştu' },
      { status: 500 }
    );
  }
}

