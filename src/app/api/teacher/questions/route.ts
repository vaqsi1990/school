import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { QuestionType, Prisma } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const subjectId = searchParams.get('subjectId')
    const grade = searchParams.get('grade')
    const type = searchParams.get('type')

    // Get teacher info
    const teacher = await prisma.teacher.findUnique({
      where: { userId: session.user.id }
    })

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 })
    }

    // Build where clause
    const where: Prisma.QuestionWhereInput = {
      status: 'ACTIVE',
      OR: [
        { isPublic: true },
        { createdBy: teacher.id }
      ]
    }

    if (subjectId) {
      where.subjectId = subjectId
    }

    if (grade) {
      where.grade = parseInt(grade)
    }

    if (type && Object.values(QuestionType).includes(type as QuestionType)) {
      where.type = type as QuestionType
    }

    const questions = await prisma.question.findMany({
      where,
      include: {
        subject: true,
        chapter: true,
        paragraph: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ questions })
  } catch (error) {
    console.error('Error fetching questions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      text, 
      type, 
      options, 
      correctAnswer, 
      answerTemplate, 
      points, 
      subjectId, 
      chapterId, 
      paragraphId, 
      grade,
      image,
      content,
      maxPoints,
      rubric,
      imageOptions,
      matchingPairs,
      leftSide,
      rightSide
    } = body

    // Get teacher info
    const teacher = await prisma.teacher.findUnique({
      where: { userId: session.user.id }
    })

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 })
    }

    // Only allow OPEN_ENDED and CLOSED_ENDED types for class tests
    if (!['OPEN_ENDED', 'CLOSED_ENDED'].includes(type)) {
      return NextResponse.json({ error: 'Only OPEN_ENDED and CLOSED_ENDED question types are allowed' }, { status: 400 })
    }

    const question = await prisma.question.create({
      data: {
        text,
        type: type as QuestionType,
        options: options || [],
        correctAnswer,
        answerTemplate,
        points: points || 1,
        subjectId,
        chapterId,
        paragraphId,
        grade,
        createdBy: teacher.id,
        createdByType: 'TEACHER',
        image: image || [],
        content,
        maxPoints,
        rubric,
        imageOptions: imageOptions || [],
        matchingPairs,
        leftSide,
        rightSide,
        round: 1,
        isAutoScored: type === 'CLOSED_ENDED',
        isPublic: false
      },
      include: {
        subject: true,
        chapter: true,
        paragraph: true
      }
    })

    return NextResponse.json({ question })
  } catch (error) {
    console.error('Error creating question:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}