import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if user is authenticated and is admin
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.userType !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const questionId = params.id
    const {
      text,
      type,
      options,
      correctAnswer,
      points,
      image,
      subjectId,
      chapterId,
      paragraphId,
      grade,
      round
    } = await request.json()

    // Validate required fields
    if (!text || !type || !correctAnswer || !points || !subjectId || !grade || !round) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Update the question
    const updatedQuestion = await prisma.question.update({
      where: { id: questionId },
      data: {
        text,
        type,
        options: options || [],
        correctAnswer,
        points: parseInt(points),
        image: image || null,
        subjectId,
        chapterId: chapterId || null,
        paragraphId: paragraphId || null,
        grade: parseInt(grade),
        round: parseInt(round)
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
  { params }: { params: { id: string } }
) {
  try {
    // Check if user is authenticated and is admin
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.userType !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const questionId = params.id

    // Delete the question
    await prisma.question.delete({
      where: { id: questionId }
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
