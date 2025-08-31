import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { authenticateToken } from '@/lib/auth'
import User from '@/models/User'

export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const user = await authenticateToken(req)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Giriş yapmanız gerekiyor' },
        { status: 401 }
      )
    }

    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin yetkisi gerekli' },
        { status: 403 }
      )
    }

    const users = await User.find({})
      .select('-password')
      .sort({ createdAt: -1 })

    return NextResponse.json({ users })
  } catch (error: any) {
    console.error('Admin users fetch error:', error)
    return NextResponse.json(
      { error: 'Kullanıcılar getirilemedi' },
      { status: 500 }
    )
  }
}


