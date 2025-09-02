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
      where: { userId: session.user.id },
      include: { user: true }
    })

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher record not found' }, { status: 404 })
    }

    // Check if teacher is verified
    if (!teacher.isVerified) {
      return NextResponse.json({ error: 'Teacher account not verified' }, { status: 403 })
    }

    const { name, questionIds, description } = await request.json()

    // Validate required fields
    if (!name || !questionIds || !Array.isArray(questionIds) || questionIds.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify that all questions exist and belong to the teacher's subject
    const questions = await prisma.question.findMany({
      where: { 
        id: { in: questionIds },
        subjectId: {
          in: await prisma.subject.findMany({
            where: { name: teacher.subject },
            select: { id: true }
          }).then(subjects => subjects.map(s => s.id))
        }
      },
      include: {
        subject: true
      }
    })

    if (questions.length !== questionIds.length) {
      return NextResponse.json(
        { error: 'Some questions not found or do not belong to your subject' },
        { status: 400 }
      )
    }

    // Verify that all questions are from the teacher's subject
    const teacherSubject = await prisma.subject.findFirst({
      where: { name: teacher.subject }
    })

    if (!teacherSubject) {
      return NextResponse.json(
        { error: 'Teacher subject not found' },
        { status: 400 }
      )
    }

    const invalidQuestions = questions.filter(q => q.subjectId !== teacherSubject.id)
    if (invalidQuestions.length > 0) {
      return NextResponse.json(
        { error: 'Some questions do not belong to your registered subject' },
        { status: 400 }
      )
    }

    // Create the question package
    const questionPackage = await prisma.questionPackage.create({
      data: {
        name,
        description: description || '',
        createdBy: teacher.id, // This will be the teacher's ID
        createdByType: 'TEACHER',
        questions: {
          create: questionIds.map((questionId: string, index: number) => ({
            questionId,
            order: index + 1
          }))
        }
      },
      include: {
        questions: {
          include: {
            question: {
              include: {
                subject: true
              }
            }
          },
          orderBy: {
            order: 'asc'
          }
        }
      }
    })

    return NextResponse.json({ 
      message: 'Question package created successfully',
      package: questionPackage 
    })
  } catch (error) {
    console.error('Error creating question package:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

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

    // Get question packages created by this teacher
    const packages = await prisma.questionPackage.findMany({
      where: {
        createdBy: teacher.id
      },
      include: {
        questions: {
          include: {
            question: {
              include: {
                subject: true
              }
            }
          },
          orderBy: {
            order: 'asc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ packages })
  } catch (error) {
    console.error('Error fetching question packages:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
