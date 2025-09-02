import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Fetch questions for testing (you can add filters here)
    const questions = await prisma.question.findMany({
      where: {
        type: 'CLOSED_ENDED', // For now, only show closed-ended questions
        isAutoScored: true
      },
      include: {
        subject: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10 // Limit to 10 questions for testing
    })

    // Format questions for frontend
    const formattedQuestions = questions.map(question => ({
      id: question.id,
      text: question.text,
      type: question.type,
      options: question.options,
      imageOptions: question.imageOptions,
      correctAnswer: question.correctAnswer,
      points: question.points,
      image: question.image,
      subjectId: question.subjectId,
      subjectName: question.subject.name,
      grade: question.grade,
      round: question.round
    }))

    return NextResponse.json({ questions: formattedQuestions })
  } catch (error) {
    console.error('Error fetching test questions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
