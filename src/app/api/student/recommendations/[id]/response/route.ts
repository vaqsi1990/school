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

    const { id: recommendationId } = await params

    // Get student info
    const student = await prisma.student.findUnique({
      where: { userId: session.user.id },
      select: { id: true }
    })

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    // Get recommendation response
    const response = await prisma.recommendationResponse.findUnique({
      where: {
        recommendationId_studentId: {
          recommendationId: recommendationId,
          studentId: student.id
        }
      },
      include: {
        recommendation: {
          include: {
            teacher: {
              select: {
                id: true,
                name: true,
                lastname: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json({ response })
  } catch (error) {
    console.error('Error fetching recommendation response:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: recommendationId } = await params
    const { response } = await request.json()

    if (!response || !response.trim()) {
      return NextResponse.json({ error: 'Response is required' }, { status: 400 })
    }

    // Get student info
    const student = await prisma.student.findUnique({
      where: { userId: session.user.id },
      select: { id: true }
    })

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    // Verify recommendation exists and is active
    const recommendation = await prisma.recommendation.findFirst({
      where: {
        id: recommendationId,
        isActive: true
      },
      select: { id: true }
    })

    if (!recommendation) {
      return NextResponse.json({ error: 'Recommendation not found' }, { status: 404 })
    }

    // Create or update response
    const recommendationResponse = await prisma.recommendationResponse.upsert({
      where: {
        recommendationId_studentId: {
          recommendationId: recommendationId,
          studentId: student.id
        }
      },
      update: {
        response: response.trim(),
        updatedAt: new Date()
      },
      create: {
        recommendationId: recommendationId,
        studentId: student.id,
        response: response.trim()
      },
      include: {
        recommendation: {
          include: {
            teacher: {
              select: {
                id: true,
                name: true,
                lastname: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json({ response: recommendationResponse })
  } catch (error) {
    console.error('Error creating/updating recommendation response:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
