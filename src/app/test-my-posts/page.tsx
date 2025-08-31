'use client'

import { useEffect, useState } from 'react'

export default function TestMyPosts() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const testAPI = async () => {
      try {
        console.log('=== TEST MY POSTS START ===')
        const token = localStorage.getItem('token')
        console.log('Token:', token ? 'Exists' : 'Not found')
        
        if (!token) {
          setError('Token bulunamadı')
          setLoading(false)
          return
        }

        const response = await fetch('/api/blogs/my-posts', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        console.log('Response status:', response.status)
        
        if (!response.ok) {
          const errorText = await response.text()
          console.error('Error response:', errorText)
          setError(`API Error: ${response.status} - ${errorText}`)
        } else {
          const result = await response.json()
          console.log('Success response:', result)
          setData(result)
        }
      } catch (error) {
        console.error('Fetch error:', error)
        setError(`Fetch error: ${error}`)
      } finally {
        setLoading(false)
      }
    }

    testAPI()
  }, [])

  if (loading) {
    return <div className="p-8">Yükleniyor...</div>
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Hata</h1>
        <pre className="bg-gray-100 p-4 rounded">{error}</pre>
      </div>
    )
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test My Posts</h1>
      <pre className="bg-gray-100 p-4 rounded overflow-auto">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  )
}


