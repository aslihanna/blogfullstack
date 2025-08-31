import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'

export interface Comment {
  _id: string
  content: string
  author: {
    _id: string
    name: string
  }
  blogId: string
  createdAt: string
  updatedAt: string
}

interface CommentState {
  comments: Comment[]
  loading: boolean
  error: string | null
}

const initialState: CommentState = {
  comments: [],
  loading: false,
  error: null,
}

// Async thunks
export const fetchComments = createAsyncThunk(
  'comment/fetchComments',
  async (blogId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/blogs/${blogId}/comments`)
      if (!response.ok) {
        throw new Error('Failed to fetch comments')
      }
      const data = await response.json()
      return data
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'An error occurred')
    }
  }
)

export const addComment = createAsyncThunk(
  'comment/addComment',
  async ({ blogId, content }: { blogId: string; content: string }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/blogs/${blogId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to add comment')
      }
      const data = await response.json()
      return data
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'An error occurred')
    }
  }
)

export const updateComment = createAsyncThunk(
  'comment/updateComment',
  async ({ blogId, commentId, content }: { blogId: string; commentId: string; content: string }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/blogs/${blogId}/comments/${commentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update comment')
      }
      const data = await response.json()
      return data
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'An error occurred')
    }
  }
)

export const deleteComment = createAsyncThunk(
  'comment/deleteComment',
  async ({ blogId, commentId }: { blogId: string; commentId: string }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/blogs/${blogId}/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to delete comment')
      }
      return commentId
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'An error occurred')
    }
  }
)

const commentSlice = createSlice({
  name: 'comment',
  initialState,
  reducers: {
    clearComments: (state) => {
      state.comments = []
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch comments
      .addCase(fetchComments.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.loading = false
        state.comments = action.payload
      })
      .addCase(fetchComments.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Add comment
      .addCase(addComment.fulfilled, (state, action) => {
        state.comments.push(action.payload)
      })
      // Update comment
      .addCase(updateComment.fulfilled, (state, action) => {
        const index = state.comments.findIndex(comment => comment._id === action.payload._id)
        if (index !== -1) {
          state.comments[index] = action.payload
        }
      })
      // Delete comment
      .addCase(deleteComment.fulfilled, (state, action) => {
        state.comments = state.comments.filter(comment => comment._id !== action.payload)
      })
  },
})

export const { clearComments, clearError } = commentSlice.actions

export default commentSlice.reducer



