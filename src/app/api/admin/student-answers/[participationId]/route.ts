import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ participationId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.userType !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resolvedParams = await params
    const participationId = resolvedParams.participationId

    // Get participation info with student and olympiad details
    const participation = await prisma.studentOlympiadEvent.findUnique({
      where: { id: participationId },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            lastname: true,
            grade: true,
            school: true
          }
        },
        olympiadEvent: {
          select: {
            id: true,
            name: true,
            subjects: true,
            grades: true,
            rounds: true
          }
        }
      }
    })

    if (!participation) {
      return NextResponse.json({ error: 'Participation not found' }, { status: 404 })
    }

    // Get olympiad event with packages
    const olympiadEvent = await prisma.olympiadEvent.findUnique({
      where: { id: participation.olympiadEventId },
      include: {
        packages: {
          include: {
            questions: {
              include: {
                question: true
              },
              orderBy: { order: 'asc' }
            }
          }
        }
      }
    })

    if (!olympiadEvent) {
      return NextResponse.json({ error: 'Olympiad event not found' }, { status: 404 })
    }

    // Flatten all questions from all packages
    const olympiadQuestions = olympiadEvent.packages.flatMap(pkg => 
      pkg.questions.map(qpq => ({
        id: qpq.id,
        questionId: qpq.questionId,
        order: qpq.order,
        question: qpq.question
      }))
    )

    // Get student answers for these questions
    let studentAnswers = await prisma.studentAnswer.findMany({
      where: {
        studentId: participation.studentId,
        olympiadId: participation.olympiadEventId, // Use olympiadId field
        questionId: {
          in: olympiadQuestions.map(oq => oq.questionId)
        }
      },
      orderBy: { answeredAt: 'asc' }
    })

    // Fallback: if no answers found with olympiadId, try without it
    if (studentAnswers.length === 0) {
      console.log('No answers found with olympiadId, trying fallback...')
      studentAnswers = await prisma.studentAnswer.findMany({
        where: {
          studentId: participation.studentId,
          questionId: {
            in: olympiadQuestions.map(oq => oq.questionId)
          }
        },
        orderBy: { answeredAt: 'asc' }
      })
      console.log('Fallback found answers:', studentAnswers.length)
    }

    // Debug: Check what answers exist for this student
    const allStudentAnswers = await prisma.studentAnswer.findMany({
      where: {
        studentId: participation.studentId
      },
      select: {
        id: true,
        questionId: true,
        answer: true,
        olympiadId: true,
        answeredAt: true
      }
    })

    // Debug: Check which olympiad the student actually answered
    const uniqueOlympiadIds = [...new Set(allStudentAnswers.map(a => a.olympiadId))]
    console.log('Student answered olympiads:', uniqueOlympiadIds)

    console.log('Debug info:', {
      participationId,
      studentId: participation.studentId,
      olympiadEventId: participation.olympiadEventId,
      olympiadQuestionsCount: olympiadQuestions.length,
      studentAnswersCount: studentAnswers.length,
      allStudentAnswersCount: allStudentAnswers.length,
      questionIds: olympiadQuestions.map(oq => oq.questionId),
      studentAnswerQuestionIds: allStudentAnswers.map(a => a.questionId),
      questionIdMatch: olympiadQuestions.map(oq => oq.questionId).some(qId => 
        allStudentAnswers.some(a => a.questionId === qId)
      )
    })

    // Create a map of questions for easy lookup (already have questions from olympiadEvent)
    const questionMap = new Map(olympiadQuestions.map(oq => [oq.questionId, oq.question]))

    // Transform the data - if no answers, show questions without answers
    let transformedAnswers
    if (studentAnswers.length === 0) {
      // Show questions without answers if student hasn't answered yet
      transformedAnswers = olympiadQuestions.map((oq, index) => {
        const question = questionMap.get(oq.questionId)
        if (!question) return null

        return {
          id: `temp-${index}`, // Temporary ID
          questionId: question.id,
          answer: 'პასუხი არ არის მოცემული',
          isCorrect: null,
          points: null,
          answeredAt: new Date().toISOString(),
          question: {
            id: question.id,
            text: question.text,
            type: question.type,
            options: question.options,
            correctAnswer: question.correctAnswer,
            points: question.points,
            maxPoints: question.maxPoints || question.points,
            image: question.image,
            matchingPairs: question.matchingPairs,
            subQuestions: []
          }
        }
      }).filter(Boolean)
    } else {
      // Show answers with questions
      transformedAnswers = studentAnswers.map(answer => {
        const question = questionMap.get(answer.questionId)
        if (!question) return null

        return {
          id: answer.id,
          questionId: answer.questionId,
          answer: answer.answer,
          isCorrect: answer.isCorrect,
          points: answer.points,
          answeredAt: answer.answeredAt.toISOString(),
          question: {
            id: question.id,
            text: question.text,
            type: question.type,
            options: question.options,
            correctAnswer: question.correctAnswer,
            points: question.points,
            maxPoints: question.maxPoints || question.points,
            image: question.image,
            matchingPairs: question.matchingPairs,
            subQuestions: []
          }
        }
      }).filter(Boolean)
    }

    return NextResponse.json({
      studentInfo: {
        id: participation.student.id,
        name: participation.student.name,
        lastname: participation.student.lastname,
        grade: participation.student.grade,
        school: participation.student.school
      },
      olympiadInfo: {
        id: participation.olympiadEvent.id,
        name: participation.olympiadEvent.name,
        subjects: participation.olympiadEvent.subjects,
        grades: participation.olympiadEvent.grades,
        rounds: participation.olympiadEvent.rounds
      },
      participationInfo: {
        id: participation.id,
        status: participation.status,
        startTime: participation.startTime?.toISOString() || participation.createdAt.toISOString(),
        endTime: participation.endTime?.toISOString(),
        currentRound: participation.currentRound,
        totalScore: participation.totalScore
      },
      answers: transformedAnswers
    })

  } catch (error) {
    console.error('Error fetching student answers:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
