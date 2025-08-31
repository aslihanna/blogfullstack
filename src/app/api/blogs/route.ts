import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Blog from '@/models/Blog'
import Category from '@/models/Category'
import Tag from '@/models/Tag'
import { authenticateToken } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const author = searchParams.get('author')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const skip = (page - 1) * limit

    // Build query
    let query: any = {}

    if (category && category !== 'All') {
      // Kategori ID'si ile arama
      const categoryDoc = await Category.findOne({ slug: category })
      if (categoryDoc) {
        query.category = categoryDoc._id
      }
    }

    if (search) {
      query.$text = { $search: search }
    }

    if (author) {
      query.author = author
    }

    // Build sort object
    const sort: any = {}
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1

    const blogs = await Blog.find(query)
      .populate('author', 'name email avatar')
      .populate('category', 'name slug color icon')
      .populate('tags', 'name slug color')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean()

    const total = await Blog.countDocuments(query)

    return NextResponse.json({
      blogs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error: any) {
    console.error('Get blogs error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log('=== BLOG POST REQUEST START ===')
    await connectDB()

    // Kullanıcı doğrulama
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

    const body = await req.json()
    console.log('Raw request body:', body)
    const { title, content, excerpt, category, tags, image } = body
    console.log('Parsed blog data:', { 
      title, 
      contentLength: content?.length || 0,
      excerpt, 
      category, 
      tags, 
      image 
    })

    // Validation
    if (!title || !content || !category) {
      return NextResponse.json(
        { error: 'Başlık, içerik ve kategori zorunludur' },
        { status: 400 }
      )
    }

    // Kategori kontrolü
    const categoryDoc = await Category.findById(category)
    if (!categoryDoc) {
      return NextResponse.json(
        { error: 'Geçersiz kategori' },
        { status: 400 }
      )
    }

    // Etiketleri kontrol et ve oluştur
    let tagIds = []
    if (tags && tags.length > 0) {
      for (const tagName of tags) {
        let tag = await Tag.findOne({ name: tagName.toLowerCase() })
        if (!tag) {
          // Yeni etiket oluştur - slug otomatik oluşturulacak
          const tagSlug = tagName.toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim('-')
          
          tag = new Tag({
            name: tagName.toLowerCase(),
            slug: tagSlug,
            color: '#6B7280'
          })
          await tag.save()
        }
        tagIds.push(tag._id)
      }
    }

    // Create blog
    const blogData = {
      title,
      content,
      excerpt: excerpt || content.substring(0, 150) + '...',
      category: categoryDoc._id,
      tags: tagIds,
      image,
      author: user._id,
      slug: title.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim('-')
    }
    
    console.log('Blog data to save:', blogData)
    const blog = new Blog(blogData)
    console.log('Blog object created:', blog)
    
    try {
      await blog.save()
      console.log('Blog saved successfully with ID:', blog._id)
    } catch (saveError) {
      console.error('Blog save error:', saveError)
      throw saveError
    }

    // Kategori blog sayısını artır
    categoryDoc.blogCount += 1
    await categoryDoc.save()

    // Etiket blog sayılarını artır
    for (const tagId of tagIds) {
      const tag = await Tag.findById(tagId)
      if (tag) {
        tag.blogCount += 1
        await tag.save()
      }
    }

    // Populate related data
    await blog.populate('author', 'name email avatar')
    await blog.populate('category', 'name slug color icon')
    await blog.populate('tags', 'name slug color')

    return NextResponse.json({
      message: 'Blog başarıyla oluşturuldu',
      blog,
    })
  } catch (error: any) {
    console.error('Blog oluşturma hatası:', error)
    return NextResponse.json(
      { error: 'Blog oluşturulamadı' },
      { status: 500 }
    )
  }
}
