import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/teacher/students/search - Search for students to add to classes
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const grade = searchParams.get('grade')

    // Get teacher info
    const teacher = await prisma.teacher.findUnique({
      where: { userId: session.user.id }
    })

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 })
    }

    // Build search conditions
    const whereConditions: {
      user: {
        isActive: boolean
      }
      OR?: Array<{
        name?: { contains: string; mode: 'insensitive' }
        lastname?: { contains: string; mode: 'insensitive' }
        code?: { contains: string; mode: 'insensitive' }
        school?: { contains: string; mode: 'insensitive' }
      }>
      grade?: number
    } = {
      user: {
        isActive: true
      }
    }

    if (query) {
      whereConditions.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { lastname: { contains: query, mode: 'insensitive' } },
        { code: { contains: query, mode: 'insensitive' } },
        { school: { contains: query, mode: 'insensitive' } }
      ]
    }

    if (grade) {
      whereConditions.grade = parseInt(grade)
    }

    // Search for students
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
      take: 50, // Limit results
      orderBy: [
        { name: 'asc' },
        { lastname: 'asc' }
      ]
    })

    return NextResponse.json({ students })
  } catch (error) {
    console.error('Error searching students:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
