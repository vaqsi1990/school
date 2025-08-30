import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated and is admin
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.userType !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const subjectId = searchParams.get('subjectId')
    const grade = searchParams.get('grade')

    if (!subjectId) {
      return NextResponse.json(
        { error: 'Subject ID is required' },
        { status: 400 }
      )
    }

    // Fetch paragraphs for the specified subject
    // Note: We'll filter by subject through chapters for now
    const paragraphs = await prisma.paragraph.findMany({
      where: {
        chapter: {
          subjectId: subjectId
        }
      },
      include: {
        chapter: true
      },
      orderBy: [
        { chapter: { order: 'asc' } },
        { order: 'asc' }
      ]
    })

    return NextResponse.json({ paragraphs })
  } catch (error) {
    console.error('Error fetching paragraphs:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated and is admin
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.userType !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, content, order, chapterId } = await request.json()

    if (!name || !chapterId) {
      return NextResponse.json(
        { error: 'Paragraph name and chapter ID are required' },
        { status: 400 }
      )
    }

    // Create new paragraph
    const paragraph = await prisma.paragraph.create({
      data: {
        name,
        content,
        order: order || 1,
        chapterId
      }
    })

    return NextResponse.json({ paragraph })
  } catch (error) {
    console.error('Error creating paragraph:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
