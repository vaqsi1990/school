import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface QuestionWithDetails {
  questionId: string
  question: {
    text: string
    type: string
    options: string[]
    correctAnswer: string | null
    points: number
    image: string | null
    imageOptions: string[]
  }
}

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
    const studentId = session.user.id

    // Get olympiad with participation details
    const olympiad = await prisma.olympiadEvent.findUnique({
      where: { id: resolvedParams.id },
      include: {
        packages: {
          include: {
            questions: {
              include: {
                question: true
              }
            }
          }
        },
        participations: {
          where: { studentId }
        }
      }
    })

    if (!olympiad) {
      return NextResponse.json({ error: 'Olympiad not found' }, { status: 404 })
    }

    const participation = olympiad.participations[0]
    if (!participation) {
      return NextResponse.json({ error: 'Participation not found' }, { status: 404 })
    }

    // Calculate total questions and max score
    const totalQuestions = olympiad.packages.reduce((total, pkg) => {
      return total + pkg.questions.length
    }, 0)

    const maxScore = olympiad.packages.reduce((total, pkg) => {
      return total + pkg.questions.reduce((pkgTotal, qp) => {
        return pkgTotal + ((qp as QuestionWithDetails).question?.points || 1)
      }, 0)
    }, 0)

    // Get actual score from participation
    const score = participation.totalScore || 0
    const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0

    const result = {
      id: olympiad.id,
      title: olympiad.name,
      description: olympiad.description,
      startDate: olympiad.startDate,
      endDate: olympiad.endDate,
      totalQuestions,
      score,
      maxScore,
      percentage,
      status: participation.status,
      startTime: participation.startTime,
      endTime: participation.endTime
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching olympiad results:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
