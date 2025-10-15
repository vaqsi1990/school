import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check if user is authenticated and is admin
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.userType !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const {
      text,
      type,
      options,
      correctAnswer,
      answerTemplate,
      points,
      maxPoints,
      image,
      matchingPairs,
      subjectId,
      chapterName,
      paragraphName,
      grade,
      round,
      isAutoScored,
      isPublic,
      subQuestions
    } = await request.json()

    // Validate required fields
    if (!text || !type || !points || !subjectId || !grade || !round) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate auto-scored questions
    if (isAutoScored && !correctAnswer) {
      return NextResponse.json(
        { error: 'Auto-scored questions must have a correct answer' },
        { status: 400 }
      )
    }

    // Sub-questions are optional for all question types
    // No mandatory validation for TEXT_ANALYSIS and MAP_ANALYSIS questions

    // Validate sub-questions if they exist
    if (subQuestions && subQuestions.length > 0) {
      for (let i = 0; i < subQuestions.length; i++) {
        const sq = subQuestions[i]
        if (!sq.text || !sq.points || sq.points < 1) {
          return NextResponse.json(
            { error: `Sub-question ${i + 1} must have text and valid points (greater than 0)` },
            { status: 400 }
          )
        }
        
        if (sq.type === 'CLOSED_ENDED' && sq.isAutoScored) {
          if (!sq.options || sq.options.length < 2) {
            return NextResponse.json(
              { error: `Sub-question ${i + 1} must have at least 2 options for auto-scoring` },
              { status: 400 }
            )
          }
          if (!sq.correctAnswer) {
            return NextResponse.json(
              { error: `Sub-question ${i + 1} must have a correct answer for auto-scoring` },
              { status: 400 }
            )
          }
        }
      }
    }

    // Update the question
    const updatedQuestion = await prisma.question.update({
      where: { id },
      data: {
        text,
        type,
        options: options || [],
        correctAnswer: correctAnswer || null,
        answerTemplate: answerTemplate || null,
        points: parseInt(points),
        maxPoints: maxPoints ? parseFloat(maxPoints) : null,
        image: image || null,
        matchingPairs: matchingPairs || null,
        subjectId,
        chapterId: null, // Keep as null since we're using text fields now
        paragraphId: null, // Keep as null since we're using text fields now
        chapterName: chapterName || null,
        paragraphName: paragraphName || null,
        grade: parseInt(grade),
        round: parseInt(round),
        isAutoScored: isAutoScored !== undefined ? isAutoScored : true,
        isPublic: isPublic !== undefined ? isPublic : false,
        // Store sub-questions as JSON in a text field for now
        // In the future, you might want to create a separate table for sub-questions
        content: subQuestions ? JSON.stringify(subQuestions) : null
      }
    })

    return NextResponse.json({ question: updatedQuestion })
  } catch (error) {
    console.error('Error updating question:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check if user is authenticated and is admin
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.userType !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Delete the question
    await prisma.question.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Question deleted successfully' })
  } catch (error) {
    console.error('Error deleting question:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
