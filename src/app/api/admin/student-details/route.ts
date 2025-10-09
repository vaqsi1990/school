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

    // Get student ID from query parameters
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')

    if (!studentId) {
      return NextResponse.json(
        { error: 'მოსწავლის ID აუცილებელია' },
        { status: 400 }
      )
    }

    // Fetch student with their related data
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            createdAt: true
          }
        },
        classMemberships: {
          include: {
            class: {
              select: {
                id: true,
                name: true,
                description: true,
                subject: true,
                grade: true,
                createdAt: true,
                teacher: {
                  select: {
                    name: true,
                    lastname: true,
                    subject: true
                  }
                }
              }
            }
          }
        },
        answers: {
          orderBy: {
            answeredAt: 'desc'
          },
          take: 10 // Limit to last 10 answers
        }
      }
    })

    // Fetch subject selections separately since it's on User model
    const subjectSelections = await prisma.studentSubjectSelection.findMany({
      where: { userId: student?.userId },
      include: {
        subject: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    if (!student) {
      return NextResponse.json(
        { error: 'მოსწავლე ვერ მოიძებნა' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      student: {
        id: student.id,
        name: student.name,
        lastname: student.lastname,
        grade: student.grade,
        school: student.school,
        phone: student.phone,
        code: student.code,
        createdAt: student.createdAt,
        user: student.user,
        selectedSubjects: subjectSelections.map(ss => ({
          id: ss.subject.id,
          name: ss.subject.name,
          selectedAt: ss.createdAt
        })),
        classes: student.classMemberships.map(cs => ({
          id: cs.class.id,
          name: cs.class.name,
          description: cs.class.description,
          subject: cs.class.subject,
          grade: cs.class.grade,
          createdAt: cs.class.createdAt,
          teacher: cs.class.teacher,
          joinedAt: cs.joinedAt
        })),
        recentAnswers: student.answers.map(sa => ({
          id: sa.id,
          olympiadTitle: 'პასუხი',
          olympiadSubject: 'უცნობი საგანი',
          score: sa.points || 0,
          totalQuestions: 1,
          submittedAt: sa.answeredAt
        }))
      }
    })

  } catch (error) {
    console.error('Error fetching student details:', error)
    return NextResponse.json(
      { error: 'სერვერის შეცდომა' },
      { status: 500 }
    )
  }
}
