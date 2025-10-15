import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { TestQuestionType, Prisma } from '@prisma/client'

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
    const where: Prisma.TestQuestionWhereInput = {
      isActive: true,
      createdBy: teacher.id
    }

    if (subjectId) {
      where.subjectId = subjectId
    }

    if (grade) {
      where.grade = parseInt(grade)
    }

    if (type && Object.values(TestQuestionType).includes(type as TestQuestionType)) {
      where.type = type as TestQuestionType
    }

    const questions = await prisma.testQuestion.findMany({
      where,
      include: {
        subject: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ questions })
  } catch (error) {
    console.error('Error fetching test questions:', error)
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
      grade,
      image,
      content,
      maxPoints,
      rubric,
      imageOptions
    } = body

    // Get teacher info
    const teacher = await prisma.teacher.findUnique({
      where: { userId: session.user.id }
    })

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 })
    }

    // Only allow OPEN_ENDED and CLOSED_ENDED types for test questions
    if (!Object.values(TestQuestionType).includes(type as TestQuestionType)) {
      return NextResponse.json({ error: 'Only OPEN_ENDED and CLOSED_ENDED question types are allowed' }, { status: 400 })
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

    const question = await prisma.testQuestion.create({
      data: {
        text,
        type: type as TestQuestionType,
        options: options || [],
        correctAnswer,
        answerTemplate,
        points: points || 1,
        subjectId: subject.id,
        grade,
        createdBy: teacher.id,
        image: image || [],
        content,
        maxPoints,
        rubric,
        imageOptions: imageOptions || []
      },
      include: {
        subject: true
      }
    })

    return NextResponse.json({ question })
  } catch (error) {
    console.error('Error creating test question:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
