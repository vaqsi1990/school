import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Get all olympiads without any filters
    const allOlympiads = await prisma.olympiadEvent.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        startDate: true,
        endDate: true,
        registrationDeadline: true,
        subjects: true,
        grades: true,
        isActive: true,
        maxParticipants: true
      }
    })

    // Get student count for each olympiad
    const olympiadsWithCounts = await Promise.all(
      allOlympiads.map(async (olympiad) => {
        const studentCount = await prisma.studentOlympiadEvent.count({
          where: { olympiadEventId: olympiad.id }
        })
        
        return {
          ...olympiad,
          studentCount,
          startDate: olympiad.startDate.toISOString(),
          endDate: olympiad.endDate.toISOString(),
          registrationDeadline: olympiad.registrationDeadline.toISOString()
        }
      })
    )

    return NextResponse.json({
      total: olympiadsWithCounts.length,
      olympiads: olympiadsWithCounts
    })

  } catch (error) {
    console.error('Error fetching test olympiads:', error)
    return NextResponse.json(
      { error: 'Test failed', details: error },
      { status: 500 }
    )
  }
}
