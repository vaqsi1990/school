import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    console.log('=== GET /api/admin/teacher-questions START ===')
    
    // Check if user is authenticated and is admin
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.userType !== 'ADMIN') {
      console.log('Authentication failed:', { user: session?.user, userType: session?.user?.userType })
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Authentication successful for user:', session.user.email)

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'PENDING'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Build where clause based on status
    let whereClause: {
      createdByType: 'TEACHER'
      isReported?: boolean
      status?: 'PENDING' | 'ACTIVE' | 'REJECTED'
    } = {
      createdByType: 'TEACHER'
    }

    if (status === 'REPORTED') {
      // For reported questions, filter by isReported = true
      whereClause.isReported = true
    } else {
      // For other statuses, filter by status field
      whereClause.status = status as 'PENDING' | 'ACTIVE' | 'REJECTED'
    }

    // Fetch teacher questions with related data
    const questions = await prisma.question.findMany({
      where: whereClause,
      include: {
        subject: true
      },
      orderBy: [
        { createdAt: 'desc' }
      ],
      skip,
      take: limit
    })

    // Get total count for pagination
    const totalCount = await prisma.question.count({
      where: whereClause
    })

    // Get counts for different statuses
    const pendingCount = await prisma.question.count({
      where: {
        createdByType: 'TEACHER',
        status: 'PENDING'
      }
    })

    const activeCount = await prisma.question.count({
      where: {
        createdByType: 'TEACHER',
        status: 'ACTIVE'
      }
    })

    const rejectedCount = await prisma.question.count({
      where: {
        createdByType: 'TEACHER',
        status: 'REJECTED'
      }
    })

    const reportedCount = await prisma.question.count({
      where: {
        createdByType: 'TEACHER',
        isReported: true
      }
    })

    // Fetch teacher information for each question
    const questionsWithTeachers = await Promise.all(
      questions.map(async (question) => {
        let teacherInfo = null
        if (question.createdBy) {
          const teacher = await prisma.teacher.findUnique({
            where: { id: question.createdBy },
            select: {
              name: true,
              lastname: true,
              subject: true,
              school: true
            }
          })
          teacherInfo = teacher
        }
        
        return {
          ...question,
          createdByTeacher: teacherInfo
        }
      })
    )

    console.log(`Found ${questions.length} teacher questions with status: ${status}`)
    console.log('=== GET /api/admin/teacher-questions SUCCESS ===')
    
    return NextResponse.json({ 
      questions: questionsWithTeachers,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      },
      counts: {
        pending: pendingCount,
        active: activeCount,
        rejected: rejectedCount,
        reported: reportedCount
      }
    })
  } catch (error) {
    console.error('=== GET /api/admin/teacher-questions ERROR ===')
    console.error('Error fetching teacher questions:', error)
    return NextResponse.json(
      { error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    console.log('=== PATCH /api/admin/teacher-questions START ===')
    
    // Check if user is authenticated and is admin
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.userType !== 'ADMIN') {
      console.log('Authentication failed:', { user: session?.user, userType: session?.user?.userType })
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Authentication successful for user:', session.user.email)

    const body = await request.json()
    const { questionId, action } = body

    if (!questionId || !action) {
      return NextResponse.json({ error: 'Missing questionId or action' }, { status: 400 })
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action. Must be "approve" or "reject"' }, { status: 400 })
    }

    // Get the question to verify it exists and is a teacher question
    const question = await prisma.question.findFirst({
      where: {
        id: questionId,
        createdByType: 'TEACHER'
      }
    })

    if (!question) {
      return NextResponse.json({ error: 'Question not found or not a teacher question' }, { status: 404 })
    }

    // Update the question status
    const newStatus = action === 'approve' ? 'ACTIVE' : 'REJECTED'
    
    const updatedQuestion = await prisma.question.update({
      where: { id: questionId },
      data: { status: newStatus },
      include: {
        subject: true
      }
    })

    // Fetch teacher information
    let teacherInfo = null
    if (updatedQuestion.createdBy) {
      const teacher = await prisma.teacher.findUnique({
        where: { id: updatedQuestion.createdBy },
        select: {
          name: true,
          lastname: true,
          subject: true,
          school: true
        }
      })
      teacherInfo = teacher
    }

    const questionWithTeacher = {
      ...updatedQuestion,
      createdByTeacher: teacherInfo
    }

    console.log(`Question ${questionId} ${action}d successfully`)
    console.log('=== PATCH /api/admin/teacher-questions SUCCESS ===')
    
    return NextResponse.json({ 
      message: `Question ${action}d successfully`,
      question: questionWithTeacher
    })
  } catch (error) {
    console.error('=== PATCH /api/admin/teacher-questions ERROR ===')
    console.error('Error updating teacher question:', error)
    return NextResponse.json(
      { error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}
