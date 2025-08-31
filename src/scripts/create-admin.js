require('dotenv').config({ path: '.env.local' })
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

// MongoDB bağlantısı
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('MongoDB bağlandı')
  } catch (error) {
    console.error('MongoDB bağlantı hatası:', error)
    process.exit(1)
  }
}

// User modeli
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  isVerified: {
    type: Boolean,
    default: true,
  },
  loginCount: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
})

// Şifre hash'leme
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  
  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error)
  }
})

const User = mongoose.models.User || mongoose.model('User', userSchema)

// Admin kullanıcı oluşturma fonksiyonu
const createAdmin = async () => {
  try {
    await connectDB()
    
    // Mevcut admin kontrolü
    const existingAdmin = await User.findOne({ email: 'admin@blogapp.com' })
    
    if (existingAdmin) {
      console.log('Admin kullanıcı zaten mevcut!')
      console.log('Email:', existingAdmin.email)
      console.log('Şifre: admin123')
      process.exit(0)
    }
    
    // Yeni admin oluştur
    const adminUser = new User({
      name: 'Admin',
      email: 'admin@blogapp.com',
      password: 'admin123',
      role: 'admin',
      isVerified: true,
    })
    
    await adminUser.save()
    
    console.log('✅ Admin kullanıcı başarıyla oluşturuldu!')
    console.log('Email: admin@blogapp.com')
    console.log('Şifre: admin123')
    console.log('Bu bilgilerle giriş yapabilirsiniz.')
    
  } catch (error) {
    console.error('❌ Admin oluşturma hatası:', error)
  } finally {
    await mongoose.disconnect()
    process.exit(0)
  }
}

// Script'i çalıştır
createAdmin()
