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

    const test = await prisma.classTest.findUnique({
      where: { id: params.id },
      include: {
        class: {
          include: {
            students: {
              include: {
                student: true
              }
            }
          }
        },
        subject: true,
        teacher: true,
        questions: {
          include: {
            question: true
          },
          orderBy: {
            order: 'asc'
          }
        },
        results: {
          include: {
            student: true
          }
        }
      }
    })

    if (!test) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 })
    }

    // Verify teacher owns this test
    const teacher = await prisma.teacher.findUnique({
      where: { userId: session.user.id }
    })

    if (!teacher || test.teacherId !== teacher.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    return NextResponse.json({ test })
  } catch (error) {
    console.error('Error fetching class test:', error)
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
    const { title, description, startDate, endDate, duration, isActive } = body

    // Verify teacher owns this test
    const teacher = await prisma.teacher.findUnique({
      where: { userId: session.user.id }
    })

    const test = await prisma.classTest.findUnique({
      where: { id: params.id }
    })

    if (!teacher || !test || test.teacherId !== teacher.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const updatedTest = await prisma.classTest.update({
      where: { id: params.id },
      data: {
        title,
        description,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        duration,
        isActive
      },
      include: {
        subject: true,
        questions: {
          include: {
            question: true
          }
        }
      }
    })

    return NextResponse.json({ test: updatedTest })
  } catch (error) {
    console.error('Error updating class test:', error)
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

    // Verify teacher owns this test
    const teacher = await prisma.teacher.findUnique({
      where: { userId: session.user.id }
    })

    const test = await prisma.classTest.findUnique({
      where: { id: params.id }
    })

    if (!teacher || !test || test.teacherId !== teacher.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    await prisma.classTest.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Test deleted successfully' })
  } catch (error) {
    console.error('Error deleting class test:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
