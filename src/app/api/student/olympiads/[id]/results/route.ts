import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface QuestionWithDetails {
  questionId: string
  question: {
    text: string
    type: string
    options: string[]
    correctAnswer: string | null
    points: number
    image: string[]
    imageOptions: string[]
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'ავტორიზაცია საჭიროა' }, { status: 401 })
    }

    const resolvedParams = await params
    const userId = session.user.id

    // First get the student record
    const student = await prisma.student.findUnique({
      where: { userId },
      select: { id: true }
    })

    if (!student) {
      return NextResponse.json({ error: 'მოსწავლის მონაცემები ვერ მოიძებნა' }, { status: 404 })
    }

    const studentId = student.id

    // Get olympiad with participation details
    const olympiad = await prisma.olympiadEvent.findUnique({
      where: { id: resolvedParams.id },
      include: {
        packages: {
          include: {
            questions: {
              include: {
                question: true
              }
            }
          }
        },
        participations: {
          where: { studentId }
        }
      }
    })

    if (!olympiad) {
      return NextResponse.json({ error: 'ოლიმპიადა ვერ მოიძებნა' }, { status: 404 })
    }

    const participation = olympiad.participations[0]
    if (!participation) {
      return NextResponse.json({ error: 'თქვენ არ ხართ რეგისტრირებული ამ ოლიმპიადაზე' }, { status: 404 })
    }

    // Get all questions from packages
    const allQuestions = olympiad.packages.flatMap(pkg => 
      pkg.questions.map(qp => qp.question)
    )

    // Calculate total questions and max score
    const totalQuestions = allQuestions.length

    const maxScore = allQuestions.reduce((total, question) => {
      return total + (question.points || 1)
    }, 0)

    // Get actual score from participation
    const score = participation.totalScore || 0
    const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0

    // Get student answers for each question
    const studentAnswers = await prisma.studentAnswer.findMany({
      where: {
        studentId: studentId,
        olympiadId: olympiad.id
      },
      include: {
        question: true
      }
    })

    // Create questions array with student answers
    const questionsWithAnswers = allQuestions.map(question => {
      const studentAnswer = studentAnswers.find(sa => sa.questionId === question.id)
      return {
        id: question.id,
        text: question.text,
        type: question.type,
        options: question.options,
        correctAnswer: question.correctAnswer,
        studentAnswer: studentAnswer?.answer || '',
        isCorrect: studentAnswer?.isCorrect || false,
        points: studentAnswer?.points || 0,
        image: question.image,
        imageOptions: question.imageOptions,
        matchingPairs: question.matchingPairs,
        leftSide: question.leftSide,
        rightSide: question.rightSide
      }
    })

    const result = {
      id: olympiad.id,
      title: olympiad.name,
      description: olympiad.description,
      startDate: olympiad.startDate,
      endDate: olympiad.endDate,
      showDetailedReview: olympiad.showDetailedReview,
      totalQuestions,
      score,
      maxScore,
      percentage,
      status: participation.status,
      startTime: participation.startTime,
      endTime: participation.endTime,
      questions: questionsWithAnswers
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching olympiad results:', error)
    return NextResponse.json(
      { error: 'სისტემური შეცდომა მოხდა' },
      { status: 500 }
    )
  }
}
