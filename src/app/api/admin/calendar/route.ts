import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET - Fetch all calendar events
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'ავტორიზაცია საჭიროა', success: false },
        { status: 401 }
      )
    }

    // Check if user is admin
    const admin = await prisma.admin.findUnique({
      where: { userId: session.user.id }
    })

    if (!admin) {
      return NextResponse.json(
        { error: 'ადმინისტრატორის ნებართვა საჭიროა', success: false },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const eventType = searchParams.get('eventType')
    const isActive = searchParams.get('isActive')

    const where: Record<string, unknown> = {}
    
    if (eventType) {
      where.eventType = eventType
    }
    
    if (isActive !== null) {
      where.isActive = isActive === 'true'
    }

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

    return NextResponse.json({
      events,
      success: true
    })

  } catch (error) {
    console.error('Error fetching calendar events:', error)
    return NextResponse.json(
      { error: 'სისტემური შეცდომა მოხდა კალენდრის ჩატვირთვისას', success: false },
      { status: 500 }
    )
  }
}

// POST - Create new calendar event
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'ავტორიზაცია საჭიროა', success: false },
        { status: 401 }
      )
    }

    // Check if user is admin
    const admin = await prisma.admin.findUnique({
      where: { userId: session.user.id }
    })

    if (!admin) {
      return NextResponse.json(
        { error: 'ადმინისტრატორის ნებართვა საჭიროა', success: false },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { title, description, startDate, endDate, eventType, isActive, subjectId, curriculumId, grades, gradeCurriculums } = body

    // Validate required fields
    if (!title || !startDate) {
      return NextResponse.json(
        { error: 'სათაური და დაწყების თარიღი აუცილებელია', success: false },
        { status: 400 }
      )
    }

    // Validate dates
    const start = new Date(startDate)
    const end = endDate ? new Date(endDate) : null

    if (isNaN(start.getTime())) {
      return NextResponse.json(
        { error: 'არასწორი დაწყების თარიღი', success: false },
        { status: 400 }
      )
    }

    if (end && isNaN(end.getTime())) {
      return NextResponse.json(
        { error: 'არასწორი დასრულების თარიღი', success: false },
        { status: 400 }
      )
    }

    if (end && end < start) {
      return NextResponse.json(
        { error: 'დასრულების თარიღი არ შეიძლება იყოს დაწყების თარიღზე ადრე', success: false },
        { status: 400 }
      )
    }

    const event = await prisma.calendarEvent.create({
      data: {
        title,
        description: description || null,
        startDate: start,
        endDate: end,
        eventType: eventType || 'olympiad',
        isActive: isActive !== false,
        subjectId: subjectId || null,
        curriculumId: curriculumId || null,
        grades: grades || [],
        gradeCurriculums: gradeCurriculums || null,
        createdBy: admin.id
      },
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
      }
    })

    return NextResponse.json({
      event,
      success: true,
      message: 'კალენდრის ღონისძიება წარმატებით შეიქმნა'
    })

  } catch (error) {
    console.error('Error creating calendar event:', error)
    return NextResponse.json(
      { error: 'სისტემური შეცდომა მოხდა ღონისძიების შექმნისას', success: false },
      { status: 500 }
    )
  }
}
