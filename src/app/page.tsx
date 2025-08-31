'use client'

import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchBlogs } from '@/store/blogSlice'
import BlogCard from '@/components/BlogCard'
import LoadingSpinner from '@/components/LoadingSpinner'
import SearchBar from '@/components/SearchBar'
import CategoryFilter from '@/components/CategoryFilter'
import { AppDispatch } from '@/store'

const categories = [
  'Tümü',
  'Teknoloji',
  'Bilim',
  'Sağlık',
  'Eğitim',
  'Spor',
  'Sanat',
  'Politika',
  'Ekonomi',
  'Yaşam',
  'Diğer'
]

export default function Home() {
  const dispatch = useDispatch<AppDispatch>()
  const { blogs, loading, error } = useSelector((state: any) => state.blog)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Tümü')
  const [filteredBlogs, setFilteredBlogs] = useState<any[]>([])
  
  useEffect(() => {
    try {
      dispatch(fetchBlogs({}))
    } catch (error) {
      console.error('Error fetching blogs:', error)
    }
  }, [dispatch])

  useEffect(() => {
    if (blogs) {
      let filtered = [...blogs]
      
      // Kategori filtresi
      if (selectedCategory !== 'Tümü') {
        filtered = filtered.filter(blog => {
          const categoryName = typeof blog.category === 'string' 
            ? blog.category 
            : blog.category?.name
          return categoryName === selectedCategory
        })
      }
      
      // Arama filtresi
      if (searchTerm) {
        filtered = filtered.filter(blog => 
          blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          blog.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
          blog.excerpt?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      }
      
      setFilteredBlogs(filtered)
    }
  }, [blogs, searchTerm, selectedCategory])

  // Popüler blogları al (en çok görüntülenen 3 blog)
  const popularBlogs = (blogs || []).slice(0, 3)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="text-red-600 dark:text-red-400 text-lg font-medium mb-2">
              Bir hata oluştu
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              Blog yazıları yüklenirken bir sorun oluştu. Lütfen daha sonra tekrar deneyin.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Hoş Geldiniz
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              En güncel blog yazılarını keşfedin ve topluluğumuzun paylaştığı değerli içerikleri okuyun.
            </p>
            
            {/* Search Bar */}
            <div className="mb-6">
              <SearchBar 
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                placeholder="Blog yazılarında ara..."
              />
            </div>
            
            {/* Category Filter */}
            <div className="mb-6">
              <CategoryFilter
                categories={categories}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Popular Blogs Section */}
      {popularBlogs.length > 0 && (
        <section className="py-12 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700">
          <div className="container mx-auto px-4">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 text-center">
                Popüler Yazılar
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-center">
                En çok okunan ve beğenilen blog yazıları
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularBlogs.map((blog: any, index: number) => (
                <div
                  key={blog._id}
                  className="transform hover:scale-105 transition-transform duration-200"
                >
                  <BlogCard blog={blog} featured />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Blog Posts */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 text-center">
              {selectedCategory !== 'Tümü' ? `${selectedCategory} Kategorisi` : 'Tüm Yazılar'}
            </h2>
            {searchTerm && (
              <p className="text-gray-600 dark:text-gray-300 text-center">
                "{searchTerm}" için arama sonuçları
              </p>
            )}
          </div>

          {filteredBlogs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBlogs.map((blog: any, index: number) => (
                <div key={blog._id}>
                  <BlogCard blog={blog} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {searchTerm || selectedCategory !== 'Tümü' ? 'Sonuç bulunamadı' : 'Henüz blog yazısı yok'}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {searchTerm || selectedCategory !== 'Tümü' 
                  ? 'Arama kriterlerinize uygun blog yazısı bulunamadı. Farklı anahtar kelimeler deneyin.'
                  : 'İlk blog yazısını oluşturmak için giriş yapın ve yazı oluştur butonuna tıklayın.'
                }
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
