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

    // Get teacher ID from query parameters
    const { searchParams } = new URL(request.url)
    const teacherId = searchParams.get('teacherId')

    if (!teacherId) {
      return NextResponse.json(
        { error: 'მასწავლებლის ID აუცილებელია' },
        { status: 400 }
      )
    }

    // Fetch teacher with their classes and students
    const teacher = await prisma.teacher.findUnique({
      where: { id: teacherId },
      include: {
        classes: {
          include: {
            students: {
              include: {
                student: {
                  select: {
                    id: true,
                    name: true,
                    lastname: true,
                    grade: true,
                    school: true,
                    phone: true
                  }
                }
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    if (!teacher) {
      return NextResponse.json(
        { error: 'მასწავლებელი ვერ მოიძებნა' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      teacher: {
        id: teacher.id,
        name: teacher.name,
        lastname: teacher.lastname,
        subject: teacher.subject,
        school: teacher.school,
        phone: teacher.phone,
        isVerified: teacher.isVerified,
        createdAt: teacher.createdAt,
        classes: teacher.classes.map(cls => ({
          id: cls.id,
          name: cls.name,
          description: cls.description,
          subject: cls.subject,
          grade: cls.grade,
          createdAt: cls.createdAt,
          studentCount: cls.students.length,
          students: cls.students.map(cs => ({
            id: cs.student.id,
            name: cs.student.name,
            lastname: cs.student.lastname,
            grade: cs.student.grade,
            school: cs.student.school,
            phone: cs.student.phone,
            joinedAt: cs.joinedAt
          }))
        }))
      }
    })

  } catch (error) {
    console.error('Error fetching teacher classes:', error)
    return NextResponse.json(
      { error: 'სერვერის შეცდომა' },
      { status: 500 }
    )
  }
}
