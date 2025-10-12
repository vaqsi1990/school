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

    // Get teacher info
    const teacher = await prisma.teacher.findUnique({
      where: { userId: session.user.id },
      select: { id: true }
    })

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 })
    }

    // Get all recommendations created by this teacher
    const recommendations = await prisma.recommendation.findMany({
      where: {
        teacherId: teacher.id
      },
      include: {
        responses: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                lastname: true
              }
            }
          }
        },
        adminResponse: {
          include: {
            admin: {
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
    console.error('Error fetching recommendations:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title, content } = await request.json()

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 })
    }

    // Get teacher info
    const teacher = await prisma.teacher.findUnique({
      where: { userId: session.user.id },
      select: { id: true }
    })

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 })
    }

    // Create recommendation
    const recommendation = await prisma.recommendation.create({
      data: {
        title: title as string,
        content: content as string,
        teacherId: teacher.id
      }
    })

    return NextResponse.json({ recommendation })
  } catch (error) {
    console.error('Error creating recommendation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
