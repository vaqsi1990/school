import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resolvedParams = await params
    const classId = resolvedParams.id

    // Get student information
    const student = await prisma.student.findUnique({
      where: { userId: session.user.id },
      select: { id: true }
    })

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    // Check if student is enrolled in this class
    const classMembership = await prisma.classStudent.findFirst({
      where: {
        studentId: student.id,
        classId: classId
      },
      include: {
        class: {
          include: {
            teacher: {
              select: {
                name: true,
                lastname: true,
                user: {
                  select: {
                    email: true
                  }
                }
              }
            },
            students: {
              include: {
                student: {
                  select: {
                    name: true,
                    lastname: true,
                    grade: true,
                    school: true
                  }
                }
              },
              orderBy: {
                joinedAt: 'asc'
              }
            }
          }
        }
      }
    })

    if (!classMembership) {
      return NextResponse.json({ error: 'Class not found or access denied' }, { status: 404 })
    }

    const classData = classMembership.class

    // Transform the data
    const classDetails = {
      id: classData.id,
      name: classData.name,
      description: classData.description,
      subject: classData.subject,
      grade: classData.grade,
      teacher: {
        name: `${classData.teacher.name} ${classData.teacher.lastname}`,
        email: classData.teacher.user.email
      },
      students: classData.students.map(membership => ({
        id: membership.id,
        name: membership.student.name,
        lastname: membership.student.lastname,
        grade: membership.student.grade,
        school: membership.student.school,
        joinedAt: membership.joinedAt
      })),
      totalStudents: classData.students.length,
      createdAt: classData.createdAt,
      joinedAt: classMembership.joinedAt
    }

    return NextResponse.json({ class: classDetails })
  } catch (error) {
    console.error('Error fetching class details:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
