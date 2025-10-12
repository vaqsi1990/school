import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

// Type definitions for student answers and scores
interface StudentAnswer {
  text?: string
  selectedOption?: string | number
}

interface StudentAnswers {
  [questionId: string]: StudentAnswer | string
}

interface StudentScores {
  [questionId: string]: number
}

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
        answers: studentResult.answers ? 
          Object.entries(studentResult.answers as StudentAnswers).map(([questionId, answer]) => ({
            questionId,
            text: typeof answer === 'string' ? answer : answer?.text || '',
            selectedOption: typeof answer === 'string' ? answer : answer?.selectedOption || answer
          }))
          : [],
        scores: studentResult.answers && typeof studentResult.answers === 'object' && 'scores' in studentResult.answers 
          ? (studentResult.answers as any).scores 
          : {}
      }
    }

    return NextResponse.json({ test: testData })
  } catch (error) {
    console.error('Error fetching student test review:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; studentId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: testId, studentId } = await params
    const { answers, studentScores }: { answers?: StudentAnswers; studentScores?: StudentScores } = await request.json()

    // Get teacher info
    const teacher = await prisma.teacher.findUnique({
      where: { userId: session.user.id },
      select: { id: true }
    })

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 })
    }

    // Verify teacher owns this test
    const test = await prisma.classTest.findFirst({
      where: {
        id: testId,
        teacherId: teacher.id
      }
    })

    if (!test) {
      return NextResponse.json({ error: 'Test not found or access denied' }, { status: 404 })
    }

    // Prepare update data
    const updateData: Prisma.ClassTestResultUpdateInput = {
      updatedAt: new Date()
    }

    // Update answers if provided
    if (answers) {
      updateData.answers = answers as unknown as Prisma.InputJsonValue
    }

    // Update student scores if provided
    if (studentScores) {
      // Calculate total score from student scores
      const totalScore = Object.values(studentScores).reduce((sum: number, score: number) => sum + (score || 0), 0)
      updateData.score = totalScore
      
      // Store individual question scores in answers field or create a separate field
      // For now, we'll store it in answers field as a JSON object
      const currentAnswers = await prisma.classTestResult.findUnique({
        where: {
          testId_studentId: {
            testId: testId,
            studentId: studentId
          }
        },
        select: { answers: true }
      })

      const existingAnswers = (currentAnswers?.answers as StudentAnswers) || {}
      const updatedAnswers: Prisma.InputJsonValue = {
        ...existingAnswers,
        scores: studentScores
      }
      
      updateData.answers = updatedAnswers
    }

    // Update the student's result
    const updatedResult = await prisma.classTestResult.update({
      where: {
        testId_studentId: {
          testId: testId,
          studentId: studentId
        }
      },
      data: updateData
    })

    return NextResponse.json({ success: true, result: updatedResult })
  } catch (error) {
    console.error('Error updating student answers:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
