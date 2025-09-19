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

    const { userId, subjectId } = await request.json()

    // Verify the user is selecting for themselves
    if (session.user.id !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Check if subject exists
    const subject = await prisma.subject.findUnique({
      where: { id: subjectId }
    })

    if (!subject) {
      return NextResponse.json({ error: 'Subject not found' }, { status: 404 })
    }

    // Check if already selected
    const existingSelection = await prisma.studentSubjectSelection.findFirst({
      where: {
        userId: userId,
        subjectId: subjectId
      }
    })

    if (existingSelection) {
      return NextResponse.json({ error: 'Subject already selected' }, { status: 400 })
    }

    // Create the selection
    await prisma.studentSubjectSelection.create({
      data: {
        userId: userId,
        subjectId: subjectId
      }
    })

    return NextResponse.json({ 
      message: 'Subject selected successfully',
      subject: {
        id: subject.id,
        name: subject.name
      }
    })

  } catch (error) {
    console.error('Error selecting subject:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
