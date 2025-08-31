import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Blog from '@/models/Blog'
import Category from '@/models/Category'
import Tag from '@/models/Tag'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    
    const blog = await Blog.findById(params.id)
      .populate('category', 'name')
      .populate('tags', 'name')
    
    if (!blog) {
      return NextResponse.json(
        { error: 'Blog bulunamadı' },
        { status: 404 }
      )
    }

    // Benzer yazıları bul
    const similarBlogs = await Blog.find({
      _id: { $ne: params.id }, // Mevcut blog hariç
      $or: [
        { category: blog.category._id },
        { tags: { $in: blog.tags.map((tag: any) => tag._id) } }
      ],
      status: 'published'
    })
    .populate('author', 'name')
    .populate('category', 'name')
    .populate('tags', 'name')
    .sort({ views: -1, createdAt: -1 })
    .limit(3)

    return NextResponse.json({ blogs: similarBlogs })
  } catch (error: any) {
    console.error('Similar blogs error:', error)
    return NextResponse.json(
      { error: 'Benzer yazılar getirilemedi' },
      { status: 500 }
    )
  }
}

