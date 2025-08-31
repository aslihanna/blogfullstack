import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { authenticateToken } from '@/lib/auth'
import Blog from '@/models/Blog'

export async function POST(
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

    const blog = await Blog.findById(params.id)
    
    if (!blog) {
      return NextResponse.json(
        { error: 'Blog bulunamadı' },
        { status: 404 }
      )
    }

    const userId = user._id.toString()
    const isLiked = blog.likes.includes(userId)

    if (isLiked) {
      // Beğeniyi kaldır
      blog.likes = blog.likes.filter((id: any) => id.toString() !== userId)
    } else {
      // Beğeni ekle
      blog.likes.push(userId)
    }

    await blog.save()

    return NextResponse.json({
      success: true,
      liked: !isLiked,
      likes: blog.likes
    })
  } catch (error: any) {
    console.error('Blog like error:', error)
    return NextResponse.json(
      { error: 'İşlem başarısız' },
      { status: 500 }
    )
  }
}
