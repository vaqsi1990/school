import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import { generateCorrectAnswerFromPairs } from '@/utils/matchingUtils'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
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

    // For both verified and unverified teachers, only get their own PENDING questions
    // Approved questions (ACTIVE) should not appear in teacher's list
    const questions = await prisma.question.findMany({
      where: {
        createdBy: teacher.id,
        status: 'PENDING'
      },
      include: {
        subject: true
      },
      orderBy: [
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json({ questions })
  } catch (error) {
    console.error('Error fetching teacher questions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('Teacher questions POST request received')
    
    // Check if user is authenticated and is teacher
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.userType !== 'TEACHER') {
      console.log('Unauthorized access attempt')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the teacher record for this user
    const teacher = await prisma.teacher.findUnique({
      where: { userId: session.user.id }
    })

    if (!teacher) {
      console.log('Teacher record not found for user:', session.user.id)
      return NextResponse.json({ error: 'Teacher record not found' }, { status: 404 })
    }

    // Only verified teachers can create questions directly
    if (!teacher.isVerified) {
      console.log('Unverified teacher attempted to create question:', teacher.id)
      return NextResponse.json({ error: 'Teacher account not verified' }, { status: 403 })
    }

    const { text, type, grade, round, options, correctAnswer, matchingPairs, image, imageOptions, useImageOptions, chapterName, paragraphName } = await request.json()
    
    console.log('Request data received:', { text, type, grade, round, useImageOptions, hasOptions: !!options, hasImageOptions: !!imageOptions })

    // Validate required fields
    if (!text || !type || !grade || !round) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate type-specific fields
    if (type === 'CLOSED_ENDED') {
      if (useImageOptions) {
        if (!imageOptions || !Array.isArray(imageOptions) || imageOptions.length === 0) {
          return NextResponse.json(
            { error: 'Closed-ended questions with image options require at least one image option' },
            { status: 400 }
          )
        }
      } else {
        if (!options || !Array.isArray(options) || options.length === 0) {
          return NextResponse.json(
            { error: 'Closed-ended questions require options' },
            { status: 400 }
          )
        }
      }
    }

    // Validate matching questions
    if (type === 'MATCHING') {
      if (!matchingPairs || !Array.isArray(matchingPairs) || matchingPairs.length < 1) {
        return NextResponse.json(
          { error: 'Matching questions must have at least one pair' },
          { status: 400 }
        )
      }
      
      // Validate each pair has left and right values
      for (let i = 0; i < matchingPairs.length; i++) {
        const pair = matchingPairs[i]
        if (!pair || typeof pair !== 'object' || !pair.left || !pair.right) {
          return NextResponse.json(
            { error: `Matching pair ${i + 1} must have both left and right values` },
            { status: 400 }
          )
        }
        if (!pair.left.trim() || !pair.right.trim()) {
          return NextResponse.json(
            { error: `Matching pair ${i + 1} left and right values cannot be empty` },
            { status: 400 }
          )
        }
      }
    }

        // Get or create the subject for the teacher
    let subject = await prisma.subject.findFirst({
      where: { name: teacher.subject }
    })

    if (!subject) {
      // Create the subject if it doesn't exist
      subject = await prisma.subject.create({
        data: {
          name: teacher.subject,
          description: `${teacher.subject} subject`
        }
      })
    }

    // Calculate correctAnswer for matching questions
    let finalCorrectAnswer = '';
    if (type === 'CLOSED_ENDED') {
      finalCorrectAnswer = useImageOptions ? correctAnswer : (options[correctAnswer] || '');
    } else if (type === 'MATCHING' && matchingPairs) {
      finalCorrectAnswer = generateCorrectAnswerFromPairs(matchingPairs);
    }

    // Create the question with PENDING status (even for verified teachers)
    const question = await prisma.question.create({
      data: {
        text,
        type,
        grade,
        round,
        subjectId: subject.id,
        createdBy: teacher.id,
        createdByType: 'TEACHER',
        status: 'PENDING',
        options: type === 'CLOSED_ENDED' ? (useImageOptions ? [] : options) : [],
        correctAnswer: finalCorrectAnswer,
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
      message: 'Question created successfully',
      question 
    })
  } catch (error) {
    console.error('Error creating question:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
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

    // Only verified teachers can edit questions
    if (!teacher.isVerified) {
      return NextResponse.json({ error: 'Teacher account not verified' }, { status: 403 })
    }

    const { questionId, text, type, grade, round, options, correctAnswer, matchingPairs, image, imageOptions, useImageOptions, chapterName, paragraphName } = await request.json()

    // Validate required fields
    if (!questionId || !text || !type || !grade || !round) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if the question exists and belongs to this teacher
    const existingQuestion = await prisma.question.findFirst({
      where: {
        id: questionId,
        createdBy: teacher.id,
        createdByType: 'TEACHER'
      }
    })

    if (!existingQuestion) {
      return NextResponse.json(
        { error: 'Question not found or not owned by this teacher' },
        { status: 404 }
      )
    }

    // Only allow editing PENDING questions
    if (existingQuestion.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Only pending questions can be edited' },
        { status: 403 }
      )
    }

    // Update the question
    const updatedQuestion = await prisma.question.update({
      where: { id: questionId },
      data: {
        text,
        type,
        grade,
        round,
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
      message: 'Question updated successfully',
      question: updatedQuestion 
    })
  } catch (error) {
    console.error('Error updating question:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
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

    // Only verified teachers can delete questions
    if (!teacher.isVerified) {
      return NextResponse.json({ error: 'Teacher account not verified' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const questionId = searchParams.get('id')

    if (!questionId) {
      return NextResponse.json(
        { error: 'Question ID is required' },
        { status: 400 }
      )
    }

    // Check if the question exists and belongs to this teacher
    const existingQuestion = await prisma.question.findFirst({
      where: {
        id: questionId,
        createdBy: teacher.id,
        createdByType: 'TEACHER'
      }
    })

    if (!existingQuestion) {
      return NextResponse.json(
        { error: 'Question not found or not owned by this teacher' },
        { status: 404 }
      )
    }

    // Only allow deleting PENDING questions
    if (existingQuestion.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Only pending questions can be deleted' },
        { status: 403 }
      )
    }

    // Delete the question
    await prisma.question.delete({
      where: { id: questionId }
    })

    return NextResponse.json({ 
      message: 'Question deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting question:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
