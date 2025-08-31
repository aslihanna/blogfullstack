import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Category from '@/models/Category'
import { authenticateToken } from '@/lib/auth'

// GET - Tüm kategorileri getir
export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const active = searchParams.get('active')
    const popular = searchParams.get('popular')
    const limit = parseInt(searchParams.get('limit') || '50')
    
    let query = {}
    if (active === 'true') {
      query = { isActive: true }
    }
    
    let categories
    if (popular === 'true') {
      categories = await Category.findPopular(limit)
    } else {
      categories = await Category.find(query)
        .sort({ blogCount: -1, name: 1 })
        .limit(limit)
    }

    return NextResponse.json({ categories })
  } catch (error: any) {
    console.error('Kategorileri getirme hatası:', error)
    return NextResponse.json(
      { error: 'Kategoriler getirilemedi' },
      { status: 500 }
    )
  }
}

// POST - Yeni kategori oluştur (sadece admin)
export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    // Admin doğrulama
    const user = await authenticateToken(request)
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin yetkisi gerekli' },
        { status: 403 }
      )
    }

    const { name, description, color, icon } = await request.json()
    
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Kategori adı zorunludur' },
        { status: 400 }
      )
    }

    // Aynı isimde kategori var mı kontrol et
    const existingCategory = await Category.findOne({ name: name.trim() })
    if (existingCategory) {
      return NextResponse.json(
        { error: 'Bu isimde bir kategori zaten mevcut' },
        { status: 400 }
      )
    }

    const category = new Category({
      name: name.trim(),
      description: description?.trim(),
      color: color || '#3B82F6',
      icon: icon || '📝',
    })

    await category.save()

    return NextResponse.json(
      { 
        message: 'Kategori başarıyla oluşturuldu',
        category 
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Kategori oluşturma hatası:', error)
    return NextResponse.json(
      { error: 'Kategori oluşturulamadı' },
      { status: 500 }
    )
  }
}



