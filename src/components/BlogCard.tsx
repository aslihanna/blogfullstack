'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { formatDate, truncateText } from '@/lib/utils'
import { deleteBlog, likeBlog } from '@/store/blogSlice'
import { AppDispatch } from '@/store'

interface BlogCardProps {
  blog: {
    _id: string
    title: string
    excerpt: string
    content: string
    author: {
      name: string
      _id: string
    }
    category: {
      _id: string
      name: string
      slug: string
      color: string
      icon: string
    } | string
    tags: Array<{
      _id: string
      name: string
      slug: string
    }> | string[]
    image: string
    createdAt: string
    updatedAt: string
    likes: string[]
    views: number
    comments: any[]
  }
  showActions?: boolean
  featured?: boolean
}

export default function BlogCard({ blog, showActions = false, featured = false }: BlogCardProps) {
  const { user } = useSelector((state: any) => state.auth)
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()

  const handleEdit = () => {
    router.push(`/edit/${blog._id}`)
  }

  const handleDelete = async () => {
    if (confirm('Bu blog yazısını silmek istediğinizden emin misiniz?')) {
      try {
        await dispatch(deleteBlog(blog._id))
      } catch (error) {
        console.error('Error deleting blog:', error)
      }
    }
  }

  const handleLike = async () => {
    try {
      await dispatch(likeBlog(blog._id))
    } catch (error) {
      console.error('Error liking blog:', error)
    }
  }

  const isLiked = blog.likes?.includes(user?._id)
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 hover:shadow-md"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={blog.image || '/placeholder-blog.jpg'}
          alt={blog.title}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
        <div className="absolute top-3 left-3">
          <span className="inline-block px-2 py-1 bg-blue-600 text-white text-xs font-medium rounded-md">
            {typeof blog.category === 'string' ? blog.category : blog.category.name}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <Link href={`/blogs/${blog._id}`}>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            {blog.title}
          </h3>
        </Link>

        {/* Excerpt */}
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
          {truncateText(blog.excerpt || blog.content, 120)}
        </p>

        {/* Tags */}
        {blog.tags && blog.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {blog.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="inline-block px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-md"
              >
                #{typeof tag === 'string' ? tag : tag.name}
              </span>
            ))}
            {blog.tags.length > 3 && (
              <span className="inline-block px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-md">
                +{blog.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Author and Stats */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
              {blog.author.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {blog.author.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatDate(blog.createdAt)}
              </p>
            </div>
          </div>

          {/* Stats and Actions */}
          <div className="flex items-center space-x-3">
            {/* Stats */}
            <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center space-x-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>{blog.views}</span>
              </div>
              <button
                onClick={handleLike}
                className={`flex items-center space-x-1 transition-colors ${
                  isLiked 
                    ? 'text-red-500 hover:text-red-600' 
                    : 'text-gray-500 hover:text-red-500'
                }`}
              >
                <svg className="w-3 h-3" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span>{blog.likes.length}</span>
              </button>
              <div className="flex items-center space-x-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span>{blog.comments.length}</span>
              </div>
            </div>

            {/* Action Buttons */}
            {showActions && user && (user._id === blog.author._id || user.role === 'admin') && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleEdit}
                  className="p-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                  title="Düzenle"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={handleDelete}
                  className="p-1 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                  title="Sil"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
