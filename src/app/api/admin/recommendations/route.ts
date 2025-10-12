import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get admin info
    const admin = await prisma.admin.findUnique({
      where: { userId: session.user.id },
      select: { id: true }
    })

    if (!admin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 })
    }

    // Get all recommendations with teacher and admin response info
    const recommendations = await prisma.recommendation.findMany({
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            lastname: true
          }
        },
        adminResponse: {
          include: {
            admin: {
              select: {
                id: true,
                name: true,
                lastname: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Get statistics
    const totalRecommendations = recommendations.length
    const activeRecommendations = recommendations.filter((r: { isActive: boolean }) => r.isActive).length
    const totalResponses = recommendations.filter((r: { adminResponse?: { id: string } }) => r.adminResponse).length

    return NextResponse.json({ 
      recommendations,
      statistics: {
        totalRecommendations,
        activeRecommendations,
        totalResponses
      }
    })
  } catch (error) {
    console.error('Error fetching admin recommendations:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get admin info
    const admin = await prisma.admin.findUnique({
      where: { userId: session.user.id },
      select: { id: true }
    })

    if (!admin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const recommendationId = searchParams.get('id')

    if (!recommendationId) {
      return NextResponse.json({ error: 'Recommendation ID is required' }, { status: 400 })
    }

    // Delete recommendation
    const result = await prisma.recommendation.delete({
      where: {
        id: recommendationId
      }
    })

    return NextResponse.json({ success: true, deletedRecommendation: result })
  } catch (error) {
    console.error('Error deleting recommendation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get admin info
    const admin = await prisma.admin.findUnique({
      where: { userId: session.user.id },
      select: { id: true }
    })

    if (!admin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 })
    }

    const { recommendationId, response } = await request.json()

    if (!recommendationId || !response) {
      return NextResponse.json({ error: 'Recommendation ID and response are required' }, { status: 400 })
    }

    // Create or update admin response
    const adminResponse = await prisma.recommendationAdminResponse.upsert({
      where: {
        recommendationId: recommendationId
      },
      update: {
        response: response,
        updatedAt: new Date()
      },
      create: {
        recommendationId: recommendationId,
        adminId: admin.id,
        response: response
      },
      include: {
        admin: {
          select: {
            id: true,
            name: true,
            lastname: true
          }
        }
      }
    })

    return NextResponse.json({ success: true, adminResponse })
  } catch (error) {
    console.error('Error creating admin response:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
