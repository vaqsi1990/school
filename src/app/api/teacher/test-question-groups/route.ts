import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const grade = searchParams.get('grade')

    // Get teacher info
    const teacher = await prisma.teacher.findUnique({
      where: { userId: session.user.id }
    })

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 })
    }

    // Find subject by teacher's subject name
    const subject = await prisma.subject.findFirst({
      where: { name: teacher.subject }
    })

    if (!subject) {
      return NextResponse.json({ error: 'Subject not found' }, { status: 404 })
    }

    // Build where clause
    const where: Prisma.TestQuestionGroupWhereInput = {
      isActive: true,
      createdBy: teacher.id,
      subjectId: subject.id
    }

    if (grade) {
      where.grade = parseInt(grade)
    }

    const groups = await prisma.testQuestionGroup.findMany({
      where,
      include: {
        subject: true,
        questions: {
          include: {
            question: true
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

    return NextResponse.json({ groups })
  } catch (error) {
    console.error('Error fetching test question groups:', error)
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
      name, 
      description, 
      grade,
      questionIds
    } = body

    // Get teacher info
    const teacher = await prisma.teacher.findUnique({
      where: { userId: session.user.id }
    })

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 })
    }

    // Find subject by teacher's subject name
    const subject = await prisma.subject.findFirst({
      where: { name: teacher.subject }
    })

    if (!subject) {
      return NextResponse.json({ error: 'Subject not found' }, { status: 404 })
    }

    const group = await prisma.testQuestionGroup.create({
      data: {
        name,
        description,
        subjectId: subject.id,
        grade,
        createdBy: teacher.id,
        questions: {
          create: questionIds.map((questionId: string, index: number) => ({
            questionId,
            order: index + 1,
            points: 1 // Default points, can be customized later
          }))
        }
      },
      include: {
        subject: true,
        questions: {
          include: {
            question: true
          },
          orderBy: {
            order: 'asc'
          }
        }
      }
    })

    return NextResponse.json({ group })
  } catch (error) {
    console.error('Error creating test question group:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
