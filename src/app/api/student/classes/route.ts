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

    // Get student information
    const student = await prisma.student.findUnique({
      where: { userId: session.user.id },
      select: { id: true }
    })

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    // Get classes where the student is enrolled
    const classMemberships = await prisma.classStudent.findMany({
      where: {
        studentId: student.id
      },
      include: {
        class: {
          include: {
            teacher: {
              select: {
                name: true,
                lastname: true
              }
            }
          }
        }
      },
      orderBy: {
        joinedAt: 'desc'
      }
    })

    // Transform the data
    const classes = classMemberships.map(membership => ({
      id: membership.class.id,
      name: membership.class.name,
      description: membership.class.description,
      subject: membership.class.subject,
      grade: membership.class.grade,
      teacherName: `${membership.class.teacher.name} ${membership.class.teacher.lastname}`,
      joinedAt: membership.joinedAt
    }))

    return NextResponse.json({ classes })
  } catch (error) {
    console.error('Error fetching student classes:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
