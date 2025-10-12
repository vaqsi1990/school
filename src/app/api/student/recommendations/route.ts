import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get student info
    const student = await prisma.student.findUnique({
      where: { userId: session.user.id },
      select: { id: true }
    })

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    // Get all active recommendations
    const recommendations = await prisma.recommendation.findMany({
      where: {
        isActive: true
      },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            lastname: true
          }
        },
        responses: {
          where: {
            studentId: student.id
          },
          include: {
            student: {
              select: {
                id: true,
                name: true,
                lastname: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ recommendations })
  } catch (error) {
    console.error('Error fetching student recommendations:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
