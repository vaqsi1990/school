import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      title,
      description,
      grade,
      questionIds,
      duration
    } = body

    // Get teacher info
    const teacher = await prisma.teacher.findUnique({
      where: { userId: session.user.id }
    })

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 })
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

    // Create olympiad
    const olympiad = await prisma.olympiad.create({
      data: {
        name: title,
        description,
        grade,
        subjectId: subject.id,
        createdBy: teacher.id,
        startDate: new Date(),
        endDate: new Date(Date.now() + (duration || 60) * 60 * 1000), // Add duration in milliseconds
        isActive: true,
        questions: {
          create: questionIds.map((questionId: string, index: number) => ({
            questionId,
            order: index + 1,
            roundNumber: 1 // Default round
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

    return NextResponse.json({ olympiad })
  } catch (error) {
    console.error('Error creating olympiad from test questions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
