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

    // Validate question type and options
    if ((type === 'MULTIPLE_CHOICE' || type === 'TRUE_FALSE' || type === 'CLOSED_ENDED') && (!options || options.length < 2)) {
      return NextResponse.json(
        { error: 'Multiple choice, true/false, and closed-ended questions must have at least 2 options' },
        { status: 400 }
      )
    }

    // Validate matching questions
    if (type === 'MATCHING' && (!matchingPairs || matchingPairs.length < 1)) {
      return NextResponse.json(
        { error: 'Matching questions must have at least one pair' },
        { status: 400 }
      )
    }

    // Validate content for analysis questions
    if ((type === 'TEXT_ANALYSIS' || type === 'MAP_ANALYSIS') && !content) {
      return NextResponse.json(
        { error: 'Text analysis and map analysis questions must have content' },
        { status: 400 }
      )
    }

    // Create new question
    const question = await prisma.question.create({
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

    return NextResponse.json({ question })
  } catch (error) {
    console.error('Error creating question:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
