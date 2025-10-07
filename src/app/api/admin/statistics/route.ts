import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Get visitor statistics
    const totalVisitors = await prisma.visitorLog.count()
    
    // Get unique visitors (by IP address)
    const uniqueVisitors = await prisma.visitorLog.groupBy({
      by: ['ipAddress'],
      where: {
        ipAddress: {
          not: null
        }
      }
    })

    // Get visitors by day for the last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // Get visitors by day - need to group by date only, not datetime
    const visitorsByDayRaw = await prisma.visitorLog.findMany({
      where: {
        visitedAt: {
          gte: thirtyDaysAgo
        }
      },
      select: {
        visitedAt: true
      }
    })

    // Group by date and count
    const visitorsByDayMap = new Map<string, number>()
    visitorsByDayRaw.forEach(visit => {
      const date = visit.visitedAt.toISOString().split('T')[0]
      visitorsByDayMap.set(date, (visitorsByDayMap.get(date) || 0) + 1)
    })

    const visitorsByDay = Array.from(visitorsByDayMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => b.date.localeCompare(a.date))

    // Get peak day from the already calculated visitorsByDay
    const peakDay = visitorsByDay.length > 0 ? visitorsByDay.reduce((max, current) => 
      current.count > max.count ? current : max
    ) : null

    // Get visitors by hour (for today)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const visitorsByHour = await prisma.visitorLog.groupBy({
      by: ['visitedAt'],
      where: {
        visitedAt: {
          gte: today,
          lt: tomorrow
        }
      },
      _count: {
        id: true
      }
    })

    // Get most visited pages
    const mostVisitedPages = await prisma.visitorLog.groupBy({
      by: ['page'],
      where: {
        page: {
          not: null
        }
      },
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 10
    })

    return NextResponse.json({
      success: true,
      data: {
        totalVisitors,
        uniqueVisitors: uniqueVisitors.length,
        visitorsByDay,
        peakDay,
        visitorsByHour: visitorsByHour.map(hour => ({
          hour: hour.visitedAt.getHours(),
          count: hour._count.id
        })),
        mostVisitedPages: mostVisitedPages.map(page => ({
          page: page.page,
          count: page._count.id
        }))
      }
    })
  } catch (error) {
    console.error('Error fetching visitor statistics:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch visitor statistics' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { ipAddress, userAgent, page, referrer, sessionId } = body

    // Log visitor
    await prisma.visitorLog.create({
      data: {
        ipAddress,
        userAgent,
        page,
        referrer,
        sessionId
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error logging visitor:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to log visitor' },
      { status: 500 }
    )
  }
}
