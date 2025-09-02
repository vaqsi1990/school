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

    // Get all subjects to map IDs to names
    const subjects = await prisma.subject.findMany({
      select: {
        id: true,
        name: true
      }
    })

    const subjectMap = new Map(subjects.map(subject => [subject.id, subject.name]))

    return NextResponse.json({
      users: users.map(user => {
        // If user is a teacher, get subject name
        let teacherWithSubject = user.teacher
        if (user.teacher) {
          teacherWithSubject = {
            ...user.teacher,
            subject: subjectMap.get(user.teacher.subject) || user.teacher.subject
          }
        }

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
