import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

export interface IUser extends mongoose.Document {
  name: string
  email: string
  password: string
  role: 'user' | 'admin'
  avatar?: string
  bio?: string
  website?: string
  socialLinks?: {
    twitter?: string
    linkedin?: string
    github?: string
  }
  isVerified: boolean
  lastLogin?: Date
  loginCount: number
  createdAt: Date
  updatedAt: Date
  comparePassword(candidatePassword: string): Promise<boolean>
}

const userSchema = new mongoose.Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Ad zorunludur'],
      trim: true,
      maxlength: [50, 'Ad 50 karakterden fazla olamaz'],
    },
    email: {
      type: String,
      required: [true, 'E-posta zorunludur'],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Geçerli bir e-posta adresi girin'],
    },
    password: {
      type: String,
      required: [true, 'Şifre zorunludur'],
      minlength: [6, 'Şifre en az 6 karakter olmalıdır'],
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    avatar: {
      type: String,
    },
    bio: {
      type: String,
      maxlength: [500, 'Biyografi 500 karakterden fazla olamaz'],
    },
    website: {
      type: String,
      match: [/^https?:\/\/.+/, 'Geçerli bir website URL\'si girin'],
    },
    socialLinks: {
      twitter: {
        type: String,
        match: [/^https?:\/\/(www\.)?twitter\.com\/.+/, 'Geçerli bir Twitter URL\'si girin'],
      },
      linkedin: {
        type: String,
        match: [/^https?:\/\/(www\.)?linkedin\.com\/.+/, 'Geçerli bir LinkedIn URL\'si girin'],
      },
      github: {
        type: String,
        match: [/^https?:\/\/(www\.)?github\.com\/.+/, 'Geçerli bir GitHub URL\'si girin'],
      },
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
    },
    loginCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
)

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()

  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error: any) {
    next(error)
  }
})

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password)
}

// Remove password from JSON output
userSchema.methods.toJSON = function () {
  const user = this.toObject()
  delete user.password
  return user
}

// Virtual for user's blogs
userSchema.virtual('blogs', {
  ref: 'Blog',
  localField: '_id',
  foreignField: 'author',
})

// Virtual for user's liked blogs
userSchema.virtual('likedBlogs', {
  ref: 'Blog',
  localField: '_id',
  foreignField: 'likes',
})

// Ensure virtuals are serialized
userSchema.set('toJSON', { virtuals: true })
userSchema.set('toObject', { virtuals: true })

// Index for performance
userSchema.index({ email: 1 })
userSchema.index({ role: 1 })
userSchema.index({ isVerified: 1 })

// Static method to find admins
userSchema.statics.findAdmins = function() {
  return this.find({ role: 'admin' })
}

// Static method to find verified users
userSchema.statics.findVerified = function() {
  return this.find({ isVerified: true })
}

// Instance method to update last login
userSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date()
  this.loginCount += 1
  return this.save()
}

// Instance method to verify user
userSchema.methods.verify = function() {
  this.isVerified = true
  return this.save()
}

export default mongoose.models.User || mongoose.model<IUser>('User', userSchema)
