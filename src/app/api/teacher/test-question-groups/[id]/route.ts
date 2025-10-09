import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get teacher info
    const teacher = await prisma.teacher.findUnique({
      where: { userId: session.user.id }
    })

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 })
    }

    const group = await prisma.testQuestionGroup.findUnique({
      where: { id: params.id },
      include: {
        subject: true,
        questions: {
          include: {
            question: true
          },
          orderBy: {
            order: 'asc'
          }
        }
      }
    })

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 })
    }

    // Verify teacher owns this group
    if (group.createdBy !== teacher.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    return NextResponse.json({ group })
  } catch (error) {
    console.error('Error fetching test question group:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, grade, questionIds } = body

    // Get teacher info
    const teacher = await prisma.teacher.findUnique({
      where: { userId: session.user.id }
    })

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 })
    }

    // Verify teacher owns this group
    const group = await prisma.testQuestionGroup.findUnique({
      where: { id: params.id }
    })

    if (!group || group.createdBy !== teacher.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Update group with new questions
    const updatedGroup = await prisma.testQuestionGroup.update({
      where: { id: params.id },
      data: {
        name,
        description,
        grade,
        questions: {
          deleteMany: {}, // Remove all existing questions
          create: questionIds.map((questionId: string, index: number) => ({
            questionId,
            order: index + 1,
            points: 1
          }))
        }
      },
      include: {
        subject: true,
        questions: {
          include: {
            question: true
          },
          orderBy: {
            order: 'asc'
          }
        }
      }
    })

    return NextResponse.json({ group: updatedGroup })
  } catch (error) {
    console.error('Error updating test question group:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get teacher info
    const teacher = await prisma.teacher.findUnique({
      where: { userId: session.user.id }
    })

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 })
    }

    // Verify teacher owns this group
    const group = await prisma.testQuestionGroup.findUnique({
      where: { id: params.id }
    })

    if (!group || group.createdBy !== teacher.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    await prisma.testQuestionGroup.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Group deleted successfully' })
  } catch (error) {
    console.error('Error deleting test question group:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
