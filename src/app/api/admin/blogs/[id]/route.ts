import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { authenticateToken } from '@/lib/auth'
import Blog from '@/models/Blog'

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const blog = await Blog.findById(params.id)
    
    if (!blog) {
      return NextResponse.json(
        { error: 'Blog bulunamadı' },
        { status: 404 }
      )
    }

    await Blog.findByIdAndDelete(params.id)

    return NextResponse.json({ message: 'Blog başarıyla silindi' })
  } catch (error: any) {
    console.error('Admin blog delete error:', error)
    return NextResponse.json(
      { error: 'Blog silinemedi' },
      { status: 500 }
    )
  }
}


