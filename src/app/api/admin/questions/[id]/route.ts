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
      points,
      maxPoints,
      image,
      content,
      matchingPairs,
      rubric,
      subjectId,
      chapterName,
      paragraphName,
      grade,
      round,
      isAutoScored
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

    // Update the question
    const updatedQuestion = await prisma.question.update({
      where: { id },
      data: {
        text,
        type,
        options: options || [],
        correctAnswer: correctAnswer || null,
        points: parseInt(points),
        maxPoints: maxPoints ? parseFloat(maxPoints) : null,
        image: image || null,
        content: content || null,
        matchingPairs: matchingPairs || null,
        rubric: rubric || null,
        subjectId,
        chapterId: null, // Keep as null since we're using text fields now
        paragraphId: null, // Keep as null since we're using text fields now
        chapterName: chapterName || null,
        paragraphName: paragraphName || null,
        grade: parseInt(grade),
        round: parseInt(round),
        isAutoScored: isAutoScored !== undefined ? isAutoScored : true
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
