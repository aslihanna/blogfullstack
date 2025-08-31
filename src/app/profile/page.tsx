'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import BlogCard from '@/components/BlogCard'

export default function ProfilePage() {
  const router = useRouter()
  const { user, isAuthenticated } = useSelector((state: any) => state.auth)
  const [activeTab, setActiveTab] = useState('profile')
  const [userBlogs, setUserBlogs] = useState([])
  const [loading, setLoading] = useState(false)

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchUserBlogs()
    }
  }, [isAuthenticated, user])

  const fetchUserBlogs = async () => {
    setLoading(true)
    try {
      console.log('Fetching blogs for user:', user._id)
      const response = await fetch('/api/blogs?author=' + user._id)
      console.log('Response status:', response.status)
      if (response.ok) {
        const data = await response.json()
        console.log('User blogs data:', data)
        setUserBlogs(data.blogs || [])
      } else {
        console.error('Failed to fetch user blogs:', response.status)
      }
    } catch (error) {
      console.error('Kullanıcı blogları yüklenirken hata:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return null
  }

  const tabs = [
    { id: 'profile', name: 'Profil Bilgileri', icon: '👤' },
    { id: 'posts', name: 'Yazılarım', icon: '📝' },
    { id: 'settings', name: 'Ayarlar', icon: '⚙️' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Profil
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Hesap bilgilerinizi yönetin ve yazılarınızı görüntüleyin
          </p>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-8"
        >
          <div className="flex flex-wrap border-b border-gray-200 dark:border-gray-700">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Content Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6"
        >
          {activeTab === 'profile' && <ProfileInfo user={user} />}
          {activeTab === 'posts' && <UserPosts blogs={userBlogs} loading={loading} />}
          {activeTab === 'settings' && <Settings />}
        </motion.div>
      </div>
    </div>
  )
}

function ProfileInfo({ user }: { user: any }) {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
        Profil Bilgileri
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Profile Picture and Basic Info */}
        <div>
          <div className="flex items-center mb-6">
            <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mr-4">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {user?.name}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {user?.email}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Üye olma: {new Date(user?.createdAt).toLocaleDateString('tr-TR')}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Ad Soyad
              </label>
              <input
                type="text"
                value={user?.name || ''}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                readOnly
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                E-posta
              </label>
              <input
                type="email"
                value={user?.email || ''}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                readOnly
              />
            </div>

            
          </div>
        </div>

        {/* Stats */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            İstatistikler
          </h3>
          
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg">
                  <span className="text-xl">📝</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Toplam Blog</p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">12</p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 dark:bg-green-800 rounded-lg">
                  <span className="text-xl">👁️</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">Toplam Görüntüleme</p>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">1,234</p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 dark:bg-purple-800 rounded-lg">
                  <span className="text-xl">❤️</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Toplam Beğeni</p>
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">89</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function UserPosts({ blogs, loading }: { blogs: any[], loading: boolean }) {
  const router = useRouter()

  if (loading) {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Yazılarım
          </h2>
          <button
            onClick={() => router.push('/create')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Yeni Yazı Oluştur
          </button>
        </div>
        
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Yazılarım
        </h2>
        <button
          onClick={() => router.push('/create')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Yeni Yazı Oluştur
        </button>
      </div>
      
      {blogs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((blog: any) => (
            <motion.div
              key={blog._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <BlogCard blog={blog} showActions={true} />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">
            📝
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Henüz blog yazınız yok
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            İlk blog yazınızı oluşturun ve topluluğumuzla paylaşın!
          </p>
          <button
            onClick={() => router.push('/create')}
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md shadow-sm hover:bg-blue-700 transition-colors"
          >
            İlk Yazıyı Oluştur
          </button>
        </div>
      )}
    </div>
  )
}

function Settings() {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
        Hesap Ayarları
      </h2>
      
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Şifre Değiştir
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Mevcut Şifre
              </label>
              <input
                type="password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Mevcut şifrenizi girin"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Yeni Şifre
              </label>
              <input
                type="password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Yeni şifrenizi girin"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Yeni Şifre (Tekrar)
              </label>
              <input
                type="password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Yeni şifrenizi tekrar girin"
              />
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Şifreyi Güncelle
            </button>
          </div>
        </div>




      </div>
    </div>
  )
}
