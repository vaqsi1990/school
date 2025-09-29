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

    // Get student record
    const student = await prisma.student.findUnique({
      where: { userId: session.user.id }
    })

    if (!student) {
      return NextResponse.json(
        { error: 'მოსწავლის მონაცემები ვერ მოიძებნა' },
        { status: 404 }
      )
    }

    // Verify the olympiad result belongs to the current student
    const olympiadResult = await prisma.studentOlympiadEvent.findFirst({
      where: {
        id: resultId,
        studentId: student.id
      }
    })

    if (!olympiadResult) {
      return NextResponse.json(
        { error: 'ოლიმპიადის შედეგი ვერ მოიძებნა' },
        { status: 404 }
      )
    }

    // Check if appeal already exists for this result
    const existingAppeal = await prisma.appeal.findFirst({
      where: {
        studentOlympiadEventId: resultId
      }
    })

    if (existingAppeal) {
      return NextResponse.json(
        { error: 'ამ ოლიმპიადისთვის უკვე გაგზავნილია გასაჩივრება' },
        { status: 400 }
      )
    }

    // Create the appeal
    const appeal = await prisma.appeal.create({
      data: {
        studentOlympiadEventId: resultId,
        reason,
        description: description.trim(),
        status: 'PENDING',
        studentId: student.id,
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

    // Get student record
    const student = await prisma.student.findUnique({
      where: { userId: session.user.id }
    })

    if (!student) {
      return NextResponse.json(
        { error: 'მოსწავლის მონაცემები ვერ მოიძებნა' },
        { status: 404 }
      )
    }

    // Get student's appeals
    const appeals = await prisma.appeal.findMany({
      where: {
        studentId: student.id
      },
      include: {
        studentOlympiadEvent: {
          include: {
            olympiadEvent: true
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
        olympiadResult: {
          id: appeal.studentOlympiadEvent?.id,
          score: appeal.studentOlympiadEvent?.totalScore,
          olympiadTitle: appeal.studentOlympiadEvent?.olympiadEvent?.name || 'უცნობი ოლიმპიადა'
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
