import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated and is teacher
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.userType !== 'TEACHER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the teacher record for this user
    const teacher = await prisma.teacher.findUnique({
      where: { userId: session.user.id }
    })

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher record not found' }, { status: 404 })
    }

    // Only unverified teachers can submit questions for review
    if (teacher.isVerified) {
      return NextResponse.json({ error: 'Verified teachers should use the direct question creation endpoint' }, { status: 403 })
    }

    const { text, type, grade, round, options, correctAnswer, matchingPairs, image, imageOptions, useImageOptions, chapterName, paragraphName } = await request.json()

    // Validate required fields
    if (!text || !type || !grade || !round) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate type-specific fields
    if (type === 'MULTIPLE_CHOICE' && (!options || !Array.isArray(options) || options.length === 0)) {
      return NextResponse.json(
        { error: 'Multiple choice questions require options' },
        { status: 400 }
      )
    }

    // Get the subject ID for the teacher's subject
    const subject = await prisma.subject.findFirst({
      where: { name: teacher.subject }
    })

    if (!subject) {
      return NextResponse.json({ error: 'Teacher subject not found' }, { status: 404 })
    }

    // Create the question with pending status
    const question = await prisma.question.create({
      data: {
        text,
        type,
        grade,
        round,
        subjectId: subject.id,
        createdBy: teacher.id,
        options: type === 'CLOSED_ENDED' ? (useImageOptions ? [] : options) : [],
        correctAnswer: type === 'CLOSED_ENDED' ? (useImageOptions ? correctAnswer : (options[correctAnswer] || '')) : '',
        matchingPairs: matchingPairs ? matchingPairs : null,
        image: image || null,
        imageOptions: imageOptions || [],
        chapterName: chapterName || null,
        paragraphName: paragraphName || null,
        isAutoScored: ['CLOSED_ENDED', 'MATCHING'].includes(type)
      },
      include: {
        subject: true
      }
    })

    return NextResponse.json({ 
      message: 'Question submitted for review successfully',
      question 
    })
  } catch (error) {
    console.error('Error submitting question:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
