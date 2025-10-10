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

    const resolvedParams = await params
    const classId = resolvedParams.id

    // Get student information
    const student = await prisma.student.findUnique({
      where: { userId: session.user.id },
      select: { id: true }
    })

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    // Check if student is enrolled in this class
    const classMembership = await prisma.classStudent.findFirst({
      where: {
        studentId: student.id,
        classId: classId
      }
    })

    if (!classMembership) {
      return NextResponse.json({ error: 'Class not found or access denied' }, { status: 404 })
    }

    // Get tests for this class
    const tests = await prisma.classTest.findMany({
      where: {
        classId: classId,
        isActive: true
      },
      include: {
        subject: true,
        teacher: {
          select: {
            id: true,
            name: true,
            lastname: true
          }
        },
        questions: {
          include: {
            question: true
          }
        },
        results: {
          where: {
            studentId: student.id
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
      teacher: {
        id: test.teacher.id,
        name: test.teacher.name,
        lastname: test.teacher.lastname
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
      studentResult: test.results[0] || null
    }))

    return NextResponse.json({ tests: classTests })
  } catch (error) {
    console.error('Error fetching class tests:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
