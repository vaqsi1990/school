import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get teacher info
    const teacher = await prisma.teacher.findUnique({
      where: { userId: session.user.id },
      include: {
        classes: {
          include: {
            tests: {
              include: {
                subject: true,
                questions: {
                  include: {
                    question: true
                  }
                },
                results: {
                  include: {
                    student: true
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 })
    }

    return NextResponse.json({ tests: teacher.classes.flatMap(c => c.tests) })
  } catch (error) {
    console.error('Error fetching class tests:', error)
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
    const { title, description, classId, startDate, endDate, duration, questionIds } = body

    // Verify teacher owns the class
    const teacher = await prisma.teacher.findUnique({
      where: { userId: session.user.id },
      include: {
        classes: {
          where: { id: classId }
        }
      }
    })

    if (!teacher || !teacher.classes.length) {
      return NextResponse.json({ error: 'Class not found or access denied' }, { status: 404 })
    }

    // Find subject by teacher's subject name
    const subject = await prisma.subject.findFirst({
      where: { name: teacher.subject }
    })

    if (!subject) {
      return NextResponse.json({ error: 'Subject not found' }, { status: 404 })
    }

    // Create the test
    const test = await prisma.classTest.create({
      data: {
        title,
        description,
        classId,
        teacherId: teacher.id,
        subjectId: subject.id,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        duration: duration ? parseInt(duration) : 60, // Convert to number, default 60 minutes
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
          }
        }
      }
    })

    return NextResponse.json({ test })
  } catch (error) {
    console.error('Error creating class test:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
