import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/teacher/students/list - Get all registered students for a specific grade
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const grade = searchParams.get('grade')

    // Get teacher info
    const teacher = await prisma.teacher.findUnique({
      where: { userId: session.user.id }
    })

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 })
    }

    // Build conditions
    const whereConditions: {
      user: {
        isActive: boolean
      }
      grade?: number
    } = {
      user: {
        isActive: true
      }
    }

    if (grade) {
      whereConditions.grade = parseInt(grade)
    }

    // Get all students
    const students = await prisma.student.findMany({
      where: whereConditions,
      select: {
        id: true,
        name: true,
        lastname: true,
        grade: true,
        school: true,
        code: true,
        user: {
          select: {
            email: true
          }
        }
      },
      orderBy: [
        { name: 'asc' },
        { lastname: 'asc' }
      ]
    })

    return NextResponse.json({ students })
  } catch (error) {
    console.error('Error fetching students list:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
