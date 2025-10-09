import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get student info
    const student = await prisma.student.findUnique({
      where: { userId: session.user.id },
      include: {
        classMemberships: {
          include: {
            class: {
              include: {
                tests: {
                  where: {
                    isActive: true,
                    AND: [
                      {
                        OR: [
                          { startDate: null },
                          { startDate: { lte: new Date() } }
                        ]
                      },
                      {
                        OR: [
                          { endDate: null },
                          { endDate: { gte: new Date() } }
                        ]
                      }
                    ]
                  },
                  include: {
                    subject: true,
                    teacher: true,
                    results: {
                      where: {
                        studentId: session.user.id
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    const tests = student.classMemberships.flatMap(membership => 
      membership.class.tests.map(test => ({
        ...test,
        studentResult: test.results[0] || null
      }))
    )

    return NextResponse.json({ tests })
  } catch (error) {
    console.error('Error fetching student class tests:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
