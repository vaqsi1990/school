import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated and is admin
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.userType !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch all questions with related data
    const questions = await prisma.question.findMany({
      include: {
        subject: true,
        chapter: true,
        paragraph: true
      },
      orderBy: [
        { subject: { name: 'asc' } },
        { grade: 'asc' },
        { round: 'asc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json({ questions })
  } catch (error) {
    console.error('Error fetching questions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated and is admin
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.userType !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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

    // Validate question type and options
    if ((type === 'MULTIPLE_CHOICE' || type === 'TRUE_FALSE') && (!options || options.length < 2)) {
      return NextResponse.json(
        { error: 'Multiple choice and true/false questions must have at least 2 options' },
        { status: 400 }
      )
    }

    // Create new question
    const question = await prisma.question.create({
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

    return NextResponse.json({ question })
  } catch (error) {
    console.error('Error creating question:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
