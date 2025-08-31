'use client'

import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  FileText, 
  Users, 
  Tag, 
  BarChart3, 
  Eye,
  ArrowLeft
} from 'lucide-react'

interface DashboardStats {
  totalBlogs: number
  totalUsers: number
  totalCategories: number
  totalViews: number
}

export default function AdminStatsPage() {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth)
  const [stats, setStats] = useState<DashboardStats>({
    totalBlogs: 0,
    totalUsers: 0,
    totalCategories: 0,
    totalViews: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await fetch('/api/admin/stats', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error('Stats fetch error:', error)
      } finally {
        setLoading(false)
      }
    }

    if (isAuthenticated && user?.role === 'admin') {
      fetchStats()
    }
  }, [isAuthenticated, user])

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Giriş Yapmanız Gerekiyor
          </h1>
          <Link
            href="/login"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Giriş Yap
          </Link>
        </div>
      </div>
    )
  }

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Yetkiniz Yok
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Bu sayfaya erişmek için admin yetkisine sahip olmanız gerekiyor.
          </p>
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    )
  }

  const statCards = [
    {
      title: 'Toplam Blog',
      value: stats.totalBlogs,
      icon: FileText,
      color: 'bg-blue-500',
      description: 'Sitedeki toplam blog yazısı sayısı'
    },
    {
      title: 'Toplam Kullanıcı',
      value: stats.totalUsers,
      icon: Users,
      color: 'bg-green-500',
      description: 'Kayıtlı kullanıcı sayısı'
    },
    {
      title: 'Toplam Kategori',
      value: stats.totalCategories,
      icon: Tag,
      color: 'bg-purple-500',
      description: 'Blog kategorilerinin sayısı'
    },
    {
      title: 'Toplam Görüntülenme',
      value: stats.totalViews,
      icon: Eye,
      color: 'bg-orange-500',
      description: 'Tüm blogların toplam görüntülenme sayısı'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <Link
                href="/admin"
                className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mr-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Geri Dön
              </Link>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Site İstatistikleri
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Sitenizin genel istatistiklerini görüntüleyin
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
              >
                <div className="flex items-center mb-4">
                  <div className={`p-3 rounded-lg ${stat.color} text-white`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {loading ? '...' : stat.value.toLocaleString()}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {stat.description}
                </p>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Blog İstatistikleri
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Toplam Blog:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {loading ? '...' : stats.totalBlogs.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Toplam Görüntülenme:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {loading ? '...' : stats.totalViews.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Ortalama Görüntülenme:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {loading ? '...' : stats.totalBlogs > 0 ? Math.round(stats.totalViews / stats.totalBlogs).toLocaleString() : '0'}
                  </span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Kullanıcı İstatistikleri
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Toplam Kullanıcı:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {loading ? '...' : stats.totalUsers.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Toplam Kategori:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {loading ? '...' : stats.totalCategories.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Blog/Kullanıcı Oranı:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {loading ? '...' : stats.totalUsers > 0 ? (stats.totalBlogs / stats.totalUsers).toFixed(1) : '0'}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
