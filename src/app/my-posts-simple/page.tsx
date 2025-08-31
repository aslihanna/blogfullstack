'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Blog {
  _id: string
  title: string
  excerpt: string
  content: string
  image: string
  status: 'draft' | 'published'
  views: number
  likes: string[]
  createdAt: string
  updatedAt: string
  category: {
    _id: string
    name: string
  }
  tags: Array<{
    _id: string
    name: string
  }>
  readTime: number
}

export default function MyPostsSimplePage() {
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchMyPosts = async () => {
      try {
        console.log('=== SIMPLE MY POSTS START ===')
        const token = localStorage.getItem('token')
        console.log('Token exists:', !!token)
        
        if (!token) {
          setError('Giriş yapmanız gerekiyor')
          setLoading(false)
          return
        }

        console.log('Making request to /api/blogs/my-posts')
        const response = await fetch('/api/blogs/my-posts', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        console.log('Response status:', response.status)
        console.log('Response ok:', response.ok)

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          console.error('API Error:', errorData)
          throw new Error(errorData.error || 'Yazılarınız yüklenemedi')
        }

        const data = await response.json()
        console.log('API Success Response:', data)
        setBlogs(data.blogs)
      } catch (error) {
        console.error('=== SIMPLE MY POSTS ERROR ===')
        console.error('Error type:', typeof error)
        console.error('Error message:', error.message)
        console.error('Full error:', error)
        setError('Yazılarınız yüklenirken bir hata oluştu')
      } finally {
        setLoading(false)
      }
    }

    fetchMyPosts()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Hata
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <Link
              href="/login"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Giriş Yap
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Yazılarım (Basit Versiyon)
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Yayınladığınız yazılar
          </p>
        </div>

        {blogs.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-500 mb-4">
              <svg
                className="mx-auto h-12 w-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Henüz yazınız yok
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              İlk yazınızı oluşturmaya başlayın
            </p>
            <Link
              href="/create"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              İlk Yazınızı Oluşturun
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {blogs.map((blog) => (
              <div
                key={blog._id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                {blog.image && (
                  <div className="aspect-video bg-gray-200 dark:bg-gray-700">
                    <img
                      src={blog.image}
                      alt={blog.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      blog.status === 'published' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}>
                      {blog.status === 'published' ? 'Yayınlandı' : 'Taslak'}
                    </span>
                    <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                      <span>👁️ {blog.views}</span>
                    </div>
                  </div>

                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {blog.title}
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {blog.excerpt}
                  </p>

                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <div className="flex items-center">
                      <span>📅 {new Date(blog.createdAt).toLocaleDateString('tr-TR')}</span>
                    </div>
                    <div className="flex items-center">
                      <span>⏱️ {blog.readTime} dk</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      <Link
                        href={`/edit/${blog._id}`}
                        className="inline-flex items-center px-3 py-1 text-sm bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                      >
                        ✏️ Düzenle
                      </Link>
                      <Link
                        href={`/blogs/${blog._id}`}
                        className="inline-flex items-center px-3 py-1 text-sm bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        👁️ Görüntüle
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}


