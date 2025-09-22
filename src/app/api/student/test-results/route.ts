import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'ავტორიზაცია საჭიროა' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const subjectId = searchParams.get('subjectId')

    if (!subjectId) {
      return NextResponse.json(
        { error: 'საგნის ID აუცილებელია' },
        { status: 400 }
      )
    }

    // Get student information
    const student = await prisma.student.findUnique({
      where: { userId: session.user.id },
      include: { user: true }
    })

    if (!student) {
      return NextResponse.json(
        { error: 'მოსწავლის მონაცემები ვერ მოიძებნა' },
        { status: 404 }
      )
    }

    // Get subject information
    const subject = await prisma.subject.findUnique({
      where: { id: subjectId }
    })

    if (!subject) {
      return NextResponse.json(
        { error: 'საგანი ვერ მოიძებნა' },
        { status: 404 }
      )
    }

    // Calculate test results from student answers for this subject
    // We'll group answers by date to create test sessions
    const studentAnswers = await prisma.studentAnswer.findMany({
      where: {
        studentId: student.id,
        question: {
          subjectId: subjectId
        },
        olympiadId: null // Only regular test answers, not olympiad answers
      },
      include: {
        question: true
      },
      orderBy: {
        answeredAt: 'desc'
      }
    })

    // Group answers by date to create test sessions
    const testSessions = new Map<string, typeof studentAnswers>()
    
    studentAnswers.forEach(answer => {
      const dateKey = answer.answeredAt.toISOString().split('T')[0] // Group by date
      if (!testSessions.has(dateKey)) {
        testSessions.set(dateKey, [])
      }
      testSessions.get(dateKey)!.push(answer)
    })

    // Convert sessions to test results
    const testResults = Array.from(testSessions.entries()).map(([date, answers]) => {
      const correctAnswers = answers.filter(answer => answer.isCorrect === true).length
      const totalQuestions = answers.length
      const percentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0
      
      return {
        id: `test-${date}`,
        subject: subject.name,
        score: correctAnswers,
        totalQuestions: totalQuestions,
        completedAt: answers[0].answeredAt.toISOString(),
        percentage: percentage
      }
    })

    return NextResponse.json({
      results: testResults,
      subject: {
        id: subject.id,
        name: subject.name
      },
      student: {
        id: student.id,
        grade: student.grade
      }
    })

  } catch (error) {
    console.error('Error fetching test results:', error)
    return NextResponse.json(
      { error: 'სისტემური შეცდომა მოხდა' },
      { status: 500 }
    )
  }
}
