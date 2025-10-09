import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.userType !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { teacherId, isVerified, canCreateQuestions } = await request.json()

    if (!teacherId || typeof isVerified !== 'boolean') {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const updateData: { isVerified: boolean; canCreateQuestions?: boolean } = { isVerified }
    
    if (typeof canCreateQuestions === 'boolean') {
      updateData.canCreateQuestions = canCreateQuestions
    }

    const teacher = await prisma.teacher.update({
      where: { id: teacherId },
      data: updateData,
      include: {
        user: {
          select: {
            email: true
          }
        }
      }
    })

    const formattedTeacher = {
      id: teacher.id,
      name: teacher.name,
      lastname: teacher.lastname,
      email: teacher.user.email,
      subject: teacher.subject, // Subject is already stored as a name
      school: teacher.school,
      phone: teacher.phone,
      isVerified: teacher.isVerified,
      canCreateQuestions: teacher.canCreateQuestions,
      canReviewAnswers: teacher.canReviewAnswers,
      createdAt: teacher.createdAt,
      updatedAt: teacher.updatedAt
    }

    return NextResponse.json({
      message: `მასწავლებელი ${isVerified ? 'ვერიფიცირებულია' : 'ვერიფიკაცია მოშლილია'}`,
      teacher: formattedTeacher
    })
  } catch (error) {
    console.error('Error updating teacher verification:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
