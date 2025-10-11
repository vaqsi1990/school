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

    const { id: classId } = await params

    // Get teacher info
    const teacher = await prisma.teacher.findUnique({
      where: { userId: session.user.id },
      select: { id: true }
    })

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 })
    }

    // Check if teacher owns this class
    const classData = await prisma.class.findFirst({
      where: {
        id: classId,
        teacherId: teacher.id
      }
    })

    if (!classData) {
      return NextResponse.json({ error: 'Class not found or access denied' }, { status: 404 })
    }

    // Get tests for this class
    const tests = await prisma.classTest.findMany({
      where: {
        classId: classId
      },
      include: {
        subject: true,
        questions: {
          include: {
            question: true
          }
        },
        results: {
          include: {
            student: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform the data
    const classTests = tests.map(test => ({
      id: test.id,
      title: test.title,
      description: test.description,
      subject: {
        id: test.subject.id,
        name: test.subject.name
      },
      class: {
        id: classData.id,
        name: classData.name,
        students: []
      },
      isActive: test.isActive,
      startDate: test.startDate,
      endDate: test.endDate,
      duration: test.duration,
      createdAt: test.createdAt,
      questions: test.questions.map(q => ({
        id: q.id,
        question: {
          id: q.question.id,
          text: q.question.text,
          type: q.question.type
        }
      })),
      results: test.results.map(r => ({
        id: r.id,
        student: {
          id: r.student.id,
          name: r.student.name,
          lastname: r.student.lastname
        },
        score: r.score,
        status: r.status,
        completedAt: r.completedAt
      }))
    }))

    return NextResponse.json({ tests: classTests })
  } catch (error) {
    console.error('Error fetching class tests:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
