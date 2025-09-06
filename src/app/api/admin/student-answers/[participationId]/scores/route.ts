import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ participationId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.userType !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resolvedParams = await params
    const participationId = resolvedParams.participationId
    const { scores } = await request.json()

    // Verify participation exists
    const participation = await prisma.studentOlympiadEvent.findUnique({
      where: { id: participationId }
    })

    if (!participation) {
      return NextResponse.json({ error: 'Participation not found' }, { status: 404 })
    }

    // Update scores for each answer
    const updatePromises = Object.entries(scores).map(async ([answerId, score]) => {
      const scoreValue = Number(score)
      return prisma.studentAnswer.update({
        where: { id: answerId },
        data: { 
          points: scoreValue,
          isCorrect: scoreValue > 0 // Simple logic: if score > 0, then correct
        }
      })
    })

    await Promise.all(updatePromises)

    // Calculate total score
    const totalScore = Object.values(scores).reduce((sum: number, score: unknown) => sum + Number(score), 0)

    // Update participation total score
    await prisma.studentOlympiadEvent.update({
      where: { id: participationId },
      data: { totalScore }
    })

    return NextResponse.json({
      message: 'Scores updated successfully',
      totalScore
    })

  } catch (error) {
    console.error('Error updating scores:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
