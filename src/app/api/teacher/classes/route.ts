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
            students: {
              include: {
                student: true
              }
            }
          }
        }
      }
    })

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 })
    }

    return NextResponse.json({ classes: teacher.classes })
  } catch (error) {
    console.error('Error fetching teacher classes:', error)
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
    const { name, description, grade } = body

    // Validate required fields
    if (!name || !grade) {
      return NextResponse.json({ error: 'Name and grade are required' }, { status: 400 })
    }

    // Get teacher info
    const teacher = await prisma.teacher.findUnique({
      where: { userId: session.user.id }
    })

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 })
    }

    // Create the class
    const newClass = await prisma.class.create({
      data: {
        name,
        description: description || null,
        subject: teacher.subject,
        grade: parseInt(grade),
        teacherId: teacher.id
      },
      include: {
        students: {
          include: {
            student: true
          }
        }
      }
    })

    return NextResponse.json({ class: newClass })
  } catch (error) {
    console.error('Error creating class:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}