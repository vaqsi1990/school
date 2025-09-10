import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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

    const { answers } = await request.json()

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

    // Check if student is registered and started
    const participation = olympiad.participations[0]
    if (!participation || !participation.startTime) {
      return NextResponse.json({ error: 'Student has not started this olympiad' }, { status: 400 })
    }

    // Check if already submitted
    if (participation.endTime) {
      return NextResponse.json({ error: 'Student already submitted answers' }, { status: 400 })
    }

    // Calculate score
    let totalScore = 0
    let correctAnswers = 0
    let totalQuestions = 0
    let hasManualGradingQuestions = false

    const allQuestions = olympiad.packages.flatMap(pkg => 
      pkg.questions.map(qp => qp.question)
    )

    // Check if there are any questions that require manual grading
    for (const question of allQuestions) {
      if (question.type === 'OPEN_ENDED' || question.type === 'TEXT_ANALYSIS' || question.type === 'MAP_ANALYSIS') {
        hasManualGradingQuestions = true
        break
      }
    }

    // Save individual answers to StudentAnswer table
    const savedAnswers = []
    for (const question of allQuestions) {
      totalQuestions++
      const studentAnswer = answers[question.id]
      
      if (studentAnswer) {
        let isCorrect = false
        let points = 0
        
        if (question.type === 'MATCHING') {
          // For MATCHING questions, convert student answer object to string format
          let studentAnswerString = ''
          if (typeof studentAnswer === 'object' && !Array.isArray(studentAnswer)) {
            const pairs = []
            for (const [key, value] of Object.entries(studentAnswer)) {
              if (value) {
                pairs.push(`${key}:${value}`)
              }
            }
            studentAnswerString = pairs.join(',')
          } else {
            studentAnswerString = String(studentAnswer)
          }
          
          isCorrect = studentAnswerString === question.correctAnswer
          points = isCorrect ? question.points : 0
        } else if (question.type === 'CLOSED_ENDED') {
          isCorrect = studentAnswer === question.correctAnswer
          points = isCorrect ? question.points : 0
        } else if (question.type === 'OPEN_ENDED' || question.type === 'TEXT_ANALYSIS' || question.type === 'MAP_ANALYSIS') {
          // For manual grading questions, we'll need manual review
          isCorrect = studentAnswer.trim().length > 0
          points = 0 // Will be scored manually later
        }
        
        // Save individual answer
        const savedAnswer = await prisma.studentAnswer.create({
          data: {
            studentId: student.id,
            questionId: question.id,
            answer: typeof studentAnswer === 'object' ? JSON.stringify(studentAnswer) : String(studentAnswer),
            isCorrect: isCorrect,
            points: points,
            olympiadId: olympiad.id // Add olympiad reference
          }
        })
        savedAnswers.push(savedAnswer)
        
        if (isCorrect) {
          totalScore += question.points
          correctAnswers++
        }
      }
    }

    // Update participation
    await prisma.studentOlympiadEvent.update({
      where: { id: participation.id },
      data: {
        endTime: new Date(),
        totalScore: totalScore,
        status: 'COMPLETED'
      }
    })

    return NextResponse.json({
      message: 'Answers submitted successfully',
      score: totalScore,
      correctAnswers,
      totalQuestions,
      percentage: Math.round((correctAnswers / totalQuestions) * 100),
      hasManualGradingQuestions,
      redirectUrl: hasManualGradingQuestions 
        ? `/student/olympiads/${resolvedParams.id}/results?score=${totalScore}&manual=true`
        : `/student/olympiads/${resolvedParams.id}/results?score=${totalScore}&auto=true`
    })
  } catch (error) {
    console.error('Error submitting answers:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
