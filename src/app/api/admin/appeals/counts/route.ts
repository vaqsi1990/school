import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.userType !== 'ADMIN') {
      return NextResponse.json(
        { error: 'არასაკმარისი უფლებები' },
        { status: 403 }
      )
    }

    // Get appeal counts by status
    const [pendingCount, approvedCount, rejectedCount, underReviewCount, totalCount] = await Promise.all([
      prisma.appeal.count({
        where: { status: 'PENDING' }
      }),
      prisma.appeal.count({
        where: { status: 'APPROVED' }
      }),
      prisma.appeal.count({
        where: { status: 'REJECTED' }
      }),
      prisma.appeal.count({
        where: { status: 'UNDER_REVIEW' }
      }),
      prisma.appeal.count()
    ])

    return NextResponse.json({
      counts: {
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
        underReview: underReviewCount,
        total: totalCount
      }
    })

  } catch (error) {
    console.error('Error fetching appeal counts:', error)
    return NextResponse.json(
      { error: 'სისტემური შეცდომა მოხდა' },
      { status: 500 }
    )
  }
}
