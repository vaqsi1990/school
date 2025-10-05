import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Fetch all subjects (public endpoint, no authentication required)
    const subjects = await prisma.subject.findMany({
      orderBy: {
        name: 'asc'
      }
    })

    console.log('Fetched subjects:', subjects) // Debug log

    return NextResponse.json({ subjects })
  } catch (error) {
    console.error('Error fetching subjects:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
