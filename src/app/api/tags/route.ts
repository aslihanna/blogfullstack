import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Tag from '@/models/Tag'
import { authenticateToken } from '@/lib/auth'

// GET - Tüm etiketleri getir
export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const active = searchParams.get('active')
    const popular = searchParams.get('popular')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '50')
    
    let query = {}
    if (active === 'true') {
      query = { isActive: true }
    }
    
    let tags
    if (search) {
      tags = await Tag.findBySearch(search)
    } else if (popular === 'true') {
      tags = await Tag.findPopular(limit)
    } else {
      tags = await Tag.find(query)
        .sort({ blogCount: -1, name: 1 })
        .limit(limit)
    }

    return NextResponse.json({ tags })
  } catch (error: any) {
    console.error('Etiketleri getirme hatası:', error)
    return NextResponse.json(
      { error: 'Etiketler getirilemedi' },
      { status: 500 }
    )
  }
}

// POST - Yeni etiket oluştur (sadece admin)
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

    const { name, description, color } = await request.json()
    
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Etiket adı zorunludur' },
        { status: 400 }
      )
    }

    // Aynı isimde etiket var mı kontrol et
    const existingTag = await Tag.findOne({ name: name.trim().toLowerCase() })
    if (existingTag) {
      return NextResponse.json(
        { error: 'Bu isimde bir etiket zaten mevcut' },
        { status: 400 }
      )
    }

    const tag = new Tag({
      name: name.trim().toLowerCase(),
      description: description?.trim(),
      color: color || '#6B7280',
    })

    await tag.save()

    return NextResponse.json(
      { 
        message: 'Etiket başarıyla oluşturuldu',
        tag 
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Etiket oluşturma hatası:', error)
    return NextResponse.json(
      { error: 'Etiket oluşturulamadı' },
      { status: 500 }
    )
  }
}



