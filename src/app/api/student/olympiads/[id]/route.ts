import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Get single olympiad for student
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.userType !== 'STUDENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const student = await prisma.student.findUnique({
      where: { userId: session.user.id },
      include: { user: true }
    })

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    const olympiad = await prisma.olympiadEvent.findUnique({
      where: { id: resolvedParams.id },
      include: {
        packages: {
          include: {
            questions: {
              include: {
                question: true
              }
            }
          }
        },
        curriculum: true,
        createdByUser: {
          select: {
            name: true,
            lastname: true,
            user: {
              select: {
                email: true
              }
            }
          }
        },
        _count: {
          select: {
            participations: true
          }
        }
      }
    })

    if (!olympiad) {
      return NextResponse.json({ error: 'Olympiad not found' }, { status: 404 })
    }

    // Check if student's grade is included
    if (!olympiad.grades.includes(student.grade)) {
      return NextResponse.json({ error: 'Student grade not eligible' }, { status: 403 })
    }

    return NextResponse.json({ olympiad })
  } catch (error) {
    console.error('Error fetching olympiad:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
