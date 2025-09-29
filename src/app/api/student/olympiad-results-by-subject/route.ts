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
    const subjectName = searchParams.get('subjectName')

    if (!subjectName) {
      return NextResponse.json(
        { error: 'საგნის სახელი აუცილებელია' },
        { status: 400 }
      )
    }

    // Get student information
    const student = await prisma.student.findUnique({
      where: { userId: session.user.id },
      select: { id: true, grade: true }
    })

    if (!student) {
      return NextResponse.json(
        { error: 'მოსწავლის მონაცემები ვერ მოიძებნა' },
        { status: 404 }
      )
    }

    console.log('Searching for participations with:', {
      studentId: student.id,
      studentGrade: student.grade,
      subjectName
    })

    // Get olympiad participations for this student that include the specified subject
    const participations = await prisma.studentOlympiadEvent.findMany({
      where: {
        studentId: student.id,
        status: {
          in: ['COMPLETED', 'DISQUALIFIED']
        },
        olympiadEvent: {
          subjects: {
            has: subjectName
          },
          grades: {
            has: student.grade
          }
        }
      },
      include: {
        olympiadEvent: {
          select: {
            id: true,
            name: true,
            description: true,
            startDate: true,
            endDate: true,
            subjects: true,
            grades: true,
            minimumPointsThreshold: true,
            rounds: true
          }
        }
      },
      orderBy: {
        endTime: 'desc'
      }
    })

    console.log('Found participations:', participations.length)

    // Get detailed results for each participation
    const results = await Promise.all(
      participations.map(async (participation) => {
        // Get olympiad with packages to calculate max score
        const olympiad = await prisma.olympiadEvent.findUnique({
          where: { id: participation.olympiadEventId },
          include: {
            packages: {
              include: {
                questions: {
                  include: {
                    question: true
                  }
                }
              }
            }
          }
        })

        if (!olympiad) return null

        // Calculate max score from all questions
        const allQuestions = olympiad.packages.flatMap(pkg => 
          pkg.questions.map(qp => qp.question)
        )
        
        const maxScore = allQuestions.reduce((total, question) => {
          return total + (question.points || 1)
        }, 0)

        const score = participation.totalScore || 0
        const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0
        
        console.log(`Olympiad ${participation.olympiadEvent.name}: score=${score}, maxScore=${maxScore}, percentage=${percentage}`)

        return {
          id: participation.id,
          olympiadId: participation.olympiadEventId,
          olympiadTitle: participation.olympiadEvent.name,
          olympiadDescription: participation.olympiadEvent.description,
          subjects: participation.olympiadEvent.subjects,
          grades: participation.olympiadEvent.grades,
          startDate: participation.olympiadEvent.startDate,
          endDate: participation.olympiadEvent.endDate,
          status: participation.status,
          score,
          maxScore,
          percentage,
          totalQuestions: allQuestions.length,
          completedAt: participation.endTime || participation.olympiadEvent.endDate,
          minimumPointsThreshold: participation.olympiadEvent.minimumPointsThreshold,
          currentRound: participation.currentRound,
          totalRounds: participation.olympiadEvent.rounds,
          hasAdvancedToNextStage: participation.olympiadEvent.minimumPointsThreshold ? score >= participation.olympiadEvent.minimumPointsThreshold : false
        }
      })
    )

    // Filter out null results
    const validResults = results.filter(result => result !== null)

    return NextResponse.json({
      results: validResults,
      subject: subjectName,
      student: {
        id: student.id,
        grade: student.grade
      }
    })

  } catch (error) {
    console.error('Error fetching olympiad results by subject:', error)
    return NextResponse.json(
      { error: 'სისტემური შეცდომა მოხდა' },
      { status: 500 }
    )
  }
}
