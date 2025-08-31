'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { fetchBlogs } from '@/store/blogSlice'
import { setSearchTerm, setSelectedCategory } from '@/store/blogSlice'
import { AppDispatch } from '@/store'
import BlogCard from '@/components/BlogCard'
import SearchBar from '@/components/SearchBar'
import CategoryFilter from '@/components/CategoryFilter'
import LoadingSpinner from '@/components/LoadingSpinner'
import { ChevronDown, Loader2 } from 'lucide-react'

export default function BlogsPage() {
  const [categories, setCategories] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [loadingMore, setLoadingMore] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)
  
  const dispatch = useDispatch<AppDispatch>()
  const { blogs, loading, error, searchTerm, selectedCategory, hasMore: reduxHasMore } = useSelector((state: any) => state.blog)

  useEffect(() => {
    // Fetch categories
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories')
        const data = await response.json()
        setCategories(data.categories || [])
      } catch (error) {
        console.error('Kategoriler yüklenemedi:', error)
      }
    }
    
    fetchCategories()
  }, [])

  // Reset blogs when search or category changes
  useEffect(() => {
    setCurrentPage(1)
    dispatch(fetchBlogs({ page: 1, limit: 12, append: false }))
  }, [dispatch, searchTerm, selectedCategory])

  // Load more blogs when page changes
  useEffect(() => {
    if (currentPage > 1) {
      loadMoreBlogs()
    }
  }, [currentPage])

  const loadMoreBlogs = async () => {
    if (loadingMore || !reduxHasMore) return
    
    setLoadingMore(true)
    try {
      await dispatch(fetchBlogs({ page: currentPage, limit: 12, append: true }))
    } catch (error) {
      console.error('Daha fazla blog yüklenirken hata:', error)
    } finally {
      setLoadingMore(false)
    }
  }

  // Intersection Observer for infinite scroll
  const lastBlogRef = useCallback((node: HTMLDivElement) => {
    if (loadingMore || !reduxHasMore) return
    
    if (observerRef.current) {
      observerRef.current.disconnect()
    }
    
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && reduxHasMore && !loadingMore) {
        setCurrentPage(prev => prev + 1)
      }
    }, {
      rootMargin: '100px'
    })
    
    if (node) {
      observerRef.current.observe(node)
    }
  }, [loadingMore, reduxHasMore])

  const handleSearch = (term: string) => {
    dispatch(setSearchTerm(term))
    setCurrentPage(1)
  }

  const handleCategoryChange = (category: string) => {
    dispatch(setSelectedCategory(category))
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Bir hata oluştu
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Tüm Blog Yazıları
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            İlginizi çeken konuları keşfedin
          </p>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SearchBar
                searchTerm={searchTerm}
                onSearchChange={handleSearch}
              />
              <CategoryFilter
                categories={categories}
                selectedCategory={selectedCategory}
                onCategoryChange={handleCategoryChange}
              />
            </div>
          </div>
        </motion.div>

        {/* Blog Grid */}
        {loading && currentPage === 1 ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : (blogs || []).length > 0 ? (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              <AnimatePresence>
                {(blogs || []).map((blog: any, index: number) => (
                  <motion.div
                    key={blog._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: 0.1 * (index % 12) }}
                    ref={index === (blogs || []).length - 1 ? lastBlogRef : null}
                  >
                    <BlogCard blog={blog} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Loading More Indicator */}
            {loadingMore && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-center py-8"
              >
                <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Daha fazla yükleniyor...</span>
                </div>
              </motion.div>
            )}

            {/* End of Content */}
            {!reduxHasMore && (blogs || []).length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8"
              >
                <div className="flex items-center justify-center space-x-2 text-gray-500 dark:text-gray-400">
                  <div className="w-8 h-0.5 bg-gray-300 dark:bg-gray-600"></div>
                  <span className="text-sm">Tüm blog yazıları yüklendi</span>
                  <div className="w-8 h-0.5 bg-gray-300 dark:bg-gray-600"></div>
                </div>
              </motion.div>
            )}
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Blog yazısı bulunamadı
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              {searchTerm || selectedCategory 
                ? 'Arama kriterlerinizi değiştirmeyi deneyin'
                : 'Henüz blog yazısı yok'
              }
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
