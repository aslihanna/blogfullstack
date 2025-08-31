import { NextRequest, NextResponse } from 'next/server'
import { authenticateToken } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const user = await authenticateToken(req)
    if (!user) {
      return NextResponse.json(
        { error: 'Giriş yapmanız gerekiyor' },
        { status: 401 }
      )
    }

    return NextResponse.json(user)
  } catch (error: any) {
    console.error('Get current user error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
