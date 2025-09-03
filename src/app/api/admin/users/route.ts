import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Get the current session
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'ავტორიზაცია საჭიროა' },
        { status: 401 }
      )
    }

    // Check if user is admin
    if (session.user.userType !== 'ADMIN') {
      return NextResponse.json(
        { error: 'მხოლოდ ადმინისტრატორებს შეუძლიათ ამ ფუნქციის გამოყენება' },
        { status: 403 }
      )
    }

    // Fetch all users with their related data
    const users = await prisma.user.findMany({
      include: {
        student: true,
        teacher: true,
        admin: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      users: users.map(user => {
        // If user is a teacher, the subject is already stored as a name
        const teacherWithSubject = user.teacher

        return {
          id: user.id,
          email: user.email,
          userType: user.userType,
          student: user.student,
          teacher: teacherWithSubject,
          admin: user.admin
        }
      })
    })

  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'სერვერის შეცდომა' },
      { status: 500 }
    )
  }
}
