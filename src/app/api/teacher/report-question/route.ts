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

    const { questionId, reason } = await request.json()

    // Validate required fields
    if (!questionId || !reason) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if the question exists and belongs to the teacher's subject
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: { subject: true }
    })

    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 })
    }

    // For verified teachers, check if the question belongs to their subject
    if (teacher.isVerified) {
      const teacherSubject = await prisma.subject.findFirst({
        where: { name: teacher.subject }
      })

      if (!teacherSubject || question.subjectId !== teacherSubject.id) {
        return NextResponse.json({ error: 'Question does not belong to your subject' }, { status: 403 })
      }
    } else {
      // For unverified teachers, check if they created the question
      if (question.createdBy !== teacher.id || question.createdByType !== 'TEACHER') {
        return NextResponse.json({ error: 'You can only report questions you created' }, { status: 403 })
      }
    }

    // Check if the question is already reported
    if (question.isReported) {
      return NextResponse.json({ error: 'Question is already reported' }, { status: 400 })
    }

    // Update the question to mark it as reported
    const updatedQuestion = await prisma.question.update({
      where: { id: questionId },
      data: {
        isReported: true,
        reportReason: reason,
        reportedBy: teacher.id,
        reportedAt: new Date()
      },
      include: {
        subject: true
      }
    })

    return NextResponse.json({ 
      message: 'Question reported successfully',
      question: updatedQuestion 
    })
  } catch (error) {
    console.error('Error reporting question:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
