import mongoose from 'mongoose'

export interface IComment {
  _id: mongoose.Types.ObjectId
  content: string
  author: {
    _id: mongoose.Types.ObjectId
    name: string
  }
  createdAt: Date
  updatedAt: Date
}

export interface IBlog extends mongoose.Document {
  title: string
  content: string
  excerpt: string
  author: mongoose.Types.ObjectId
  category: mongoose.Types.ObjectId
  tags: mongoose.Types.ObjectId[]
  image?: string
  views: number
  commentCount: number
  likes: mongoose.Types.ObjectId[]
  comments: IComment[]
  status: 'draft' | 'published' | 'archived'
  featured: boolean
  readTime: number
  slug: string
  metaDescription?: string
  createdAt: Date
  updatedAt: Date
}

const commentSchema = new mongoose.Schema<IComment>(
  {
    content: {
      type: String,
      required: [true, 'Yorum içeriği zorunludur'],
      trim: true,
      maxlength: [1000, 'Yorum 1000 karakterden fazla olamaz'],
    },
    author: {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
    },
  },
  {
    timestamps: true,
  }
)

const blogSchema = new mongoose.Schema<IBlog>(
  {
    title: {
      type: String,
      required: [true, 'Başlık zorunludur'],
      trim: true,
      maxlength: [200, 'Başlık 200 karakterden fazla olamaz'],
    },
    content: {
      type: String,
      required: [true, 'İçerik zorunludur'],
    },
    excerpt: {
      type: String,
      required: [true, 'Özet zorunludur'],
      maxlength: [300, 'Özet 300 karakterden fazla olamaz'],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Kategori zorunludur'],
    },
    tags: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tag',
      },
    ],
    image: {
      type: String,
    },
    views: {
      type: Number,
      default: 0,
    },
    commentCount: {
      type: Number,
      default: 0,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    comments: [commentSchema],
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'published',
    },
    featured: {
      type: Boolean,
      default: false,
    },
    readTime: {
      type: Number,
      default: 0,
    },
    slug: {
      type: String,
      required: true,
    },
    metaDescription: {
      type: String,
      maxlength: [160, 'Meta açıklama 160 karakterden fazla olamaz'],
    },
  },
  {
    timestamps: true,
  }
)

// Create excerpt from content if not provided
blogSchema.pre('save', function (next) {
  if (!this.excerpt && this.content) {
    this.excerpt = this.content.substring(0, 150) + '...'
  }
  
  // Calculate read time (average reading speed: 200 words per minute)
  if (this.content) {
    const wordCount = this.content.split(/\s+/).length
    this.readTime = Math.ceil(wordCount / 200)
  }
  
  // Generate slug from title if not provided
  if (!this.slug && this.title) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-')
  }
  
  // Generate meta description if not provided
  if (!this.metaDescription && this.excerpt) {
    this.metaDescription = this.excerpt.substring(0, 160)
  }
  
  next()
})

// Virtual for like count
blogSchema.virtual('likeCount').get(function () {
  return this.likes.length
})

// Virtual for author info
blogSchema.virtual('authorInfo', {
  ref: 'User',
  localField: 'author',
  foreignField: '_id',
  justOne: true,
})

// Ensure virtuals are serialized
blogSchema.set('toJSON', { virtuals: true })
blogSchema.set('toObject', { virtuals: true })

// Index for search
blogSchema.index({ title: 'text', content: 'text', tags: 'text' })

// Index for performance
blogSchema.index({ status: 1, createdAt: -1 })
blogSchema.index({ category: 1, createdAt: -1 })
blogSchema.index({ author: 1, createdAt: -1 })
blogSchema.index({ featured: 1, createdAt: -1 })
blogSchema.index({ slug: 1 })

// Static method to find published blogs
blogSchema.statics.findPublished = function() {
  return this.find({ status: 'published' }).sort({ createdAt: -1 })
}

// Static method to find featured blogs
blogSchema.statics.findFeatured = function() {
  return this.find({ status: 'published', featured: true }).sort({ createdAt: -1 })
}

// Static method to find blogs by category
blogSchema.statics.findByCategory = function(categoryId: mongoose.Types.ObjectId) {
  return this.find({ status: 'published', category: categoryId }).sort({ createdAt: -1 })
}

// Instance method to increment views
blogSchema.methods.incrementViews = function() {
  this.views += 1
  return this.save()
}

// Instance method to toggle like
blogSchema.methods.toggleLike = function(userId: string) {
  const likeIndex = this.likes.indexOf(userId)
  if (likeIndex > -1) {
    this.likes.splice(likeIndex, 1)
  } else {
    this.likes.push(userId)
  }
  return this.save()
}

// Instance method to add comment
blogSchema.methods.addComment = function(comment: IComment) {
  this.comments.push(comment)
  return this.save()
}

export default mongoose.models.Blog || mongoose.model<IBlog>('Blog', blogSchema)
