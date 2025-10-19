import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// PUT - Update calendar event
export async function PUT(request: NextRequest) {
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
    const { id, title, description, startDate, endDate, eventType, isActive, subjectId, curriculumId, grades, gradeCurriculums } = body

    if (!id) {
      return NextResponse.json(
        { error: 'ღონისძიების ID აუცილებელია', success: false },
        { status: 400 }
      )
    }

    // Check if event exists
    const existingEvent = await prisma.calendarEvent.findUnique({
      where: { id }
    })

    if (!existingEvent) {
      return NextResponse.json(
        { error: 'ღონისძიება ვერ მოიძებნა', success: false },
        { status: 404 }
      )
    }

    // Validate dates if provided
    let start = existingEvent.startDate
    let end = existingEvent.endDate

    if (startDate) {
      start = new Date(startDate)
      if (isNaN(start.getTime())) {
        return NextResponse.json(
          { error: 'არასწორი დაწყების თარიღი', success: false },
          { status: 400 }
        )
      }
    }

    if (endDate) {
      end = new Date(endDate)
      if (isNaN(end.getTime())) {
        return NextResponse.json(
          { error: 'არასწორი დასრულების თარიღი', success: false },
          { status: 400 }
        )
      }
    }

    if (end && start && end < start) {
      return NextResponse.json(
        { error: 'დასრულების თარიღი არ შეიძლება იყოს დაწყების თარიღზე ადრე', success: false },
        { status: 400 }
      )
    }

    const updatedEvent = await prisma.calendarEvent.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(startDate && { startDate: start }),
        ...(endDate !== undefined && { endDate: end }),
        ...(eventType && { eventType }),
        ...(isActive !== undefined && { isActive }),
        ...(subjectId !== undefined && { subjectId }),
        ...(curriculumId !== undefined && { curriculumId }),
        ...(grades !== undefined && { grades }),
        ...(gradeCurriculums !== undefined && { gradeCurriculums })
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
      event: updatedEvent,
      success: true,
      message: 'ღონისძიება წარმატებით განახლდა'
    })

  } catch (error) {
    console.error('Error updating calendar event:', error)
    return NextResponse.json(
      { error: 'სისტემური შეცდომა მოხდა ღონისძიების განახლებისას', success: false },
      { status: 500 }
    )
  }
}

// DELETE - Delete calendar event
export async function DELETE(request: NextRequest) {
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
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ღონისძიების ID აუცილებელია', success: false },
        { status: 400 }
      )
    }

    // Check if event exists
    const existingEvent = await prisma.calendarEvent.findUnique({
      where: { id }
    })

    if (!existingEvent) {
      return NextResponse.json(
        { error: 'ღონისძიება ვერ მოიძებნა', success: false },
        { status: 404 }
      )
    }

    await prisma.calendarEvent.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'ღონისძიება წარმატებით წაიშალა'
    })

  } catch (error) {
    console.error('Error deleting calendar event:', error)
    return NextResponse.json(
      { error: 'სისტემური შეცდომა მოხდა ღონისძიების წაშლისას', success: false },
      { status: 500 }
    )
  }
}
