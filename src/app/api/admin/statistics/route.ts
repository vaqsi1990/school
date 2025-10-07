import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Get unique visitors (by IP address) - this will be our total visitors
    const uniqueVisitors = await prisma.visitorLog.groupBy({
      by: ['ipAddress'],
      where: {
        ipAddress: {
          not: null
        }
      }
    })

    const totalVisitors = uniqueVisitors.length

    // Get visitors by day for the last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // Get visitors by day - group by date and count unique IPs per day
    const visitorsByDayRaw = await prisma.visitorLog.findMany({
      where: {
        visitedAt: {
          gte: thirtyDaysAgo
        },
        ipAddress: {
          not: null
        }
      },
      select: {
        visitedAt: true,
        ipAddress: true
      }
    })

    // Group by date and count unique IPs per day
    const visitorsByDayMap = new Map<string, Set<string>>()
    visitorsByDayRaw.forEach(visit => {
      const date = visit.visitedAt.toISOString().split('T')[0]
      if (!visitorsByDayMap.has(date)) {
        visitorsByDayMap.set(date, new Set())
      }
      visitorsByDayMap.get(date)!.add(visit.ipAddress!)
    })

    const visitorsByDay = Array.from(visitorsByDayMap.entries())
      .map(([date, ipSet]) => ({ date, count: ipSet.size }))
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
        uniqueVisitors: totalVisitors,
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
    const { userAgent, page, referrer, sessionId } = body

    // Get IP address from request headers
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown'

    // Check if this session already visited this page today
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const existingVisit = await prisma.visitorLog.findFirst({
      where: {
        sessionId: body.sessionId,
        page: body.page,
        visitedAt: {
          gte: today,
          lt: tomorrow
        }
      }
    })

    // Only log if this session hasn't visited this page today
    if (!existingVisit) {
      await prisma.visitorLog.create({
        data: {
          ipAddress,
          userAgent: body.userAgent,
          page: body.page,
          referrer: body.referrer,
          sessionId: body.sessionId
        }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error logging visitor:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to log visitor' },
      { status: 500 }
    )
  }
}
