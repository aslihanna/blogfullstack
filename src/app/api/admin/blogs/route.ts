import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { authenticateToken } from '@/lib/auth'
import Blog from '@/models/Blog'

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

    const blogs = await Blog.find({})
      .populate('author', 'name email')
      .populate('category', 'name')
      .populate('tags', 'name')
      .sort({ createdAt: -1 })

    return NextResponse.json({ blogs })
  } catch (error: any) {
    console.error('Admin blogs fetch error:', error)
    return NextResponse.json(
      { error: 'Bloglar getirilemedi' },
      { status: 500 }
    )
  }
}


