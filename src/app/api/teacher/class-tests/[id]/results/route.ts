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

    const { id: testId } = await params

    // Get teacher info
    const teacher = await prisma.teacher.findUnique({
      where: { userId: session.user.id },
      select: { id: true }
    })

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 })
    }

    // Get test with results
    const test = await prisma.classTest.findFirst({
      where: {
        id: testId,
        teacherId: teacher.id
      },
      include: {
        subject: true,
        class: {
          include: {
            students: {
              include: {
                student: true
              }
            }
          }
        },
        questions: {
          include: {
            question: true
          }
        },
        results: {
          include: {
            student: true
          },
          orderBy: {
            completedAt: 'desc'
          }
        }
      }
    })

    if (!test) {
      return NextResponse.json({ error: 'Test not found or access denied' }, { status: 404 })
    }

    // Transform the data
    const testData = {
      id: test.id,
      title: test.title,
      description: test.description,
      subject: {
        id: test.subject.id,
        name: test.subject.name
      },
      class: {
        id: test.class.id,
        name: test.class.name,
        students: test.class.students.map(cs => ({
          student: {
            id: cs.student.id,
            name: cs.student.name,
            lastname: cs.student.lastname,
            grade: cs.student.grade,
            school: cs.student.school,
            code: cs.student.code
          }
        }))
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
          lastname: r.student.lastname,
          grade: r.student.grade,
          school: r.student.school,
          code: r.student.code
        },
        score: r.score,
        status: r.status,
        completedAt: r.completedAt,
        answers: r.answers || []
      }))
    }

    return NextResponse.json({ test: testData })
  } catch (error) {
    console.error('Error fetching test results:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
