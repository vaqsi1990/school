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

    return NextResponse.json({
      total: allOlympiads.length,
      olympiads: allOlympiads.map(olympiad => ({
        ...olympiad,
        startDate: olympiad.startDate.toISOString(),
        endDate: olympiad.endDate.toISOString(),
        registrationDeadline: olympiad.registrationDeadline.toISOString()
      }))
    })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
