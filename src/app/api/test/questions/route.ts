import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Fetch questions for testing with random ordering while preserving question type sequence
    const questions = await prisma.question.findMany({
      where: {
        status: 'ACTIVE' // Get all active questions
      },
      include: {
        subject: true
      },
      take: 20 // Get more questions to have variety
    })

    // Group questions by type
    const questionsByType = questions.reduce((acc, question) => {
      if (!acc[question.type]) {
        acc[question.type] = []
      }
      acc[question.type].push(question)
      return acc
    }, {} as Record<string, typeof questions>)

    // Define the desired question type order
    const questionTypeOrder = ['CLOSED_ENDED', 'MATCHING', 'TEXT_ANALYSIS', 'MAP_ANALYSIS', 'OPEN_ENDED']
    
    // Shuffle questions within each type and maintain type order
    const shuffledQuestions: typeof questions = []
    
    questionTypeOrder.forEach(type => {
      if (questionsByType[type]) {
        // Shuffle questions within this type
        const shuffled = [...questionsByType[type]].sort(() => Math.random() - 0.5)
        shuffledQuestions.push(...shuffled)
      }
    })

    // Take only the first 10 questions to maintain reasonable test length
    const selectedQuestions = shuffledQuestions.slice(0, 10)

    // Format questions for frontend
    const formattedQuestions = selectedQuestions.map(question => ({
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
      round: question.round,
      matchingPairs: question.matchingPairs
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
