import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.userType !== 'STUDENT') {
      return NextResponse.json(
        { error: 'არასაკმარისი უფლებები' },
        { status: 403 }
      )
    }

    // Get student record
    const student = await prisma.student.findUnique({
      where: { userId: session.user.id }
    })

    if (!student) {
      return NextResponse.json(
        { error: 'მოსწავლის მონაცემები ვერ მოიძებნა' },
        { status: 404 }
      )
    }

    // Get recent appeal decisions (last 30 days) with status APPROVED or REJECTED
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentDecisions = await prisma.appeal.findMany({
      where: {
        studentId: student.id,
        status: {
          in: ['APPROVED', 'REJECTED']
        },
        processedAt: {
          gte: thirtyDaysAgo
        }
      },
      include: {
        studentOlympiadEvent: {
          include: {
            olympiadEvent: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        processedAt: 'desc'
      }
    })

    // Format notifications
    const notifications = recentDecisions.map(appeal => ({
      id: appeal.id,
      type: appeal.status === 'APPROVED' ? 'success' : 'error',
      title: appeal.status === 'APPROVED' 
        ? '✅ გასაჩივრება დამტკიცდა' 
        : '❌ გასაჩივრება უარყოფილია',
      message: appeal.status === 'APPROVED'
        ? `თქვენი გასაჩივრება ოლიმპიადაში "${appeal.studentOlympiadEvent.olympiadEvent.name}" დამტკიცდა.`
        : `თქვენი გასაჩივრება ოლიმპიადაში "${appeal.studentOlympiadEvent.olympiadEvent.name}" უარყოფილია.`,
      adminComment: appeal.adminComment,
      processedAt: appeal.processedAt,
      olympiadName: appeal.studentOlympiadEvent.olympiadEvent.name,
      reason: appeal.reason
    }))

    return NextResponse.json({
      notifications,
      unreadCount: notifications.length
    })

  } catch (error) {
    console.error('Error fetching appeal notifications:', error)
    return NextResponse.json(
      { error: 'სისტემური შეცდომა მოხდა' },
      { status: 500 }
    )
  }
}
