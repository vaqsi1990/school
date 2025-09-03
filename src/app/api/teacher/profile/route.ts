import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.userType !== 'TEACHER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const teacher = await prisma.teacher.findUnique({
      where: { userId: session.user.id },
      include: {
        user: {
          select: {
            email: true
          }
        }
      }
    })

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 })
    }

    const profile = {
      id: teacher.id,
      name: teacher.name,
      lastname: teacher.lastname,
      email: teacher.user.email,
      subject: teacher.subject, // Subject is already stored as a name
      school: teacher.school,
      phone: teacher.phone,
      isVerified: teacher.isVerified,
      createdAt: teacher.createdAt,
      updatedAt: teacher.updatedAt
    }

    return NextResponse.json({ profile })
  } catch (error) {
    console.error('Error fetching teacher profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
