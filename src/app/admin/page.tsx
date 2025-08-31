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
  Settings,
  Plus,
  Edit,
  Trash2,
  Eye
} from 'lucide-react'

interface DashboardStats {
  totalBlogs: number
  totalUsers: number
  totalCategories: number
  totalViews: number
}

export default function AdminPage() {
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

  const adminCards = [
    {
      title: 'Blog Yönetimi',
      description: 'Blog yazılarını ekle, düzenle ve sil',
      icon: FileText,
      href: '/admin/blogs',
      color: 'bg-blue-500'
    },
    {
      title: 'Kullanıcı Yönetimi',
      description: 'Kullanıcıları görüntüle ve yönet',
      icon: Users,
      href: '/admin/users',
      color: 'bg-green-500'
    },
    {
      title: 'Kategori Yönetimi',
      description: 'Blog kategorilerini yönet',
      icon: Tag,
      href: '/admin/categories',
      color: 'bg-purple-500'
    },
    {
      title: 'Etiket Yönetimi',
      description: 'Blog etiketlerini yönet',
      icon: Tag,
      href: '/admin/tags',
      color: 'bg-green-500'
    },
    {
      title: 'İstatistikler',
      description: 'Detaylı site istatistiklerini görüntüle',
      icon: BarChart3,
      href: '/admin/stats',
      color: 'bg-orange-500'
    }

  ]

  const statCards = [
    {
      title: 'Toplam Blog',
      value: stats.totalBlogs,
      icon: FileText,
      color: 'bg-blue-500'
    },
    {
      title: 'Toplam Kullanıcı',
      value: stats.totalUsers,
      icon: Users,
      color: 'bg-green-500'
    },
    {
      title: 'Toplam Kategori',
      value: stats.totalCategories,
      icon: Tag,
      color: 'bg-purple-500'
    },
    {
      title: 'Toplam Görüntülenme',
      value: stats.totalViews,
      icon: Eye,
      color: 'bg-orange-500'
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Admin Paneli
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Hoş geldiniz, {user?.name}! Site yönetimi için gerekli araçlar burada.
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
                <div className="flex items-center">
                  <div className={`p-3 rounded-lg ${stat.color} text-white`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {loading ? '...' : stat.value}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {adminCards.map((card, index) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link href={card.href}>
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
                    <div className={`inline-flex p-3 rounded-lg ${card.color} text-white mb-4`}>
                      <card.icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {card.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {card.description}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Hızlı İşlemler
            </h2>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/create"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Yeni Blog Yazısı
              </Link>
              <Link
                href="/admin/categories"
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Tag className="w-4 h-4 mr-2" />
                Kategori Ekle
              </Link>
              <Link
                href="/admin/users"
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Users className="w-4 h-4 mr-2" />
                Kullanıcıları Görüntüle
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
