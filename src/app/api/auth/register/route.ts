import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { generateToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    await connectDB()

    const { name, email, password } = await req.json()

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Name, email and password are required' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json(
        { message: 'User already exists' },
        { status: 400 }
      )
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      role: 'user'
    })

    await user.save()

    // Generate token
    const token = generateToken(user._id.toString())

    // Return user data without password
    const userResponse = user.toJSON()
    delete userResponse.password

    return NextResponse.json({
      message: 'Registration successful',
      user: userResponse,
      token,
    })
  } catch (error: any) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
