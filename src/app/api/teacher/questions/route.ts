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

    // Build where clause - show teacher's own questions (both pending and active)
    const where: Prisma.QuestionWhereInput = {
      status: {
        in: ['PENDING', 'ACTIVE']
      },
      createdBy: teacher.id
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
      rightSide,
      round
    } = body

    // Get teacher info
    const teacher = await prisma.teacher.findUnique({
      where: { userId: session.user.id }
    })

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 })
    }

    // Find subject by teacher's subject name (trim whitespace)
    const subject = await prisma.subject.findFirst({
      where: { 
        name: {
          equals: teacher.subject.trim()
        }
      }
    })

    if (!subject) {
      return NextResponse.json({ error: 'Subject not found' }, { status: 404 })
    }

    // Validate question type
    if (!['OPEN_ENDED', 'CLOSED_ENDED', 'MATCHING', 'TEXT_ANALYSIS', 'MAP_ANALYSIS'].includes(type)) {
      return NextResponse.json({ error: 'Invalid question type' }, { status: 400 })
    }

    const question = await prisma.question.create({
      data: {
        text,
        type: type as QuestionType,
        options: options || [],
        correctAnswer,
        answerTemplate,
        points: points || 1,
        subjectId: subject.id,
        chapterId,
        paragraphId,
        grade,
        createdBy: teacher.id,
        createdByType: 'TEACHER',
        status: 'PENDING', // Questions need admin approval
        image: image || [],
        content,
        maxPoints,
        rubric,
        imageOptions: imageOptions || [],
        matchingPairs,
        leftSide,
        rightSide,
        round: round || 1,
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

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      questionId,
      text, 
      type, 
      options, 
      correctAnswer, 
      answerTemplate, 
      points, 
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

    // Check if question exists and belongs to this teacher
    const existingQuestion = await prisma.question.findFirst({
      where: {
        id: questionId,
        createdBy: teacher.id
      }
    })

    if (!existingQuestion) {
      return NextResponse.json({ error: 'Question not found or access denied' }, { status: 404 })
    }

    // Validate question type
    if (!['OPEN_ENDED', 'CLOSED_ENDED', 'MATCHING', 'TEXT_ANALYSIS', 'MAP_ANALYSIS'].includes(type)) {
      return NextResponse.json({ error: 'Invalid question type' }, { status: 400 })
    }

    const question = await prisma.question.update({
      where: { id: questionId },
      data: {
        text,
        type: type as QuestionType,
        options: options || [],
        correctAnswer,
        answerTemplate,
        points: points || 1,
        chapterId,
        paragraphId,
        grade,
        image: image || [],
        content,
        maxPoints,
        rubric,
        imageOptions: imageOptions || [],
        matchingPairs,
        leftSide,
        rightSide,
        isAutoScored: type === 'CLOSED_ENDED',
        updatedAt: new Date()
      },
      include: {
        subject: true,
        chapter: true,
        paragraph: true
      }
    })

    return NextResponse.json({ question })
  } catch (error) {
    console.error('Error updating question:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const questionId = searchParams.get('id')

    if (!questionId) {
      return NextResponse.json({ error: 'Question ID is required' }, { status: 400 })
    }

    // Get teacher info
    const teacher = await prisma.teacher.findUnique({
      where: { userId: session.user.id }
    })

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 })
    }

    // Check if question exists and belongs to this teacher
    const existingQuestion = await prisma.question.findFirst({
      where: {
        id: questionId,
        createdBy: teacher.id
      }
    })

    if (!existingQuestion) {
      return NextResponse.json({ error: 'Question not found or access denied' }, { status: 404 })
    }

    await prisma.question.delete({
      where: { id: questionId }
    })

    return NextResponse.json({ message: 'Question deleted successfully' })
  } catch (error) {
    console.error('Error deleting question:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}