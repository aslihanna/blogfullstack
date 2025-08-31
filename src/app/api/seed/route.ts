import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Category from '@/models/Category'

const defaultCategories = [
  {
    name: 'Teknoloji',
    slug: 'teknoloji',
    description: 'Teknoloji dünyasından en son haberler ve gelişmeler',
    color: '#3B82F6',
    icon: '💻'
  },
  {
    name: 'Bilim',
    slug: 'bilim',
    description: 'Bilimsel araştırmalar ve keşifler',
    color: '#10B981',
    icon: '🔬'
  },
  {
    name: 'Sağlık',
    slug: 'saglik',
    description: 'Sağlık ve yaşam tarzı ile ilgili içerikler',
    color: '#EF4444',
    icon: '🏥'
  },
  {
    name: 'Eğitim',
    slug: 'egitim',
    description: 'Eğitim ve öğrenme ile ilgili makaleler',
    color: '#8B5CF6',
    icon: '📚'
  },
  {
    name: 'Spor',
    slug: 'spor',
    description: 'Spor dünyasından haberler ve analizler',
    color: '#F59E0B',
    icon: '⚽'
  },
  {
    name: 'Sanat',
    slug: 'sanat',
    description: 'Sanat, kültür ve yaratıcılık',
    color: '#EC4899',
    icon: '🎨'
  },
  {
    name: 'Politika',
    slug: 'politika',
    description: 'Politika ve güncel olaylar',
    color: '#6B7280',
    icon: '🏛️'
  },
  {
    name: 'Ekonomi',
    slug: 'ekonomi',
    description: 'Ekonomi ve finans dünyası',
    color: '#059669',
    icon: '💰'
  },
  {
    name: 'Yaşam',
    slug: 'yasam',
    description: 'Günlük yaşam ve kişisel gelişim',
    color: '#F97316',
    icon: '🌟'
  },
  {
    name: 'Diğer',
    slug: 'diger',
    description: 'Diğer konular',
    color: '#6366F1',
    icon: '📝'
  }
]

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const results = {
      categories: { created: 0, existing: 0 }
    }

    // Kategorileri oluştur
    console.log('Kategoriler oluşturuluyor...')
    
    for (const categoryData of defaultCategories) {
      try {
        const existingCategory = await Category.findOne({ name: categoryData.name })
        
        if (!existingCategory) {
          const category = new Category(categoryData)
          await category.save()
          results.categories.created++
          console.log(`✅ ${categoryData.name} kategorisi oluşturuldu`)
        } else {
          results.categories.existing++
          console.log(`⏭️ ${categoryData.name} kategorisi zaten mevcut`)
        }
      } catch (categoryError) {
        console.error(`Kategori oluşturma hatası (${categoryData.name}):`, categoryError)
      }
    }

    return NextResponse.json({
      message: 'Kategoriler başarıyla oluşturuldu',
      results
    })
  } catch (error: any) {
    console.error('Seed hatası:', error)
    return NextResponse.json(
      { 
        error: 'Seed işlemi başarısız',
        details: error.message 
      },
      { status: 500 }
    )
  }
}
