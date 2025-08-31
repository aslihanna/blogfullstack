'use client'

import { Provider } from 'react-redux'
import { store } from '@/store'
import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { getCurrentUser } from '@/store/authSlice'
import { setTheme } from '@/store/themeSlice'

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Provider store={store}>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </Provider>
    )
  }

  return (
    <Provider store={store}>
      <ThemeInitializer />
      {children}
    </Provider>
  )
}

function ThemeInitializer() {
  const dispatch = useDispatch()

  useEffect(() => {
    // Initialize theme
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark'
    if (savedTheme) {
      dispatch(setTheme(savedTheme))
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      dispatch(setTheme(prefersDark ? 'dark' : 'light'))
    }

    // Check authentication status
    const token = localStorage.getItem('token')
    if (token) {
      dispatch(getCurrentUser()).catch((error) => {
        console.error('Failed to get current user:', error)
        localStorage.removeItem('token')
      })
    }
  }, [dispatch])

  return null
}
