import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendPasswordResetEmail } from '@/lib/email'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'ელ-ფოსტა საჭიროა' },
        { status: 400 }
      )
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (!user) {
      // Don't reveal if user exists or not for security
      return NextResponse.json({
        message: 'თუ ელ-ფოსტა არსებობს, პაროლის აღდგენის ლინკი გაიგზავნება'
      })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Save reset token to database
    await prisma.passwordResetToken.upsert({
      where: { email: email.toLowerCase() },
      update: {
        token: resetToken,
        expires: resetTokenExpiry
      },
      create: {
        email: email.toLowerCase(),
        token: resetToken,
        expires: resetTokenExpiry
      }
    })

    // Send password reset email
    try {
      await sendPasswordResetEmail(email, resetToken)
    } catch (emailError) {
      console.error('Email sending failed:', emailError)
      // Delete the token if email fails
      await prisma.passwordResetToken.delete({
        where: { email: email.toLowerCase() }
      })
      return NextResponse.json(
        { error: 'ელ-ფოსტის გაგზავნა ვერ მოხერხდა. გთხოვთ სცადოთ მოგვიანებით' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'პაროლის აღდგენის ლინკი გაიგზავნა თქვენს ელ-ფოსტაზე'
    })

  } catch (error) {
    console.error('Error requesting password reset:', error)
    return NextResponse.json(
      { error: 'სერვერის შეცდომა' },
      { status: 500 }
    )
  }
}
