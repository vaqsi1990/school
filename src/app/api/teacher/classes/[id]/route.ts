import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// DELETE /api/teacher/classes/[id] - Delete a class
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: classId } = await params

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

    // Delete the class (this will also delete all class-student relationships due to cascade)
    await prisma.class.delete({
      where: {
        id: classId
      }
    })

    return NextResponse.json({ message: 'Class deleted successfully' })
  } catch (error) {
    console.error('Error deleting class:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
