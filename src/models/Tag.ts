import mongoose from 'mongoose'

export interface ITag extends mongoose.Document {
  name: string
  slug: string
  description?: string
  color?: string
  isActive: boolean
  blogCount: number
  createdAt: Date
  updatedAt: Date
}

const tagSchema = new mongoose.Schema<ITag>(
  {
    name: {
      type: String,
      required: [true, 'Etiket adı zorunludur'],
      trim: true,
      maxlength: [30, 'Etiket adı 30 karakterden fazla olamaz'],
      unique: true,
      lowercase: true,
    },
    slug: {
      type: String,
      required: [true, 'Slug zorunludur'],
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      maxlength: [150, 'Açıklama 150 karakterden fazla olamaz'],
    },
    color: {
      type: String,
      default: '#6B7280', // Gray
      match: [/^#[0-9A-F]{6}$/i, 'Geçerli bir hex renk kodu girin'],
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
tagSchema.pre('save', function (next) {
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

// Virtual for blogs with this tag
tagSchema.virtual('blogs', {
  ref: 'Blog',
  localField: '_id',
  foreignField: 'tags',
})

// Ensure virtuals are serialized
tagSchema.set('toJSON', { virtuals: true })
tagSchema.set('toObject', { virtuals: true })

// Index for performance
tagSchema.index({ slug: 1 })
tagSchema.index({ isActive: 1 })
tagSchema.index({ blogCount: -1 })
tagSchema.index({ name: 'text' })

// Static method to find active tags
tagSchema.statics.findActive = function() {
  return this.find({ isActive: true }).sort({ blogCount: -1, name: 1 })
}

// Static method to find popular tags
tagSchema.statics.findPopular = function(limit = 20) {
  return this.find({ isActive: true }).sort({ blogCount: -1 }).limit(limit)
}

// Static method to find tags by search term
tagSchema.statics.findBySearch = function(searchTerm: string) {
  return this.find({
    isActive: true,
    $or: [
      { name: { $regex: searchTerm, $options: 'i' } },
      { description: { $regex: searchTerm, $options: 'i' } }
    ]
  }).sort({ blogCount: -1 })
}

// Instance method to increment blog count
tagSchema.methods.incrementBlogCount = function() {
  this.blogCount += 1
  return this.save()
}

// Instance method to decrement blog count
tagSchema.methods.decrementBlogCount = function() {
  this.blogCount = Math.max(0, this.blogCount - 1)
  return this.save()
}

export default mongoose.models.Tag || mongoose.model<ITag>('Tag', tagSchema)



