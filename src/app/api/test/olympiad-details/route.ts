import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Get the first olympiad with all details
    const olympiad = await prisma.olympiadEvent.findFirst({
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

    if (!olympiad) {
      return NextResponse.json({ error: 'No olympiads found' })
    }

    return NextResponse.json({
      olympiad: {
        ...olympiad,
        startDate: olympiad.startDate.toISOString(),
        endDate: olympiad.endDate.toISOString(),
        registrationDeadline: olympiad.registrationDeadline.toISOString()
      }
    })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
