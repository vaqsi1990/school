import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Get query parameters for filtering
    const { searchParams } = new URL(request.url)
    const eventType = searchParams.get('eventType')
    const month = searchParams.get('month')
    const year = searchParams.get('year')
    
    // Build where clause
    const where: Record<string, unknown> = {
      isActive: true
    }
    
    // Filter by event type if provided
    if (eventType) {
      where.eventType = eventType
    }

    // Filter by month and year if provided
    if (month && year) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1)
      const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59)
      
      where.startDate = {
        gte: startDate,
        lte: endDate
      }
    }

    // Get calendar events
    const events = await prisma.calendarEvent.findMany({
      where,
      include: {
        createdByUser: {
          select: {
            name: true,
            lastname: true
          }
        },
        subject: {
          select: {
            id: true,
            name: true
          }
        },
        curriculum: {
          select: {
            id: true,
            title: true,
            content: true
          }
        }
      },
      orderBy: {
        startDate: 'asc'
      }
    })

    // Process events to include grade curriculum details
    const processedEvents = await Promise.all(events.map(async (event) => {
      const processedEvent = { ...event }
      
      // If gradeCurriculums exists, fetch curriculum details for each grade
      if (event.gradeCurriculums && typeof event.gradeCurriculums === 'object') {
        const gradeCurriculumsWithDetails: Record<string, {
          id: string
          title: string
          content: string | null
        } | null> = {}
        
        for (const [grade, curriculumId] of Object.entries(event.gradeCurriculums)) {
          if (curriculumId && typeof curriculumId === 'string') {
            try {
              const curriculum = await prisma.curriculum.findUnique({
                where: { id: curriculumId },
                select: {
                  id: true,
                  title: true,
                  content: true
                }
              })
              gradeCurriculumsWithDetails[grade] = curriculum
            } catch (error) {
              console.error(`Error fetching curriculum ${curriculumId}:`, error)
              gradeCurriculumsWithDetails[grade] = null
            }
          }
        }
        
        processedEvent.gradeCurriculums = gradeCurriculumsWithDetails
      }
      
      return processedEvent
    }))

    // Group events by date
    const groupedEvents = processedEvents.reduce((acc, event) => {
      const dateKey = event.startDate.toISOString().split('T')[0]
      if (!acc[dateKey]) {
        acc[dateKey] = []
      }
      acc[dateKey].push(event)
      return acc
    }, {} as Record<string, typeof processedEvents>)

    return NextResponse.json({
      events: groupedEvents,
      success: true
    })

  } catch (error) {
    console.error('Error fetching calendar events:', error)
    return NextResponse.json(
      { 
        error: 'სისტემური შეცდომა მოხდა კალენდრის ჩატვირთვისას',
        success: false 
      },
      { status: 500 }
    )
  }
}
