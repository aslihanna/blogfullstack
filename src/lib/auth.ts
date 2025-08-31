import jwt from 'jsonwebtoken'
import { NextRequest, NextResponse } from 'next/server'
import User from '@/models/User'
import connectDB from './mongodb'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export interface AuthRequest extends NextRequest {
  user?: any
}

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

export async function authenticateToken(req: NextRequest): Promise<any | null> {
  try {
    await connectDB()
    
    const authHeader = req.headers.get('authorization')
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
      return null
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return null
    }

    const user = await User.findById(decoded.userId).select('-password')
    if (!user) {
      return null
    }

    return user
  } catch (error) {
    console.error('Authentication error:', error)
    return null
  }
}

export function requireAuth(handler: Function) {
  return async (req: AuthRequest) => {
    const authResult = await authenticateToken(req)
    if (authResult) return authResult
    return handler(req)
  }
}

export function requireAdmin(handler: Function) {
  return async (req: AuthRequest) => {
    const authResult = await authenticateToken(req)
    if (authResult) return authResult

    if (req.user.role !== 'admin') {
      return NextResponse.json({ message: 'Admin access required' }, { status: 403 })
    }

    return handler(req)
  }
}
