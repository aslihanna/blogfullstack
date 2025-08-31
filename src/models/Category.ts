import mongoose from 'mongoose'

export interface ICategory extends mongoose.Document {
  name: string
  slug: string
  description?: string
  color?: string
  icon?: string
  isActive: boolean
  blogCount: number
  createdAt: Date
  updatedAt: Date
}

const categorySchema = new mongoose.Schema<ICategory>(
  {
    name: {
      type: String,
      required: [true, 'Kategori adı zorunludur'],
      trim: true,
      maxlength: [50, 'Kategori adı 50 karakterden fazla olamaz'],
      unique: true,
    },
    slug: {
      type: String,
      required: [true, 'Slug zorunludur'],
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      maxlength: [200, 'Açıklama 200 karakterden fazla olamaz'],
    },
    color: {
      type: String,
      default: '#3B82F6', // Blue
      match: [/^#[0-9A-F]{6}$/i, 'Geçerli bir hex renk kodu girin'],
    },
    icon: {
      type: String,
      default: '📝',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    blogCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
)

// Generate slug from name if not provided
categorySchema.pre('save', function (next) {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-')
  }
  next()
})

// Virtual for blogs in this category
categorySchema.virtual('blogs', {
  ref: 'Blog',
  localField: '_id',
  foreignField: 'category',
})

// Ensure virtuals are serialized
categorySchema.set('toJSON', { virtuals: true })
categorySchema.set('toObject', { virtuals: true })

// Index for performance
categorySchema.index({ slug: 1 })
categorySchema.index({ isActive: 1 })
categorySchema.index({ blogCount: -1 })

// Static method to find active categories
categorySchema.statics.findActive = function() {
  return this.find({ isActive: true }).sort({ blogCount: -1, name: 1 })
}

// Static method to find popular categories
categorySchema.statics.findPopular = function(limit = 10) {
  return this.find({ isActive: true }).sort({ blogCount: -1 }).limit(limit)
}

// Instance method to increment blog count
categorySchema.methods.incrementBlogCount = function() {
  this.blogCount += 1
  return this.save()
}

// Instance method to decrement blog count
categorySchema.methods.decrementBlogCount = function() {
  this.blogCount = Math.max(0, this.blogCount - 1)
  return this.save()
}

export default mongoose.models.Category || mongoose.model<ICategory>('Category', categorySchema)



