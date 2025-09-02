import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function PUT(request: NextRequest) {
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

    const { teacherId, canReviewAnswers } = await request.json()

    if (!teacherId || typeof canReviewAnswers !== 'boolean') {
      return NextResponse.json(
        { error: 'არასწორი მონაცემები' },
        { status: 400 }
      )
    }

    // Check if teacher exists
    const teacher = await prisma.teacher.findUnique({
      where: { id: teacherId }
    })

    if (!teacher) {
      return NextResponse.json(
        { error: 'მასწავლებელი ვერ მოიძებნა' },
        { status: 404 }
      )
    }

    // Update teacher permissions
    const updatedTeacher = await prisma.teacher.update({
      where: { id: teacherId },
      data: { canReviewAnswers }
    })

    return NextResponse.json({
      message: 'უფლებები წარმატებით განახლდა',
      teacher: {
        id: updatedTeacher.id,
        canReviewAnswers: updatedTeacher.canReviewAnswers
      }
    })

  } catch (error) {
    console.error('Error updating teacher permissions:', error)
    return NextResponse.json(
      { error: 'სერვერის შეცდომა' },
      { status: 500 }
    )
  }
}
