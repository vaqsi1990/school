import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'ავტორიზაცია საჭიროა' },
        { status: 401 }
      )
    }

    if (session.user.userType !== 'TEACHER') {
      return NextResponse.json(
        { error: 'მხოლოდ მასწავლებლებს შეუძლიათ ამ ფუნქციის გამოყენება' },
        { status: 403 }
      )
    }

    // Get teacher's permissions
    const teacher = await prisma.teacher.findUnique({
      where: { userId: session.user.id },
      select: {
        canReviewAnswers: true
      }
    })

    if (!teacher) {
      return NextResponse.json(
        { error: 'მასწავლებელი ვერ მოიძებნა' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      canReviewAnswers: teacher.canReviewAnswers
    })

  } catch (error) {
    console.error('Error checking teacher permissions:', error)
    return NextResponse.json(
      { error: 'სერვერის შეცდომა' },
      { status: 500 }
    )
  }
}
