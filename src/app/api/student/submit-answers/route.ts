import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { convertStudentAnswerToString } from '@/utils/matchingUtils'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.userType !== 'STUDENT') {
      return NextResponse.json(
        { error: 'ავტორიზაცია საჭიროა' },
        { status: 401 }
      )
    }

    const { answers, studentId } = await request.json()

    if (!answers || typeof answers !== 'object') {
      return NextResponse.json(
        { error: 'არასწორი პასუხების ფორმატი' },
        { status: 400 }
      )
    }

    // Save answers to database with scoring
    const savedAnswers = []
    let totalScore = 0
    let correctAnswers = 0
    
    for (const [questionId, answer] of Object.entries(answers)) {
      if (answer) {
        // Get question details for scoring
        const question = await prisma.question.findUnique({
          where: { id: questionId }
        })
        
        let isCorrect = false
        let points = 0
        
        if (question) {
          if (question.type === 'MATCHING') {
            // For MATCHING questions, convert student answer object to string format
            const studentAnswerString = convertStudentAnswerToString(answer, question.matchingPairs, question.leftSide, question.rightSide)
            
                        console.log('MATCHING QUESTION DEBUG (submit-answers):', {
                          questionId: question.id,
                          questionText: question.text,
                          studentAnswerString,
                          correctAnswer: question.correctAnswer,
                          comparison: studentAnswerString === question.correctAnswer
                        })
                        
                        isCorrect = studentAnswerString === question.correctAnswer
                        points = isCorrect ? question.points : 0
          } else if (question.type === 'CLOSED_ENDED') {
            isCorrect = answer === question.correctAnswer
            points = isCorrect ? question.points : 0
          } else if (question.type === 'OPEN_ENDED' || question.type === 'TEXT_ANALYSIS' || question.type === 'MAP_ANALYSIS') {
            // For manual grading questions
            isCorrect = String(answer).trim().length > 0
            points = 0 // Will be scored manually later
          }
        }
        
        const savedAnswer = await prisma.studentAnswer.create({
          data: {
            studentId: studentId || session.user.student?.id,
            questionId,
            answer: typeof answer === 'object' ? JSON.stringify(answer) : String(answer),
            isCorrect: isCorrect,
            points: points
          }
        })
        savedAnswers.push(savedAnswer)
        
        if (isCorrect) {
          totalScore += points
          correctAnswers++
        }
      }
    }

    return NextResponse.json({ 
      message: 'პასუხები წარმატებით შეინახა',
      savedAnswers: savedAnswers.length
    })

  } catch (error) {
    console.error('Error submitting answers:', error)
    return NextResponse.json(
      { error: 'სერვერის შეცდომა' },
      { status: 500 }
    )
  }
}
