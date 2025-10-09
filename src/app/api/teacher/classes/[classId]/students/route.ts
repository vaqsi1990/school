import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST /api/teacher/classes/[classId]/students - Add students to a class
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { studentIds } = await request.json()
    const { classId } = await params

    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return NextResponse.json({ error: 'Student IDs are required' }, { status: 400 })
    }

    console.log('Adding students to class:', classId, 'Students:', studentIds)

    // Get teacher info
    const teacher = await prisma.teacher.findUnique({
      where: { userId: session.user.id }
    })

    if (!teacher) {
      console.log('Teacher not found for user:', session.user.id)
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 })
    }

    console.log('Teacher found:', teacher.id)

    // Verify the class belongs to this teacher
    const classRecord = await prisma.class.findFirst({
      where: {
        id: classId,
        teacherId: teacher.id
      }
    })

    if (!classRecord) {
      console.log('Class not found or access denied. ClassId:', classId, 'TeacherId:', teacher.id)
      return NextResponse.json({ error: 'Class not found or access denied' }, { status: 404 })
    }

    console.log('Class found:', classRecord.id, classRecord.name)

    // Add students to the class
    const classStudents = await Promise.all(
      studentIds.map(async (studentId: string) => {
        console.log('Adding student:', studentId, 'to class:', classId)
        try {
          return await prisma.classStudent.create({
            data: {
              classId: classId,
              studentId: studentId
            },
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
          })
        } catch (error: unknown) {
          // If student is already in the class, just return the existing record
          if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
            return await prisma.classStudent.findUniqueOrThrow({
              where: {
                classId_studentId: {
                  classId: classId,
                  studentId: studentId
                }
              },
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
            })
          }
          throw error
        }
      })
    )

    return NextResponse.json({ students: classStudents })
  } catch (error) {
    console.error('Error adding students to class:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/teacher/classes/[classId]/students - Remove students from a class
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { studentIds } = await request.json()
    const { classId } = await params

    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return NextResponse.json({ error: 'Student IDs are required' }, { status: 400 })
    }

    // Get teacher info
    const teacher = await prisma.teacher.findUnique({
      where: { userId: session.user.id }
    })

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 })
    }

    // Verify the class belongs to this teacher
    const classRecord = await prisma.class.findFirst({
      where: {
        id: classId,
        teacherId: teacher.id
      }
    })

    if (!classRecord) {
      return NextResponse.json({ error: 'Class not found or access denied' }, { status: 404 })
    }

    // Remove students from the class
    await prisma.classStudent.deleteMany({
      where: {
        classId: classId,
        studentId: {
          in: studentIds
        }
      }
    })

    return NextResponse.json({ message: 'Students removed successfully' })
  } catch (error) {
    console.error('Error removing students from class:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
