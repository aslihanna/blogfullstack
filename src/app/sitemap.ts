import { MetadataRoute } from 'next'
import connectDB from '@/lib/mongodb'
import Blog from '@/models/Blog'
import Category from '@/models/Category'
import Tag from '@/models/Tag'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connectDB()

  const baseUrl = 'https://blogapp.com'

  // Ana sayfalar
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/blogs`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
  ]

  // Blog yazıları
  const blogs = await Blog.find({ status: 'published' })
    .select('_id updatedAt')
    .sort({ updatedAt: -1 })
    .limit(1000)

  const blogPages = blogs.map((blog) => ({
    url: `${baseUrl}/blogs/${blog._id}`,
    lastModified: blog.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // Kategoriler
  const categories = await Category.find({ isActive: true })
    .select('slug updatedAt')
    .sort({ updatedAt: -1 })

  const categoryPages = categories.map((category) => ({
    url: `${baseUrl}/categories/${category.slug}`,
    lastModified: category.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  // Etiketler
  const tags = await Tag.find({ isActive: true })
    .select('slug updatedAt')
    .sort({ updatedAt: -1 })

  const tagPages = tags.map((tag) => ({
    url: `${baseUrl}/tags/${tag.slug}`,
    lastModified: tag.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  return [...staticPages, ...blogPages, ...categoryPages, ...tagPages]
}

