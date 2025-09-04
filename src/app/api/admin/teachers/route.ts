import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.userType !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const teachers = await prisma.teacher.findMany({
      include: {
        user: {
          select: {
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Format the data for frontend
    const formattedTeachers = teachers.map(teacher => {
      return {
        id: teacher.id,
        name: teacher.name,
        lastname: teacher.lastname,
        email: teacher.user.email,
        subject: teacher.subject, // Subject is already stored as a name
        school: teacher.school,
        phone: teacher.phone,
        isVerified: teacher.isVerified,
        canReviewAnswers: teacher.canReviewAnswers,
        createdAt: teacher.createdAt,
        updatedAt: teacher.updatedAt
      }
    })

    return NextResponse.json({ teachers: formattedTeachers })
  } catch (error) {
    console.error('Error fetching teachers:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
