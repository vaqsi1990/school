import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.userType !== 'ADMIN') {
      return NextResponse.json(
        { error: 'არასაკმარისი უფლებები' },
        { status: 403 }
      )
    }

    const { appealId, decision, adminComment } = await request.json()

    if (!appealId || !decision) {
      return NextResponse.json(
        { error: 'გასაჩივრების ID და გადაწყვეტილება აუცილებელია' },
        { status: 400 }
      )
    }

    // Update the appeal with the decision
    const updatedAppeal = await prisma.appeal.update({
      where: { id: appealId },
      data: {
        status: decision,
        adminComment: adminComment || null,
        processedAt: new Date(),
        processedBy: session.user.id
      }
    })

    // If approved, you might want to update the student's score or take other actions
    if (decision === 'APPROVED') {
      // Get the appeal with student olympiad event details
      const appeal = await prisma.appeal.findUnique({
        where: { id: appealId },
        include: {
          studentOlympiadEvent: true
        }
      })

      if (appeal) {
        // Here you could implement logic to adjust the student's score
        // For now, we'll just log that the appeal was approved
        console.log(`Appeal approved for student ${appeal.studentOlympiadEvent.studentId} in olympiad ${appeal.studentOlympiadEvent.olympiadEventId}`)
      }
    }

    return NextResponse.json({
      success: true,
      appeal: updatedAppeal,
      message: decision === 'APPROVED' ? 'გასაჩივრება დამტკიცებულია' : 'გასაჩივრება უარყოფილია'
    })

  } catch (error) {
    console.error('Error processing appeal decision:', error)
    return NextResponse.json(
      { error: 'სისტემური შეცდომა მოხდა' },
      { status: 500 }
    )
  }
}
