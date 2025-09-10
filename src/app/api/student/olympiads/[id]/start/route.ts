import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface QuestionWithDetails {
  questionId: string
  question: {
    id: string
    text: string
    type: string
    options: string[]
    correctAnswer: string | null
    points: number
    image: string[]
    imageOptions: string[]
    content: string | null
    matchingPairs: any
    leftSide: any
    rightSide: any
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.userType !== 'STUDENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const student = await prisma.student.findUnique({
      where: { userId: session.user.id }
    })

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

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
          where: { studentId: student.id }
        }
      }
    })

    if (!olympiad) {
      return NextResponse.json({ error: 'Olympiad not found' }, { status: 404 })
    }

    // Check if student's grade is included
    if (!olympiad.grades.includes(student.grade)) {
      return NextResponse.json({ error: 'Student grade not eligible' }, { status: 403 })
    }

    // Check if olympiad is active
    if (!olympiad.isActive) {
      return NextResponse.json({ error: 'Olympiad is not active' }, { status: 400 })
    }

    // Check if student is registered
    if (olympiad.participations.length === 0) {
      return NextResponse.json({ error: 'Student is not registered for this olympiad' }, { status: 400 })
    }

    // Check if student already started and completed
    const participation = olympiad.participations[0]
    if (participation.startTime && participation.endTime) {
      return NextResponse.json({ error: 'Student already completed this olympiad' }, { status: 400 })
    }
    
    // If student started but didn't complete, allow continuation
    if (participation.startTime && !participation.endTime) {
      // Check if time hasn't expired (1 hour limit)
      const now = new Date()
      const startTime = new Date(participation.startTime)
      const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000)
      const totalTime = 60 * 60 // 1 hour in seconds
      
      if (elapsed >= totalTime) {
        // Time expired, mark as completed
        await prisma.studentOlympiadEvent.update({
          where: { id: participation.id },
          data: { endTime: now, status: 'COMPLETED' }
        })
        return NextResponse.json({ error: 'Olympiad time has expired' }, { status: 400 })
      }
      
      // Return existing questions for continuation
      const allQuestions = olympiad.packages.flatMap(pkg => 
        pkg.questions.map(qp => ({
          id: qp.questionId,
          question: (qp as QuestionWithDetails).question?.text || '',
          type: (qp as QuestionWithDetails).question?.type || 'OPEN_ENDED',
          options: (qp as QuestionWithDetails).question?.options || [],
          correctAnswer: (qp as QuestionWithDetails).question?.correctAnswer || '',
          points: (qp as QuestionWithDetails).question?.points || 1,
          image: (qp as QuestionWithDetails).question?.image || [],
          imageOptions: (qp as QuestionWithDetails).question?.imageOptions || [],
          matchingPairs: (qp as QuestionWithDetails).question?.matchingPairs || null,
          leftSide: (qp as QuestionWithDetails).question?.leftSide || null,
          rightSide: (qp as QuestionWithDetails).question?.rightSide || null
        }))
      )
      
      return NextResponse.json({
        message: 'Olympiad resumed successfully',
        questions: allQuestions,
        resumed: true
      })
    }

    // Check if olympiad is in the correct time range
    const now = new Date()
    const startDate = new Date(olympiad.startDate)
    const endDate = new Date(olympiad.endDate)

    if (now < startDate) {
      return NextResponse.json({ error: 'Olympiad has not started yet' }, { status: 400 })
    }

    if (now > endDate) {
      return NextResponse.json({ error: 'Olympiad has ended' }, { status: 400 })
    }

    // Get all questions from packages
    const allQuestions = olympiad.packages.flatMap(pkg => 
      pkg.questions.map(qp => {
        const question = (qp as QuestionWithDetails).question
        let subQuestions = null
        
        // Parse sub-questions from content field for TEXT_ANALYSIS and MAP_ANALYSIS questions
        if ((question?.type === 'TEXT_ANALYSIS' || question?.type === 'MAP_ANALYSIS') && question?.content) {
          try {
            subQuestions = JSON.parse(question.content)
          } catch (error) {
            console.error('Error parsing sub-questions for question:', question.id, error)
            subQuestions = []
          }
        }
        
        return {
          id: qp.questionId,
          question: question?.text || '',
          type: question?.type || 'OPEN_ENDED',
          options: question?.options || [],
          correctAnswer: question?.correctAnswer || '',
          points: question?.points || 1,
          image: question?.image || [],
          imageOptions: question?.imageOptions || [],
          matchingPairs: question?.matchingPairs || null,
          leftSide: question?.leftSide || null,
          rightSide: question?.rightSide || null,
          subQuestions: subQuestions
        }
      })
    )

    // Shuffle questions
    const shuffledQuestions = allQuestions.sort(() => Math.random() - 0.5)

    // Update participation to mark as started
    await prisma.studentOlympiadEvent.update({
      where: { id: participation.id },
      data: { startTime: now, status: 'IN_PROGRESS' }
    })

    return NextResponse.json({
      message: 'Olympiad started successfully',
      questions: shuffledQuestions
    })
  } catch (error) {
    console.error('Error starting olympiad:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
