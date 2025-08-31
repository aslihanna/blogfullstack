import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { authenticateToken } from '@/lib/auth'
import Blog from '@/models/Blog'

export async function GET(req: NextRequest) {
  try {
    console.log('=== MY POSTS API START ===')
    await connectDB()
    console.log('Database connected')
    
    const user = await authenticateToken(req)
    console.log('User authenticated:', user ? 'Yes' : 'No')
    console.log('User ID:', user?._id)
    
    if (!user) {
      console.log('Authentication failed')
      return NextResponse.json(
        { error: 'Giriş yapmanız gerekiyor' },
        { status: 401 }
      )
    }

    console.log('Fetching blogs for user:', user._id)
    const blogs = await Blog.find({ author: user._id })
      .populate('category', 'name')
      .populate('tags', 'name')
      .sort({ createdAt: -1 })

    console.log('Blogs found:', blogs.length)
    console.log('=== MY POSTS API SUCCESS ===')
    return NextResponse.json({ blogs })
  } catch (error: any) {
    console.error('=== MY POSTS API ERROR ===')
    console.error('Error type:', typeof error)
    console.error('Error message:', error.message)
    console.error('Full error:', error)
    return NextResponse.json(
      { error: 'Yazılar getirilemedi' },
      { status: 500 }
    )
  }
}
