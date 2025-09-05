import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.userType !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { isActive } = await request.json()

    if (typeof isActive !== 'boolean') {
      return NextResponse.json(
        { error: 'isActive must be a boolean value' },
        { status: 400 }
      )
    }

    // Check if olympiad exists
    const existingOlympiad = await prisma.olympiadEvent.findUnique({
      where: { id: params.id }
    })

    if (!existingOlympiad) {
      return NextResponse.json({ error: 'Olympiad not found' }, { status: 404 })
    }

    // Update status
    const updatedOlympiad = await prisma.olympiadEvent.update({
      where: { id: params.id },
      data: { isActive },
      select: {
        id: true,
        name: true,
        isActive: true
      }
    })

    return NextResponse.json({
      message: `Olympiad ${isActive ? 'activated' : 'deactivated'} successfully`,
      olympiad: updatedOlympiad
    })
  } catch (error) {
    console.error('Error toggling olympiad status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
