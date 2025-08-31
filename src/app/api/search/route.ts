import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Blog from '@/models/Blog';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    
    if (!query || query.trim() === '') {
      return NextResponse.json({ results: [] });
    }

    // MongoDB text search için index oluştur (eğer yoksa)
    // Bu işlem sadece bir kez çalışır
    try {
      await Blog.collection.createIndex({
        title: 'text',
        content: 'text',
        excerpt: 'text'
      });
    } catch (error) {
      // Index zaten varsa hata vermez
    }

    // Text search ile arama yap
    const searchResults = await Blog.find(
      { $text: { $search: query } },
      { score: { $meta: 'textScore' } }
    )
    .populate('author', 'name')
    .populate('category', 'name color')
    .populate('tags', 'name color')
    .sort({ score: { $meta: 'textScore' } })
    .limit(20);

    // Eğer text search sonuç vermezse, regex ile arama yap
    let results = searchResults;
    
    if (results.length === 0) {
      const regexQuery = new RegExp(query, 'i');
      results = await Blog.find({
        $or: [
          { title: regexQuery },
          { excerpt: regexQuery },
          { content: regexQuery }
        ]
      })
      .populate('author', 'name')
      .populate('category', 'name color')
      .populate('tags', 'name color')
      .sort({ createdAt: -1 })
      .limit(20);
    }

    // Sonuçları formatla
    const formattedResults = results.map(blog => ({
      _id: blog._id,
      title: blog.title,
      excerpt: blog.excerpt,
      slug: blog.slug,
      author: blog.author,
      category: blog.category,
      tags: blog.tags,
      views: blog.views || 0,
      likes: blog.likes?.length || 0,
      commentCount: blog.comments?.length || 0,
      createdAt: blog.createdAt
    }));

    return NextResponse.json({ results: formattedResults });
  } catch (error) {
    console.error('Arama hatası:', error);
    return NextResponse.json(
      { error: 'Arama yapılırken hata oluştu' },
      { status: 500 }
    );
  }
}

