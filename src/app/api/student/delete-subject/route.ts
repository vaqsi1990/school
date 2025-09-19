import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId, subjectId } = await request.json()

    // Verify the user is deleting for themselves
    if (session.user.id !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Check if selection exists
    const existingSelection = await prisma.studentSubjectSelection.findFirst({
      where: {
        userId: userId,
        subjectId: subjectId
      }
    })

    if (!existingSelection) {
      return NextResponse.json({ error: 'Subject selection not found' }, { status: 404 })
    }

    // Delete the selection
    await prisma.studentSubjectSelection.delete({
      where: {
        id: existingSelection.id
      }
    })

    return NextResponse.json({ 
      message: 'Subject selection deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting subject selection:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
