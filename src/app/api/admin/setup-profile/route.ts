import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Get the current session
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'ავტორიზაცია საჭიროა' },
        { status: 401 }
      )
    }

    const { name, lastname, role = 'ADMIN', permissions = [] } = await request.json()

    if (!name || !lastname) {
      return NextResponse.json(
        { error: 'სახელი და გვარი საჭიროა' },
        { status: 400 }
      )
    }

    // Check if user is admin type
    if (session.user.userType !== 'ADMIN') {
      return NextResponse.json(
        { error: 'მხოლოდ ადმინისტრატორებს შეუძლიათ ამ ფუნქციის გამოყენება' },
        { status: 403 }
      )
    }

    // Check if admin profile already exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { userId: session.user.id }
    })

    if (existingAdmin) {
      return NextResponse.json(
        { error: 'ადმინის პროფილი უკვე არსებობს' },
        { status: 400 }
      )
    }

    // Create admin profile
    const adminProfile = await prisma.admin.create({
      data: {
        userId: session.user.id,
        name,
        lastname,
        role: role as 'SUPER_ADMIN' | 'ADMIN' | 'MODERATOR',
        permissions
      }
    })

    return NextResponse.json({
      message: 'ადმინის პროფილი წარმატებით შეიქმნა',
      admin: adminProfile
    })

  } catch (error) {
    console.error('Error setting up admin profile:', error)
    return NextResponse.json(
      { error: 'სერვერის შეცდომა' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'ავტორიზაცია საჭიროა' },
        { status: 401 }
      )
    }

    if (session.user.userType !== 'ADMIN') {
      return NextResponse.json(
        { error: 'მხოლოდ ადმინისტრატორებს შეუძლიათ ამ ფუნქციის გამოყენება' },
        { status: 403 }
      )
    }

    // Get admin profile
    const adminProfile = await prisma.admin.findUnique({
      where: { userId: session.user.id }
    })

    return NextResponse.json({
      hasProfile: !!adminProfile,
      admin: adminProfile
    })

  } catch (error) {
    console.error('Error getting admin profile:', error)
    return NextResponse.json(
      { error: 'სერვერის შეცდომა' },
      { status: 500 }
    )
  }
}
