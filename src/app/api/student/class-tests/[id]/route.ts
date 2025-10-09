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

    // Get student info
    const student = await prisma.student.findUnique({
      where: { userId: session.user.id }
    })

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    const test = await prisma.classTest.findUnique({
      where: { id },
      include: {
        class: {
          include: {
            students: {
              where: {
                studentId: student.id
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
          where: {
            studentId: student.id
          }
        }
      }
    })

    if (!test) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 })
    }

    // Check if student is in the class
    if (!test.class.students.length) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Check if test is active and within time limits
    if (!test.isActive) {
      return NextResponse.json({ error: 'Test is not active' }, { status: 403 })
    }

    if (test.startDate && new Date() < test.startDate) {
      return NextResponse.json({ error: 'Test has not started yet' }, { status: 403 })
    }

    if (test.endDate && new Date() > test.endDate) {
      return NextResponse.json({ error: 'Test has ended' }, { status: 403 })
    }

    return NextResponse.json({ 
      test: {
        ...test,
        studentResult: test.results[0] || null
      }
    })
  } catch (error) {
    console.error('Error fetching class test for student:', error)
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

    const { id } = await params

    const body = await request.json()
    const { answers } = body

    // Get student info
    const student = await prisma.student.findUnique({
      where: { userId: session.user.id }
    })

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    const test = await prisma.classTest.findUnique({
      where: { id },
      include: {
        class: {
          include: {
            students: {
              where: {
                studentId: student.id
              }
            }
          }
        },
        questions: {
          include: {
            question: true
          }
        }
      }
    })

    if (!test) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 })
    }

    // Check if student is in the class
    if (!test.class.students.length) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Check if test is active and within time limits
    if (!test.isActive) {
      return NextResponse.json({ error: 'Test is not active' }, { status: 403 })
    }

    if (test.startDate && new Date() < test.startDate) {
      return NextResponse.json({ error: 'Test has not started yet' }, { status: 403 })
    }

    if (test.endDate && new Date() > test.endDate) {
      return NextResponse.json({ error: 'Test has ended' }, { status: 403 })
    }

    // Check if already submitted
    const existingResult = await prisma.classTestResult.findUnique({
      where: {
        testId_studentId: {
          testId: id,
          studentId: student.id
        }
      }
    })

    if (existingResult && existingResult.status === 'COMPLETED') {
      return NextResponse.json({ error: 'Test already submitted' }, { status: 400 })
    }

    // Calculate score for closed-ended questions
    let score = 0
    let totalPoints = 0

    for (const testQuestion of test.questions) {
      const question = testQuestion.question
      totalPoints += testQuestion.points

      if (question.type === 'CLOSED_ENDED' && answers[question.id]) {
        if (question.correctAnswer === answers[question.id]) {
          score += testQuestion.points
        }
      }
    }

    // Create or update result
    const result = await prisma.classTestResult.upsert({
      where: {
        testId_studentId: {
          testId: id,
          studentId: student.id
        }
      },
      update: {
        answers,
        score,
        totalPoints,
        status: 'COMPLETED',
        completedAt: new Date()
      },
      create: {
        testId: id,
        studentId: student.id,
        answers,
        score,
        totalPoints,
        status: 'COMPLETED',
        completedAt: new Date()
      }
    })

    return NextResponse.json({ result })
  } catch (error) {
    console.error('Error submitting class test:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
