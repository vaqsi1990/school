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

    // Fetch all subjects to map IDs to names
    const subjects = await prisma.subject.findMany({
      select: {
        id: true,
        name: true
      }
    })

    // Create a map of subject ID to name
    const subjectMap = new Map(subjects.map(subject => [subject.id, subject.name]))

    // Format the data for frontend
    const formattedTeachers = teachers.map(teacher => {
      // Check if teacher.subject is an ID or a name
      const subjectName = subjectMap.get(teacher.subject) || teacher.subject
      
      return {
        id: teacher.id,
        name: teacher.name,
        lastname: teacher.lastname,
        email: teacher.user.email,
        subject: subjectName, // Resolve subject ID to name
        school: teacher.school,
        phone: teacher.phone,
        isVerified: teacher.isVerified,
        canCreateQuestions: teacher.canCreateQuestions,
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
