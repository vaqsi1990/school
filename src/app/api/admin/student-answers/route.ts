import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.userType !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')
    const olympiadId = searchParams.get('olympiadId')
    const search = searchParams.get('search')

    const skip = (page - 1) * limit

    // Build where clause
    const where: Record<string, unknown> = {}
    
    if (status && status !== 'all') {
      where.status = status
    }
    
    if (olympiadId && olympiadId !== 'all') {
      where.olympiadEventId = olympiadId
    }

    if (search) {
      where.OR = [
        {
          student: {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { lastname: { contains: search, mode: 'insensitive' } }
            ]
          }
        },
        {
          olympiadEvent: {
            name: { contains: search, mode: 'insensitive' }
          }
        }
      ]
    }

    // Debug: Check total participations
    const totalParticipations = await prisma.studentOlympiadEvent.count()
    console.log('Debug - Total participations:', totalParticipations)
    console.log('Debug - Where clause:', where)

    // Get student answers with related data
    const [answers, totalCount] = await Promise.all([
      prisma.studentOlympiadEvent.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          student: {
            select: {
              id: true,
              name: true,
              lastname: true,
              grade: true
            }
          },
          olympiadEvent: {
            select: {
              id: true,
              name: true,
              subjects: true,
              grades: true
            }
          }
        }
      }),
      prisma.studentOlympiadEvent.count({ where })
    ])

    console.log('Debug - Found answers:', answers.length)
    console.log('Debug - Total count:', totalCount)

    // Transform the data to match the expected interface
    const transformedAnswers = answers.map(answer => ({
      id: answer.id,
      studentId: answer.studentId,
      studentName: answer.student.name,
      studentLastname: answer.student.lastname,
      olympiadName: answer.olympiadEvent.name,
      subject: answer.olympiadEvent.subjects.join(', '),
      grade: answer.student.grade,
      round: answer.currentRound || 1,
      totalScore: null, // Don't show scores until tests are corrected
      maxScore: null, // Don't show scores until tests are corrected
      status: answer.status,
      submittedAt: answer.createdAt.toISOString(),
      endTime: answer.endTime?.toISOString(),
      participationId: answer.id
    }))

    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      answers: transformedAnswers,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages
      }
    })

  } catch (error) {
    console.error('Error fetching student answers:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
