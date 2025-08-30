import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.userType !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const { name, description } = await request.json()

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    const updatedPackage = await prisma.questionPackage.update({
      where: { id },
      data: {
        name,
        description: description || ''
      },
      include: {
        questions: {
          include: {
            question: {
              include: {
                subject: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json({ 
      message: 'Package updated successfully',
      package: updatedPackage 
    })
  } catch (error) {
    console.error('Error updating package:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.userType !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Delete the package (this will cascade delete related records)
    await prisma.questionPackage.delete({
      where: { id }
    })

    return NextResponse.json({ 
      message: 'Package deleted successfully' 
    })
  } catch (error) {
    console.error('Error deleting package:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
