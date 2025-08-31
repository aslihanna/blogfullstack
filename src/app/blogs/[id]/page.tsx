'use client'

import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { fetchBlogById, likeBlog } from '@/store/blogSlice'
import { AppDispatch } from '@/store'
import LoadingSpinner from '@/components/LoadingSpinner'
import CommentSection from '@/components/CommentSection'

import Link from 'next/link'

export default function BlogDetail() {
  const [similarBlogs, setSimilarBlogs] = useState([])
  const [loadingSimilar, setLoadingSimilar] = useState(false)
  
  const params = useParams()
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  
  const { currentBlog, loading, error } = useSelector((state: any) => state.blog)
  const { isAuthenticated, user } = useSelector((state: any) => state.auth)

  const blogId = params.id as string

  useEffect(() => {
    if (blogId) {
      dispatch(fetchBlogById(blogId))
      
      // Increment view count
      fetch(`/api/blogs/${blogId}`, {
        method: 'GET'
      }).catch(error => {
        console.error('View count increment error:', error)
      })

      // Fetch similar blogs
      setLoadingSimilar(true)
      fetch(`/api/blogs/${blogId}/similar`)
        .then(res => res.json())
        .then(data => {
          if (data.blogs) {
            setSimilarBlogs(data.blogs)
          }
        })
        .catch(error => {
          console.error('Similar blogs fetch error:', error)
        })
        .finally(() => {
          setLoadingSimilar(false)
        })
    }
  }, [blogId, dispatch])

  const handleLike = async () => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    await dispatch(likeBlog(blogId))
  }



  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (error || !currentBlog) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Blog yazısı bulunamadı
          </h1>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Ana Sayfaya Dön
          </button>
        </div>
      </div>
    )
  }

  const isLiked = currentBlog.likes?.includes(user?._id)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">

      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          {/* Blog Header */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <span 
                className="px-3 py-1 text-sm font-medium rounded-full"
                style={{ 
                  backgroundColor: currentBlog.category?.color + '20',
                  color: currentBlog.category?.color 
                }}
              >
                {currentBlog.category?.name}
              </span>
              <span className="text-gray-500 dark:text-gray-400">•</span>
              <span className="text-gray-500 dark:text-gray-400">
                {formatDate(currentBlog.createdAt)}
              </span>
            </div>

            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {currentBlog.title}
            </h1>

            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
              {currentBlog.excerpt}
            </p>

            {currentBlog.image && (
              <img
                src={currentBlog.image}
                alt={currentBlog.title}
                className="w-full h-64 object-cover rounded-lg mb-6"
              />
            )}

            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span className="text-gray-600 dark:text-gray-400">
                    {currentBlog.views || 0} görüntüleme
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span className="text-gray-600 dark:text-gray-400">
                    {currentBlog.comments?.length || 0} yorum
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                    isLiked 
                      ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400' 
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <svg className="w-5 h-5" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span>{currentBlog.likes?.length || 0}</span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                {currentBlog.author?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {currentBlog.author?.name}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Yazar
                </p>
              </div>
            </div>

            {currentBlog.tags && currentBlog.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {currentBlog.tags.map((tag: any) => (
                  <span
                    key={tag._id}
                    className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full"
                  >
                    #{tag.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Blog Content */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
            <div 
              className="prose prose-lg max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: currentBlog.content }}
            />
          </div>

          {/* Comments Section */}
          <CommentSection blogId={blogId} blogSlug={currentBlog?.slug || ''} />

          {/* Similar Blogs */}
          {similarBlogs.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Benzer Yazılar
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {similarBlogs.map((blog: any) => (
                  <motion.div
                    key={blog._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -5 }}
                    className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:shadow-md transition-all"
                  >
                    <Link href={`/blogs/${blog._id}`}>
                      <div className="space-y-3">
                        {blog.image && (
                          <img
                            src={blog.image}
                            alt={blog.title}
                            className="w-full h-32 object-cover rounded-md"
                          />
                        )}
                        <div>
                          <span className="inline-block px-2 py-1 text-xs font-medium rounded-full mb-2"
                                style={{ 
                                  backgroundColor: blog.category?.color + '20',
                                  color: blog.category?.color 
                                }}>
                            {blog.category?.name}
                          </span>
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                            {blog.title}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                            {blog.excerpt}
                          </p>
                          <div className="flex items-center justify-between mt-3 text-xs text-gray-500 dark:text-gray-400">
                            <span>{blog.author?.name}</span>
                            <span>{formatDate(blog.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
