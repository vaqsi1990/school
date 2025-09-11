import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateCorrectAnswerFromPairs, generateCorrectAnswerFromSides } from '@/utils/matchingUtils'

interface SubQuestion {
  id: string
  text: string
  type: 'CLOSED_ENDED' | 'OPEN_ENDED'
  options?: string[]
  correctAnswer?: string
  answerTemplate?: string
  points: number
  maxPoints?: number
  isAutoScored: boolean
  image?: string
}

interface QuestionWithSubQuestions {
  id: string
  type: string
  subQuestions?: SubQuestion[]
}

export async function GET() {
  try {
    console.log('=== GET /api/admin/questions START ===')
    
    // Check if user is authenticated and is admin
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.userType !== 'ADMIN') {
      console.log('Authentication failed:', { user: session?.user, userType: session?.user?.userType })
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Authentication successful for user:', session.user.email)

    // Fetch only ACTIVE questions with related data
    const questions = await prisma.question.findMany({
      where: {
        status: 'ACTIVE'
      },
      include: {
        subject: true,
        createdByTeacher: {
          select: {
            name: true,
            lastname: true,
            subject: true,
            school: true
          }
        }
      },
      orderBy: [
        { subject: { name: 'asc' } },
        { grade: 'asc' },
        { round: 'asc' },
        { createdAt: 'desc' }
      ]
    })

    console.log(`Found ${questions.length} questions`)

    // Parse sub-questions from content field for TEXT_ANALYSIS and MAP_ANALYSIS questions
    // Parse leftSide and rightSide for MATCHING questions
    const questionsWithSubQuestions = questions.map((question: typeof questions[0]) => {
      let parsedQuestion: typeof question & { 
        subQuestions?: Array<{
          id: string
          text: string
          type: 'CLOSED_ENDED' | 'OPEN_ENDED'
          options?: string[]
          correctAnswer?: string
          answerTemplate?: string
          points: number
          maxPoints?: number
          isAutoScored: boolean
          image?: string
        }>, 
        leftSide?: unknown, 
        rightSide?: unknown, 
        matchingPairs?: unknown 
      } = { ...question }
      
      if ((question.type === 'TEXT_ANALYSIS' || question.type === 'MAP_ANALYSIS') && question.content) {
        console.log(`Question ${question.id} content:`, question.content)
        console.log(`Question ${question.id} content type:`, typeof question.content)
        console.log(`Question ${question.id} content length:`, question.content.length)
        try {
          const subQuestions = JSON.parse(question.content)
          console.log(`Question ${question.id} parsed subQuestions:`, subQuestions)
          parsedQuestion = {
            ...parsedQuestion,
            subQuestions: Array.isArray(subQuestions) ? subQuestions : []
          }
        } catch (error) {
          console.error('Error parsing sub-questions for question:', question.id, error)
          console.error('Raw content that failed to parse:', question.content)
          parsedQuestion = {
            ...parsedQuestion,
            subQuestions: []
          }
        }
      }
      
      if (question.type === 'MATCHING') {
        try {
          if (question.leftSide && typeof question.leftSide === 'string') {
            parsedQuestion.leftSide = JSON.parse(question.leftSide)
          }
          if (question.rightSide && typeof question.rightSide === 'string') {
            parsedQuestion.rightSide = JSON.parse(question.rightSide)
          }
          if (question.matchingPairs && typeof question.matchingPairs === 'string') {
            parsedQuestion.matchingPairs = JSON.parse(question.matchingPairs)
          }
        } catch (error) {
          console.error('Error parsing matching question data for question:', question.id, error)
        }
      }
      
      return parsedQuestion
    })

    console.log('=== GET /api/admin/questions SUCCESS ===')
    console.log('Returning questions with subQuestions:', questionsWithSubQuestions.filter(q => q.type === 'TEXT_ANALYSIS' || q.type === 'MAP_ANALYSIS').map(q => ({ id: q.id, type: q.type, hasSubQuestions: !!(q as QuestionWithSubQuestions).subQuestions })))
    return NextResponse.json({ questions: questionsWithSubQuestions })
  } catch (error) {
    console.error('=== GET /api/admin/questions ERROR ===')
    console.error('Error fetching questions:', error)
    return NextResponse.json(
      { error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== POST /api/admin/questions START ===')
    
    // Check if user is authenticated and is admin
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.userType !== 'ADMIN') {
      console.log('Authentication failed:', { user: session?.user, userType: session?.user?.userType })
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Authentication successful for user:', session.user.email)

    let body
    try {
      body = await request.json()
      console.log('Request body parsed successfully')
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError)
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 })
    }

    console.log('Received request body:', body)

    const {
      text,
      type,
      options,
      imageOptions,
      useImageOptions,
      correctAnswer,
      answerTemplate,
      points,
      maxPoints,
      image,
      matchingPairs,
      leftSide,
      rightSide,
      subjectId,
      chapterName,
      paragraphName,
      grade,
      round,
      isAutoScored,
      subQuestions
    } = body

    console.log('Parsed fields:', {
      text,
      type,
      options,
      imageOptions,
      useImageOptions,
      correctAnswer,
      points,
      subjectId,
      grade,
      round,
      isAutoScored,
      matchingPairs,
      leftSide,
      rightSide,
      subQuestions
    })

    // Validate required fields
    if (!text || !type || !points || !subjectId || !grade || !round) {
      const missingFields = []
      if (!text) missingFields.push('text')
      if (!type) missingFields.push('type')
      if (!points) missingFields.push('points')
      if (!subjectId) missingFields.push('subjectId')
      if (!grade) missingFields.push('grade')
      if (!round) missingFields.push('round')
      
      const errorMsg = `Missing required fields: ${missingFields.join(', ')}`
      console.log('Validation failed:', errorMsg)
      return NextResponse.json({ error: errorMsg }, { status: 400 })
    }

    // Convert and validate numeric fields
    const pointsNum = parseInt(points.toString())
    const gradeNum = parseInt(grade.toString())
    const roundNum = parseInt(round.toString())
    
    if (isNaN(pointsNum) || pointsNum < 1 || pointsNum > 10) {
      const errorMsg = 'Points must be a number between 1 and 10'
      console.log('Validation failed:', errorMsg)
      return NextResponse.json({ error: errorMsg }, { status: 400 })
    }
    
    if (isNaN(gradeNum) || gradeNum < 7 || gradeNum > 12) {
      const errorMsg = 'Grade must be a number between 7 and 12'
      console.log('Validation failed:', errorMsg)
      return NextResponse.json({ error: errorMsg }, { status: 400 })
    }
    
    if (isNaN(roundNum) || roundNum < 1 || roundNum > 3) {
      const errorMsg = 'Round must be a number between 1 and 3'
      console.log('Validation failed:', errorMsg)
      return NextResponse.json({ error: errorMsg }, { status: 400 })
    }

    // Validate auto-scored questions
    if (isAutoScored && !correctAnswer && type !== 'MATCHING') {
      const errorMsg = 'Auto-scored questions must have a correct answer (except MATCHING questions)'
      console.log('Validation failed:', errorMsg)
      return NextResponse.json({ error: errorMsg }, { status: 400 })
    }

    // Validate question type and options
    if (type === 'CLOSED_ENDED') {
      if (useImageOptions) {
        // For image-based options
        if (!imageOptions || imageOptions.length < 2 || imageOptions.filter((img: string) => img !== '').length < 2) {
          const errorMsg = 'Image-based closed-ended questions must have at least 2 images'
          console.log('Validation failed:', errorMsg)
          return NextResponse.json({ error: errorMsg }, { status: 400 })
        }
      } else {
        // For text-based options
        if (!options || options.length < 2) {
          const errorMsg = 'Closed-ended questions must have at least 2 options'
          console.log('Validation failed:', errorMsg)
          return NextResponse.json({ error: errorMsg }, { status: 400 })
        }
      }
    }

    // Validate matching questions
    if (type === 'MATCHING') {
      console.log('Validating MATCHING question with pairs:', matchingPairs)
      console.log('Validating MATCHING question with leftSide:', leftSide)
      console.log('Validating MATCHING question with rightSide:', rightSide)
      
      // Check if we have the new structure (leftSide/rightSide) or old structure (matchingPairs)
      if (leftSide && rightSide) {
        // New structure validation
        if (!Array.isArray(leftSide) || leftSide.length < 1) {
          const errorMsg = 'Matching questions must have at least one left side item'
          console.log('Validation failed:', errorMsg)
          return NextResponse.json({ error: errorMsg }, { status: 400 })
        }
        
        if (!Array.isArray(rightSide) || rightSide.length < 1) {
          const errorMsg = 'Matching questions must have at least one right side item'
          console.log('Validation failed:', errorMsg)
          return NextResponse.json({ error: errorMsg }, { status: 400 })
        }
        
        // Validate left side items
        const leftValues = new Set()
        for (let i = 0; i < leftSide.length; i++) {
          const leftItem = leftSide[i]
          if (!leftItem || typeof leftItem !== 'object') {
            const errorMsg = `Left side item ${i + 1} must be a valid object`
            console.log('Validation failed:', errorMsg)
            return NextResponse.json({ error: errorMsg }, { status: 400 })
          }
          
          if (!leftItem.left?.trim() && !leftItem.leftImage) {
            const errorMsg = `Left side item ${i + 1} must have text or image`
            console.log('Validation failed:', errorMsg)
            return NextResponse.json({ error: errorMsg }, { status: 400 })
          }
          
          // Check for duplicates in left side
          const leftValue = leftItem.left?.trim() || leftItem.leftImage
          if (leftValues.has(leftValue)) {
            const errorMsg = `Left side item ${i + 1} cannot be duplicate of another left side item`
            console.log('Validation failed:', errorMsg)
            return NextResponse.json({ error: errorMsg }, { status: 400 })
          }
          leftValues.add(leftValue)
        }
        
        // Validate right side items
        const rightValues = new Set()
        for (let i = 0; i < rightSide.length; i++) {
          const rightItem = rightSide[i]
          if (!rightItem || typeof rightItem !== 'object') {
            const errorMsg = `Right side item ${i + 1} must be a valid object`
            console.log('Validation failed:', errorMsg)
            return NextResponse.json({ error: errorMsg }, { status: 400 })
          }
          
          if (!rightItem.right?.trim() && !rightItem.rightImage) {
            const errorMsg = `Right side item ${i + 1} must have text or image`
            console.log('Validation failed:', errorMsg)
            return NextResponse.json({ error: errorMsg }, { status: 400 })
          }
          
          // Check for duplicates in right side
          const rightValue = rightItem.right?.trim() || rightItem.rightImage
          if (rightValues.has(rightValue)) {
            const errorMsg = `Right side item ${i + 1} cannot be duplicate of another right side item`
            console.log('Validation failed:', errorMsg)
            return NextResponse.json({ error: errorMsg }, { status: 400 })
          }
          rightValues.add(rightValue)
        }
      } else if (matchingPairs) {
        // Old structure validation (for backward compatibility)
        if (!Array.isArray(matchingPairs) || matchingPairs.length < 1) {
          const errorMsg = 'Matching questions must have at least one pair'
          console.log('Validation failed:', errorMsg)
          return NextResponse.json({ error: errorMsg }, { status: 400 })
        }
        
        // Validate each pair has left and right values
        for (let i = 0; i < matchingPairs.length; i++) {
          const pair = matchingPairs[i]
          if (!pair || typeof pair !== 'object' || !pair.left || !pair.right) {
            const errorMsg = `Matching pair ${i + 1} must have both left and right values`
            console.log('Validation failed:', errorMsg)
            return NextResponse.json({ error: errorMsg }, { status: 400 })
          }
          if (!pair.left.trim() || !pair.right.trim()) {
            const errorMsg = `Matching pair ${i + 1} left and right values cannot be empty`
            console.log('Validation failed:', errorMsg)
            return NextResponse.json({ error: errorMsg }, { status: 400 })
          }
        }
      } else {
        const errorMsg = 'Matching questions must have either matchingPairs or leftSide/rightSide data'
        console.log('Validation failed:', errorMsg)
        return NextResponse.json({ error: errorMsg }, { status: 400 })
      }
    }

    // Validate sub-questions for analysis questions
    if ((type === 'TEXT_ANALYSIS' || type === 'MAP_ANALYSIS') && (!subQuestions || subQuestions.length === 0)) {
      const errorMsg = 'Text analysis and map analysis questions must have at least one sub-question'
      console.log('Validation failed:', errorMsg)
      return NextResponse.json({ error: errorMsg }, { status: 400 })
    }

    // Validate sub-questions if they exist
    if (subQuestions && subQuestions.length > 0) {
      for (let i = 0; i < subQuestions.length; i++) {
        const sq = subQuestions[i]
        if (!sq.text || !sq.points || sq.points < 1 || sq.points > 10) {
          const errorMsg = `Sub-question ${i + 1} must have text and valid points (1-10)`
          console.log('Validation failed:', errorMsg)
          return NextResponse.json({ error: errorMsg }, { status: 400 })
        }
        
        if (sq.type === 'CLOSED_ENDED' && sq.isAutoScored) {
          if (!sq.options || sq.options.length < 2) {
            const errorMsg = `Sub-question ${i + 1} must have at least 2 options for auto-scoring`
            console.log('Validation failed:', errorMsg)
            return NextResponse.json({ error: errorMsg }, { status: 400 })
          }
          if (!sq.correctAnswer) {
            const errorMsg = `Sub-question ${i + 1} must have a correct answer for auto-scoring`
            console.log('Validation failed:', errorMsg)
            return NextResponse.json({ error: errorMsg }, { status: 400 })
          }
        }
      }
    }

    console.log('All validations passed, creating question...')

    // Calculate correctAnswer for matching questions
    let finalCorrectAnswer = correctAnswer || null;
    if (type === 'MATCHING') {
      if (leftSide && rightSide) {
        finalCorrectAnswer = generateCorrectAnswerFromSides(leftSide, rightSide);
      } else if (matchingPairs) {
        finalCorrectAnswer = generateCorrectAnswerFromPairs(matchingPairs);
      }
      console.log('Generated correctAnswer for matching question:', finalCorrectAnswer);
    }

    try {
      // Create new question with ACTIVE status
      const question = await prisma.question.create({
        data: {
          text,
          type,
          options: useImageOptions ? [] : (options || []),
          imageOptions: useImageOptions ? (imageOptions || []) : [],
          correctAnswer: finalCorrectAnswer,
          answerTemplate: answerTemplate || null,
          points: pointsNum,
          maxPoints: maxPoints ? parseFloat(maxPoints) : null,
          image: image || [],
          matchingPairs: matchingPairs || null,
          leftSide: leftSide || null,
          rightSide: rightSide || null,
          subjectId,
          chapterId: null, // Keep as null since we're using text fields now
          paragraphId: null, // Keep as null since we're using text fields now
          chapterName: chapterName || null,
          paragraphName: paragraphName || null,
          grade: gradeNum,
          round: roundNum,
          createdByType: 'ADMIN',
          status: 'ACTIVE',
          isAutoScored: isAutoScored !== undefined ? isAutoScored : true,
          // Store sub-questions as JSON in a text field for now
          // In the future, you might want to create a separate table for sub-questions
          content: subQuestions ? JSON.stringify(subQuestions) : null
        }
      })

      console.log('Question created successfully:', question)
      console.log('=== POST /api/admin/questions SUCCESS ===')
      return NextResponse.json({ question })
    } catch (dbError) {
      console.error('Database error creating question:', dbError)
      
      // Handle specific database errors
      if (dbError instanceof Error) {
        if (dbError.message.includes('foreign key constraint')) {
          return NextResponse.json(
            { error: 'Invalid subject ID - subject does not exist' },
            { status: 400 }
          )
        }
        if (dbError.message.includes('unique constraint')) {
          return NextResponse.json(
            { error: 'Question with this combination already exists' },
            { status: 400 }
          )
        }
      }
      
      return NextResponse.json(
        { error: `Database error: ${dbError instanceof Error ? dbError.message : 'Unknown database error'}` },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('=== POST /api/admin/questions ERROR ===')
    console.error('Unexpected error in POST handler:', error)
    
    // Ensure we always return a proper error response
    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Server error: ${error.message}` },
        { status: 500 }
      )
    } else {
      return NextResponse.json(
        { error: 'An unexpected error occurred' },
        { status: 500 }
      )
    }
  }
}
