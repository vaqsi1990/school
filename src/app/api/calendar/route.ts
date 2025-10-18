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

    // Group olympiads by subject
    const groupedOlympiads = olympiads.reduce((acc, olympiad) => {
      olympiad.subjects.forEach(subject => {
        if (!acc[subject]) {
          acc[subject] = []
        }
        acc[subject].push(olympiad)
      })
      return acc
    }, {} as Record<string, typeof olympiads>)

    // Convert grouped olympiads to array format
    const groupedOlympiadArray = Object.entries(groupedOlympiads).map(([subject, subjectOlympiads]) => ({
      subject,
      olympiads: subjectOlympiads.sort((a, b) => a.startDate.getTime() - b.startDate.getTime()),
      totalOlympiads: subjectOlympiads.length,
      earliestStartDate: Math.min(...subjectOlympiads.map(o => o.startDate.getTime())),
      latestEndDate: Math.max(...subjectOlympiads.map(o => o.endDate.getTime()))
    }))

    return NextResponse.json({ 
      olympiads: groupedOlympiadArray,
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
