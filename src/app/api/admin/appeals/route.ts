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

    // Get all appeals with related data
    const appeals = await prisma.appeal.findMany({
      include: {
        studentOlympiadEvent: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                lastname: true,
                grade: true,
                school: true
              }
            },
            olympiadEvent: {
              select: {
                id: true,
                name: true,
                description: true
              }
            }
          }
        }
      },
      orderBy: {
        submittedAt: 'desc'
      }
    })

    return NextResponse.json({
      appeals,
      total: appeals.length
    })

  } catch (error) {
    console.error('Error fetching appeals:', error)
    return NextResponse.json(
      { error: 'სისტემური შეცდომა მოხდა' },
      { status: 500 }
    )
  }
}
