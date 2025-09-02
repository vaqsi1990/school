import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated and is teacher
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.userType !== 'TEACHER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the teacher record for this user
    const teacher = await prisma.teacher.findUnique({
      where: { userId: session.user.id }
    })

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher record not found' }, { status: 404 })
    }

    // Check if teacher is verified
    if (!teacher.isVerified) {
      return NextResponse.json({ error: 'Teacher account not verified' }, { status: 403 })
    }

    // Get the subject ID for the teacher's subject
    const subject = await prisma.subject.findFirst({
      where: { name: teacher.subject }
    })

    if (!subject) {
      return NextResponse.json({ error: 'Teacher subject not found' }, { status: 404 })
    }

    // Get questions from the teacher's subject
    const questions = await prisma.question.findMany({
      where: {
        subjectId: subject.id
      },
      include: {
        subject: true
      },
      orderBy: [
        { grade: 'asc' },
        { round: 'asc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json({ questions })
  } catch (error) {
    console.error('Error fetching teacher questions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
