import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('=== GET /api/admin/teacher-questions/[id] START ===')
    
    // Check if user is authenticated and is admin
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.userType !== 'ADMIN') {
      console.log('Authentication failed:', { user: session?.user, userType: session?.user?.userType })
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Authentication successful for user:', session.user.email)

    const { id: questionId } = await params

    // Fetch the question with all related data
    const question = await prisma.question.findFirst({
      where: {
        id: questionId,
        createdByType: 'TEACHER'
      },
      include: {
        subject: true,
        chapter: true,
        paragraph: true,
        createdByTeacher: {
          select: {
            name: true,
            lastname: true,
            subject: true,
            school: true
          }
        }
      }
    })

    if (!question) {
      return NextResponse.json({ error: 'კითხვა ვერ მოიძებნა' }, { status: 404 })
    }

    console.log('=== GET /api/admin/teacher-questions/[id] SUCCESS ===')
    
    return NextResponse.json({ question })
  } catch (error) {
    console.error('=== GET /api/admin/teacher-questions/[id] ERROR ===')
    console.error('Error fetching question:', error)
    return NextResponse.json(
      { error: `სისტემური შეცდომა: ${error instanceof Error ? error.message : 'უცნობი შეცდომა'}` },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('=== PUT /api/admin/teacher-questions/[id] START ===')
    
    // Check if user is authenticated and is admin
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.userType !== 'ADMIN') {
      console.log('Authentication failed:', { user: session?.user, userType: session?.user?.userType })
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Authentication successful for user:', session.user.email)

    const { id: questionId } = await params
    const body = await request.json()

    // Validate required fields
    const { text, type, options, correctAnswer, points, maxPoints, image, content, matchingPairs, rubric, subjectId, chapterId, paragraphId, chapterName, paragraphName, grade, round, isAutoScored } = body

    if (!text || !type || !subjectId || !grade || !round) {
      return NextResponse.json({ error: 'ყველა სავალდებულო ველი უნდა იყოს შევსებული' }, { status: 400 })
    }

    // Check if question exists and is a teacher question
    const existingQuestion = await prisma.question.findFirst({
      where: {
        id: questionId,
        createdByType: 'TEACHER'
      }
    })

    if (!existingQuestion) {
      return NextResponse.json({ error: 'კითხვა ვერ მოიძებნა' }, { status: 404 })
    }

    // Update the question
    const updatedQuestion = await prisma.question.update({
      where: { id: questionId },
      data: {
        text,
        type,
        options: options || [],
        imageOptions: body.imageOptions || [],
        correctAnswer,
        points: points || 1,
        maxPoints,
        image,
        content,
        matchingPairs: matchingPairs ? JSON.parse(JSON.stringify(matchingPairs)) : null,
        rubric,
        subjectId,
        chapterId: chapterId || null,
        paragraphId: paragraphId || null,
        chapterName: chapterName || null,
        paragraphName: paragraphName || null,
        grade,
        round,
        isAutoScored: isAutoScored !== undefined ? isAutoScored : true,
        updatedAt: new Date()
      },
      include: {
        subject: true,
        chapter: true,
        paragraph: true,
        createdByTeacher: {
          select: {
            name: true,
            lastname: true,
            subject: true,
            school: true
          }
        }
      }
    })

    console.log(`Question ${questionId} updated successfully`)
    console.log('=== PUT /api/admin/teacher-questions/[id] SUCCESS ===')
    
    return NextResponse.json({ 
      message: 'კითხვა წარმატებით განახლდა',
      question: updatedQuestion
    })
  } catch (error) {
    console.error('=== PUT /api/admin/teacher-questions/[id] ERROR ===')
    console.error('Error updating question:', error)
    return NextResponse.json(
      { error: `სისტემური შეცდომა: ${error instanceof Error ? error.message : 'უცნობი შეცდომა'}` },
      { status: 500 }
    )
  }
}
