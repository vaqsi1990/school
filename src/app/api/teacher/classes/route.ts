import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/teacher/classes - Get all classes for the teacher
export async function GET() {
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
                student: {
                  select: {
                    id: true,
                    name: true,
                    lastname: true,
                    grade: true,
                    school: true,
                    code: true
                  }
                }
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 })
    }

    return NextResponse.json({ classes: teacher.classes })
  } catch (error) {
    console.error('Error fetching classes:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/teacher/classes - Create a new class
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, description, grade } = await request.json()

    if (!name || !grade) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get teacher info
    const teacher = await prisma.teacher.findUnique({
      where: { userId: session.user.id }
    })

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 })
    }

    // Create the class using teacher's subject
    const newClass = await prisma.class.create({
      data: {
        name,
        description: description || null,
        subject: teacher.subject, // Use teacher's subject automatically
        grade: parseInt(grade),
        teacherId: teacher.id
      },
      include: {
        students: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                lastname: true,
                grade: true,
                school: true,
                code: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json({ class: newClass }, { status: 201 })
  } catch (error) {
    console.error('Error creating class:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
