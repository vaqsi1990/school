import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    console.log('=== GET /api/admin/questions START ===')
    
    // Check if user is authenticated and is admin
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.userType !== 'ADMIN') {
      console.log('Authentication failed:', { user: session?.user, userType: session?.user?.userType })
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Authentication successful for user:', session.user.email)

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

    console.log(`Found ${questions.length} questions`)

    // Parse sub-questions from content field for TEXT_ANALYSIS and MAP_ANALYSIS questions
    const questionsWithSubQuestions = questions.map(question => {
      if ((question.type === 'TEXT_ANALYSIS' || question.type === 'MAP_ANALYSIS') && question.content) {
        try {
          const subQuestions = JSON.parse(question.content)
          return {
            ...question,
            subQuestions: Array.isArray(subQuestions) ? subQuestions : []
          }
        } catch (error) {
          console.error('Error parsing sub-questions for question:', question.id, error)
          return {
            ...question,
            subQuestions: []
          }
        }
      }
      return question
    })

    console.log('=== GET /api/admin/questions SUCCESS ===')
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
      correctAnswer,
      points,
      maxPoints,
      image,
      matchingPairs,
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
      correctAnswer,
      points,
      subjectId,
      grade,
      round,
      isAutoScored,
      matchingPairs,
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
    if (type === 'CLOSED_ENDED' && (!options || options.length < 2)) {
      const errorMsg = 'Closed-ended questions must have at least 2 options'
      console.log('Validation failed:', errorMsg)
      return NextResponse.json({ error: errorMsg }, { status: 400 })
    }

    // Validate matching questions
    if (type === 'MATCHING') {
      console.log('Validating MATCHING question with pairs:', matchingPairs)
      if (!matchingPairs || !Array.isArray(matchingPairs) || matchingPairs.length < 1) {
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

    try {
      // Create new question
      const question = await prisma.question.create({
        data: {
          text,
          type,
          options: options || [],
          correctAnswer: correctAnswer || null,
          points: pointsNum,
          maxPoints: maxPoints ? parseFloat(maxPoints) : null,
          image: image || null,
          matchingPairs: matchingPairs || null,
          subjectId,
          chapterId: null, // Keep as null since we're using text fields now
          paragraphId: null, // Keep as null since we're using text fields now
          chapterName: chapterName || null,
          paragraphName: paragraphName || null,
          grade: gradeNum,
          round: roundNum,
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
