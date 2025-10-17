import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Get query parameters for filtering
    const { searchParams } = new URL(request.url)
    const subjects = searchParams.get('subjects')?.split(',') || []
    
    // Build where clause
    const where: Record<string, unknown> = {
      isActive: true
    }
    
    // Filter by subjects if provided
    if (subjects.length > 0) {
      where.subjects = {
        hasSome: subjects
      }
    }

    // Get olympiad events
    const olympiads = await prisma.olympiadEvent.findMany({
      where,
      include: {
        createdByUser: {
          select: {
            name: true,
            lastname: true
          }
        },
        curriculum: {
          select: {
            id: true,
            title: true,
            content: true
          }
        },
        _count: {
          select: {
            participations: true
          }
        }
      },
      orderBy: {
        startDate: 'asc'
      }
    })

    return NextResponse.json({ 
      olympiads,
      success: true 
    })

  } catch (error) {
    console.error('Error fetching calendar olympiads:', error)
    return NextResponse.json(
      { 
        error: 'სისტემური შეცდომა მოხდა კალენდრის ჩატვირთვისას',
        success: false 
      },
      { status: 500 }
    )
  }
}
