import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; studentId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: testId, studentId } = await params

    // Get teacher info
    const teacher = await prisma.teacher.findUnique({
      where: { userId: session.user.id },
      select: { id: true }
    })

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 })
    }

    // Get test with student's result
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
              where: {
                studentId: studentId
              },
              include: {
                student: true
              }
            }
          }
        },
        questions: {
          include: {
            question: true
          },
          orderBy: {
            order: 'asc'
          }
        },
        results: {
          where: {
            studentId: studentId
          },
          include: {
            student: true
          }
        }
      }
    })

    if (!test) {
      return NextResponse.json({ error: 'Test not found or access denied' }, { status: 404 })
    }

    if (!test.class.students.length) {
      return NextResponse.json({ error: 'Student not found in this class' }, { status: 404 })
    }

    const studentResult = test.results[0]
    if (!studentResult) {
      return NextResponse.json({ error: 'Student has not taken this test' }, { status: 404 })
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
        name: test.class.name
      },
      student: {
        id: studentResult.student.id,
        name: studentResult.student.name,
        lastname: studentResult.student.lastname,
        grade: studentResult.student.grade,
        school: studentResult.student.school,
        code: studentResult.student.code
      },
      isActive: test.isActive,
      startDate: test.startDate,
      endDate: test.endDate,
      duration: test.duration,
      createdAt: test.createdAt,
      questions: test.questions.map(q => ({
        id: q.id,
        order: q.order,
        points: q.points,
        question: {
          id: q.question.id,
          text: q.question.text,
          type: q.question.type,
          options: q.question.options,
          correctAnswer: q.question.correctAnswer,
          answerTemplate: q.question.answerTemplate,
          content: q.question.content,
          rubric: q.question.rubric
        }
      })),
      result: {
        id: studentResult.id,
        score: studentResult.score,
        status: studentResult.status,
        completedAt: studentResult.completedAt,
        answers: studentResult.answers || []
      }
    }

    return NextResponse.json({ test: testData })
  } catch (error) {
    console.error('Error fetching student test review:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
