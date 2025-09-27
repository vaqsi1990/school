import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'ავტორიზაცია საჭიროა' },
        { status: 401 }
      )
    }

    if (session.user.userType !== 'STUDENT') {
      return NextResponse.json(
        { error: 'მხოლოდ მოსწავლეებს შეუძლიათ გასაჩივრება' },
        { status: 403 }
      )
    }

    const { resultId, reason, description, subjectId } = await request.json()

    if (!resultId || !reason || !description || !subjectId) {
      return NextResponse.json(
        { error: 'ყველა ველი აუცილებელია' },
        { status: 400 }
      )
    }

    // Verify the test result belongs to the current student
    const testResult = await prisma.testResult.findFirst({
      where: {
        id: resultId,
        student: {
          userId: session.user.id
        }
      },
      include: {
        student: true
      }
    })

    if (!testResult) {
      return NextResponse.json(
        { error: 'ტესტის შედეგი ვერ მოიძებნა' },
        { status: 404 }
      )
    }

    // Check if appeal already exists for this result
    const existingAppeal = await prisma.appeal.findFirst({
      where: {
        testResultId: resultId
      }
    })

    if (existingAppeal) {
      return NextResponse.json(
        { error: 'ამ ტესტისთვის უკვე გაგზავნილია გასაჩივრება' },
        { status: 400 }
      )
    }

    // Create the appeal
    const appeal = await prisma.appeal.create({
      data: {
        testResultId: resultId,
        reason,
        description: description.trim(),
        status: 'PENDING',
        studentId: testResult.student.id,
        subjectId: subjectId,
        submittedAt: new Date()
      }
    })

    return NextResponse.json({
      message: 'გასაჩივრება წარმატებით გაიგზავნა',
      appealId: appeal.id
    })

  } catch (error) {
    console.error('Error creating appeal:', error)
    return NextResponse.json(
      { error: 'გასაჩივრების შექმნა ვერ მოხერხდა' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'ავტორიზაცია საჭიროა' },
        { status: 401 }
      )
    }

    if (session.user.userType !== 'STUDENT') {
      return NextResponse.json(
        { error: 'მხოლოდ მოსწავლეებს შეუძლიათ გასაჩივრებების ნახვა' },
        { status: 403 }
      )
    }

    // Get student's appeals
    const appeals = await prisma.appeal.findMany({
      where: {
        student: {
          userId: session.user.id
        }
      },
      include: {
        testResult: {
          include: {
            subject: true
          }
        }
      },
      orderBy: {
        submittedAt: 'desc'
      }
    })

    return NextResponse.json({
      appeals: appeals.map(appeal => ({
        id: appeal.id,
        reason: appeal.reason,
        description: appeal.description,
        status: appeal.status,
        submittedAt: appeal.submittedAt,
        testResult: {
          id: appeal.testResult.id,
          score: appeal.testResult.score,
          totalQuestions: appeal.testResult.totalQuestions,
          subject: appeal.testResult.subject?.name || 'უცნობი საგანი'
        }
      }))
    })

  } catch (error) {
    console.error('Error fetching appeals:', error)
    return NextResponse.json(
      { error: 'გასაჩივრებების ჩატვირთვა ვერ მოხერხდა' },
      { status: 500 }
    )
  }
}
