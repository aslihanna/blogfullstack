import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { toast } from 'react-toastify'

export interface Blog {
  _id: string
  title: string
  content: string
  excerpt: string
  author: {
    _id: string
    name: string
    email: string
  }
  category: string
  tags: string[]
  image?: string
  views: number
  likes: string[]
  comments: Comment[]
  createdAt: string
  updatedAt: string
}

export interface Comment {
  _id: string
  content: string
  author: {
    _id: string
    name: string
  }
  createdAt: string
}

interface BlogState {
  blogs: Blog[]
  currentBlog: Blog | null
  loading: boolean
  error: string | null
  searchTerm: string
  selectedCategory: string
  selectedTags: string[]
  hasMore: boolean
  totalPages: number
  currentPage: number
}

const initialState: BlogState = {
  blogs: [],
  currentBlog: null,
  loading: false,
  error: null,
  searchTerm: '',
  selectedCategory: '',
  selectedTags: [],
  hasMore: true,
  totalPages: 1,
  currentPage: 1,
}

// Async thunks
export const fetchBlogs = createAsyncThunk(
  'blog/fetchBlogs',
  async (params: { page?: number; limit?: number; append?: boolean } = {}, { rejectWithValue }) => {
    try {
      const searchParams = new URLSearchParams()
      if (params.page) searchParams.append('page', params.page.toString())
      if (params.limit) searchParams.append('limit', params.limit.toString())
      
      const response = await fetch(`/api/blogs?${searchParams.toString()}`)
      if (!response.ok) {
        throw new Error('Failed to fetch blogs')
      }
      const data = await response.json()
      return { ...data, append: params.append }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'An error occurred')
    }
  }
)

export const fetchBlogById = createAsyncThunk(
  'blog/fetchBlogById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/blogs/${id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch blog')
      }
      const data = await response.json()
      return data
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'An error occurred')
    }
  }
)

export const createBlog = createAsyncThunk(
  'blog/createBlog',
  async (blogData: Partial<Blog>, { rejectWithValue }) => {
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token')
      
      if (!token) {
        console.error('No token found in localStorage')
        throw new Error('Authentication required')
      }

      console.log('=== CREATE BLOG START ===')
      console.log('Blog data to send:', blogData)
      console.log('Token exists:', !!token)
      
      const response = await fetch('/api/blogs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(blogData),
      })
      
      console.log('Response status:', response.status)
      console.log('Response ok:', response.ok)
      console.log('Response headers:', Object.fromEntries(response.headers.entries()))
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('API Error:', errorData)
        throw new Error(errorData.error || errorData.message || 'Failed to create blog')
      }
      
      const data = await response.json()
      console.log('API Success Response:', data)
      return data
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'An error occurred')
    }
  }
)

export const updateBlog = createAsyncThunk(
  'blog/updateBlog',
  async ({ id, blogData }: { id: string; blogData: Partial<Blog> }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      
      if (!token) {
        throw new Error('Authentication required')
      }

      const response = await fetch(`/api/blogs/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(blogData),
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to update blog')
      }
      const data = await response.json()
      return data
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'An error occurred')
    }
  }
)

export const deleteBlog = createAsyncThunk(
  'blog/deleteBlog',
  async (id: string, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      
      if (!token) {
        throw new Error('Authentication required')
      }

      const response = await fetch(`/api/blogs/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to delete blog')
      }
      return id
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'An error occurred')
    }
  }
)

export const likeBlog = createAsyncThunk(
  'blog/likeBlog',
  async (id: string, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      
      if (!token) {
        throw new Error('Authentication required')
      }

      const response = await fetch(`/api/blogs/${id}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to like blog')
      }
      const data = await response.json()
      return { id, likes: data.likes }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'An error occurred')
    }
  }
)

const blogSlice = createSlice({
  name: 'blog',
  initialState,
  reducers: {
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload
    },
    setSelectedCategory: (state, action: PayloadAction<string>) => {
      state.selectedCategory = action.payload
    },
    setSelectedTags: (state, action: PayloadAction<string[]>) => {
      state.selectedTags = action.payload
    },
    clearCurrentBlog: (state) => {
      state.currentBlog = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch blogs
      .addCase(fetchBlogs.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchBlogs.fulfilled, (state, action) => {
        state.loading = false
        const { blogs, pagination, append } = action.payload
        
        if (append && blogs) {
          // Append new blogs to existing ones
          state.blogs = [...state.blogs, ...blogs]
        } else if (blogs) {
          // Replace blogs (first page or search/filter)
          state.blogs = blogs
        }
        
        // Update pagination info
        if (pagination) {
          state.hasMore = pagination.hasNextPage
          state.totalPages = pagination.totalPages
          state.currentPage = pagination.currentPage
        }
      })
      .addCase(fetchBlogs.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Fetch blog by id
      .addCase(fetchBlogById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchBlogById.fulfilled, (state, action) => {
        state.loading = false
        state.currentBlog = action.payload
      })
      .addCase(fetchBlogById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Create blog
      .addCase(createBlog.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createBlog.fulfilled, (state, action) => {
  state.loading = false
  console.log('Create blog fulfilled with payload:', action.payload)
  const newBlog = action.payload.blog || action.payload
  console.log('New blog to add:', newBlog)
  state.blogs.unshift(newBlog)
  console.log('Blogs state after adding:', state.blogs.length)
  // Başarı mesajı göster
  toast.success('Blog yazısı başarıyla yayınlandı!', {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  })
})
      .addCase(createBlog.rejected, (state, action) => {
  state.loading = false
  state.error = action.payload as string
  // Hata mesajı göster
  toast.error(`Blog yazısı yayınlanamadı: ${action.payload}`, {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  })
})
      // Update blog
      .addCase(updateBlog.fulfilled, (state, action) => {
        const index = state.blogs.findIndex(blog => blog._id === action.payload._id)
        if (index !== -1) {
          state.blogs[index] = action.payload
        }
        if (state.currentBlog?._id === action.payload._id) {
          state.currentBlog = action.payload
        }
        // Başarı mesajı göster
        toast.success('Blog yazısı başarıyla güncellendi!', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        })
      })
      // Delete blog
      .addCase(deleteBlog.fulfilled, (state, action) => {
        state.blogs = state.blogs.filter(blog => blog._id !== action.payload)
        if (state.currentBlog?._id === action.payload) {
          state.currentBlog = null
        }
        // Başarı mesajı göster
        toast.success('Blog yazısı başarıyla silindi!', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        })
      })
      // Like blog
      .addCase(likeBlog.fulfilled, (state, action) => {
        const { id, likes } = action.payload
        const blog = state.blogs.find(b => b._id === id)
        if (blog) {
          blog.likes = likes
        }
        if (state.currentBlog?._id === id) {
          state.currentBlog.likes = likes
        }
      })
  },
})

export const {
  setSearchTerm,
  setSelectedCategory,
  setSelectedTags,
  clearCurrentBlog,
} = blogSlice.actions

export default blogSlice.reducer
