import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    // Get the current session
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      console.log('No session found')
      return NextResponse.json(
        { error: 'ავტორიზაცია საჭიროა' },
        { status: 401 }
      )
    }

    // Check if user is admin
    if (session.user.userType !== 'ADMIN') {
      console.log('User is not admin:', session.user.userType)
      return NextResponse.json(
        { error: 'მხოლოდ ადმინისტრატორებს შეუძლიათ ამ ფუნქციის გამოყენება' },
        { status: 403 }
      )
    }

    const { userId, newPassword } = await request.json()
    console.log('Received password reset request:', { userId, newPassword: newPassword ? '[HIDDEN]' : 'undefined' })

    if (!userId || !newPassword) {
      console.log('Missing required fields:', { userId: !!userId, newPassword: !!newPassword })
      return NextResponse.json(
        { error: 'მომხმარებლის ID და ახალი პაროლი საჭიროა' },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      console.log('Password too short:', newPassword.length)
      return NextResponse.json(
        { error: 'პაროლი უნდა იყოს მინიმუმ 6 სიმბოლო' },
        { status: 400 }
      )
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      console.log('User not found:', userId)
      return NextResponse.json(
        { error: 'მომხმარებელი ვერ მოიძებნა' },
        { status: 404 }
      )
    }

    console.log('User found, updating password for:', user.email)

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 12)

    // Update the user's password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    })

    console.log('Password updated successfully for user:', user.email)

    return NextResponse.json({
      message: 'პაროლი წარმატებით შეიცვალა'
    })

  } catch (error) {
    console.error('Error resetting password:', error)
    return NextResponse.json(
      { error: 'სერვერის შეცდომა' },
      { status: 500 }
    )
  }
}
