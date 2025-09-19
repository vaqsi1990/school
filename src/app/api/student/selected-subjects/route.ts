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

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    // Verify the user is requesting their own data
    if (session.user.id !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get selected subjects for the user
    const selectedSubjects = await prisma.studentSubjectSelection.findMany({
      where: {
        userId: userId
      },
      include: {
        subject: {
          select: {
            id: true,
            name: true,
            description: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ 
      selectedSubjects: selectedSubjects.map(selection => selection.subject.id),
      subjects: selectedSubjects.map(selection => ({
        id: selection.subject.id,
        name: selection.subject.name,
        description: selection.subject.description,
        selectedAt: selection.createdAt
      }))
    })

  } catch (error) {
    console.error('Error fetching selected subjects:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
