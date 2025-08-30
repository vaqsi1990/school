import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated and is admin
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.userType !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the admin record for this user
    const admin = await prisma.admin.findUnique({
      where: { userId: session.user.id }
    })

    if (!admin) {
      return NextResponse.json({ error: 'Admin record not found' }, { status: 404 })
    }

    const { name, questionIds, description } = await request.json()

    // Validate required fields
    if (!name || !questionIds || !Array.isArray(questionIds) || questionIds.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify that all questions exist
    const questions = await prisma.question.findMany({
      where: { id: { in: questionIds } }
    })

    if (questions.length !== questionIds.length) {
      return NextResponse.json(
        { error: 'Some questions not found' },
        { status: 400 }
      )
    }

    // Create the question package
    const questionPackage = await prisma.questionPackage.create({
      data: {
        name,
        description: description || '',
        createdBy: admin.id,
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
    // Check if user is authenticated and is admin
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.userType !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all question packages
    const packages = await prisma.questionPackage.findMany({
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
        },
        createdByUser: {
          select: {
            name: true,
            lastname: true
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
