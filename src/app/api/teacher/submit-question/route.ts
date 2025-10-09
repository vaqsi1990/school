import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import { generateCorrectAnswerFromPairs } from '@/utils/matchingUtils'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
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

    // Only verified teachers can submit questions for review
    if (!teacher.isVerified) {
      return NextResponse.json({ error: 'Teacher account not verified' }, { status: 403 })
    }

    // Teachers with question creation permission should use direct creation endpoint
    if (teacher.canCreateQuestions) {
      return NextResponse.json({ error: 'Teachers with question creation permission should use the direct question creation endpoint' }, { status: 403 })
    }

    // Teachers without question creation permission also cannot submit questions
    // This endpoint is disabled - only teachers with canCreateQuestions=true can create questions
    return NextResponse.json({ error: 'არ გაქ გაგზავნის უფლება' }, { status: 403 })
  } catch (error) {
    console.error('Error submitting question:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
