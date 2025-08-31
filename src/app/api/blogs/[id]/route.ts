import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Blog from '@/models/Blog'
import { requireAuth, AuthRequest } from '@/lib/auth'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()

    const blog = await Blog.findById(params.id)
      .populate('author', 'name email')
      .lean()

    if (!blog) {
      return NextResponse.json(
        { message: 'Blog not found' },
        { status: 404 }
      )
    }

    // Increment views
    await Blog.findByIdAndUpdate(params.id, { $inc: { views: 1 } })

    return NextResponse.json(blog)
  } catch (error: any) {
    console.error('Get blog error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const PUT = requireAuth(async (
  req: AuthRequest,
  { params }: { params: { id: string } }
) => {
  try {
    await connectDB()

    const { title, content, excerpt, category, tags, image } = await req.json()

    const blog = await Blog.findById(params.id)

    if (!blog) {
      return NextResponse.json(
        { message: 'Blog not found' },
        { status: 404 }
      )
    }

    // Check if user is author or admin
    if (blog.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return NextResponse.json(
        { message: 'Not authorized to update this blog' },
        { status: 403 }
      )
    }

    // Update blog
    const updatedBlog = await Blog.findByIdAndUpdate(
      params.id,
      {
        title,
        content,
        excerpt: excerpt || content.substring(0, 150) + '...',
        category,
        tags: tags || [],
        image,
      },
      { new: true }
    ).populate('author', 'name email')

    return NextResponse.json({
      message: 'Blog updated successfully',
      blog: updatedBlog,
    })
  } catch (error: any) {
    console.error('Update blog error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
})

export const DELETE = requireAuth(async (
  req: AuthRequest,
  { params }: { params: { id: string } }
) => {
  try {
    await connectDB()

    const blog = await Blog.findById(params.id)

    if (!blog) {
      return NextResponse.json(
        { message: 'Blog not found' },
        { status: 404 }
      )
    }

    // Check if user is author or admin
    if (blog.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return NextResponse.json(
        { message: 'Not authorized to delete this blog' },
        { status: 403 }
      )
    }

    await Blog.findByIdAndDelete(params.id)

    return NextResponse.json({
      message: 'Blog deleted successfully',
    })
  } catch (error: any) {
    console.error('Delete blog error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
})



