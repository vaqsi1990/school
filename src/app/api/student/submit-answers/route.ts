import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

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

    // Save answers to database
    const savedAnswers = []
    
    for (const [questionId, answer] of Object.entries(answers)) {
      if (answer) {
        const savedAnswer = await prisma.studentAnswer.create({
          data: {
            studentId: studentId || session.user.student?.id,
            questionId,
            answer: answer as string,
            isCorrect: null, // Will be calculated later
            points: null // Will be calculated later
          }
        })
        savedAnswers.push(savedAnswer)
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
