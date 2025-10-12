import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Get teacher info
    const teacher = await prisma.teacher.findUnique({
      where: { userId: session.user.id },
      select: { id: true }
    })

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 })
    }

    // Get recommendation
    const recommendation = await prisma.recommendation.findFirst({
      where: {
        id: id,
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
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    if (!recommendation) {
      return NextResponse.json({ error: 'Recommendation not found' }, { status: 404 })
    }

    return NextResponse.json({ recommendation })
  } catch (error) {
    console.error('Error fetching recommendation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const { title, content, isActive } = await request.json()

    // Get teacher info
    const teacher = await prisma.teacher.findUnique({
      where: { userId: session.user.id },
      select: { id: true }
    })

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 })
    }

    // Update recommendation
    const recommendation = await prisma.recommendation.updateMany({
      where: {
        id: id,
        teacherId: teacher.id
      },
      data: {
        ...(title && { title }),
        ...(content && { content }),
        ...(isActive !== undefined && { isActive }),
        updatedAt: new Date()
      }
    })

    if (recommendation.count === 0) {
      return NextResponse.json({ error: 'Recommendation not found' }, { status: 404 })
    }

    // Fetch updated recommendation
    const updatedRecommendation = await prisma.recommendation.findUnique({
      where: { id },
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
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    return NextResponse.json({ recommendation: updatedRecommendation })
  } catch (error) {
    console.error('Error updating recommendation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Get teacher info
    const teacher = await prisma.teacher.findUnique({
      where: { userId: session.user.id },
      select: { id: true }
    })

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 })
    }

    // Delete recommendation
    const result = await prisma.recommendation.deleteMany({
      where: {
        id: id,
        teacherId: teacher.id
      }
    })

    if (result.count === 0) {
      return NextResponse.json({ error: 'Recommendation not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting recommendation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
