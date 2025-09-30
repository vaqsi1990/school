import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'ავტორიზაცია საჭიროა' },
        { status: 401 }
      )
    }

    // Check if user is admin
    if (session.user.userType !== 'ADMIN') {
      return NextResponse.json(
        { error: 'მხოლოდ ადმინისტრატორებს შეუძლიათ ოლიმპიადების შექმნა' },
        { status: 403 }
      )
    }

    // Parse request body
    const body = await request.json()
    const {
      name,
      description,
      startDate,
      endDate,
      registrationStartDate,
      registrationDeadline,
      maxParticipants,
      isActive,
      showDetailedReview,
      subjects,
      grades,
      rounds,
      duration,
      packages,
      questionTypes,
      questionTypeQuantities,
      questionTypeOrder,
      minimumPointsThreshold
    } = body

    // Validate required fields
    if (!name || !description || !startDate || !endDate || !registrationStartDate || !registrationDeadline) {
      return NextResponse.json(
        { error: 'ყველა სავალდებულო ველი უნდა იყოს შევსებული' },
        { status: 400 }
      )
    }

    // Validate dates
    const start = new Date(startDate)
    const end = new Date(endDate)
    const registrationStart = new Date(registrationStartDate)
    const registration = new Date(registrationDeadline)
    const now = new Date()

    if (start <= now) {
      return NextResponse.json(
        { error: 'დაწყების თარიღი უნდა იყოს მომავალში' },
        { status: 400 }
      )
    }

    if (end < start) {
      return NextResponse.json(
        { error: 'დასრულების თარიღი უნდა იყოს დაწყების თარიღის შემდეგ ან იმავე დღეს' },
        { status: 400 }
      )
    }

    if (registrationStart >= registration) {
      return NextResponse.json(
        { error: 'რეგისტრაციის გახსნის თარიღი უნდა იყოს რეგისტრაციის ბოლო თარიღამდე' },
        { status: 400 }
      )
    }

    if (registration >= start) {
      return NextResponse.json(
        { error: 'რეგისტრაციის ბოლო თარიღი უნდა იყოს დაწყების თარიღამდე' },
        { status: 400 }
      )
    }

    // Validate arrays
    if (!Array.isArray(subjects) || subjects.length === 0) {
      return NextResponse.json(
        { error: 'მინიმუმ ერთი საგანი უნდა იყოს არჩეული' },
        { status: 400 }
      )
    }

    if (!Array.isArray(grades) || grades.length === 0) {
      return NextResponse.json(
        { error: 'მინიმუმ ერთი კლასი უნდა იყოს არჩეული' },
        { status: 400 }
      )
    }

    if (!Array.isArray(packages) || packages.length === 0) {
      return NextResponse.json(
        { error: 'მინიმუმ ერთი პაკეტი უნდა იყოს არჩეული' },
        { status: 400 }
      )
    }

    // Validate question types
    if (!Array.isArray(questionTypes) || questionTypes.length === 0) {
      return NextResponse.json(
        { error: 'მინიმუმ ერთი კითხვის ტიპი უნდა იყოს არჩეული' },
        { status: 400 }
      )
    }

    // maxParticipants validation removed - unlimited participants allowed

    if (rounds < 1 || rounds > 10) {
      return NextResponse.json(
        { error: 'რაუნდების რაოდენობა უნდა იყოს 1-დან 10-მდე' },
        { status: 400 }
      )
    }

    if (duration < 0.25 || duration > 8) {
      return NextResponse.json(
        { error: 'ტესტირების ხანგრძლივობა უნდა იყოს 0.25-დან 8 საათამდე' },
        { status: 400 }
      )
    }

    // Validate minimum points threshold
    if (minimumPointsThreshold !== undefined && minimumPointsThreshold !== null) {
      if (minimumPointsThreshold < 0 || minimumPointsThreshold > 100) {
        return NextResponse.json(
          { error: 'მინიმალური ქულის ზღვარი უნდა იყოს 0-დან 100-მდე' },
          { status: 400 }
        )
      }
    }

    // Verify packages exist and match subjects/grades
    const existingPackages = await prisma.questionPackage.findMany({
      where: {
        id: { in: packages }
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

    if (existingPackages.length !== packages.length) {
      return NextResponse.json(
        { error: 'ზოგიერთი პაკეტი ვერ მოიძებნა' },
        { status: 400 }
      )
    }

    // Check if packages match selected subjects and grades
    const packageSubjects = new Set(existingPackages.flatMap((pkg: typeof existingPackages[0]) => 
      pkg.questions.map((q: typeof pkg.questions[0]) => q.question.subject.name)
    ))
    const packageGrades = new Set(existingPackages.flatMap((pkg: typeof existingPackages[0]) => 
      pkg.questions.map((q: typeof pkg.questions[0]) => q.question.grade)
    ))

    const hasMatchingSubjects = subjects.some(subject => packageSubjects.has(subject))
    const hasMatchingGrades = grades.some(grade => packageGrades.has(grade))

    if (!hasMatchingSubjects) {
      return NextResponse.json(
        { error: 'არჩეული პაკეტები არ შეიცავენ არჩეულ საგნებს' },
        { status: 400 }
      )
    }

    if (!hasMatchingGrades) {
      return NextResponse.json(
        { error: 'არჩეული პაკეტები არ შეიცავენ არჩეულ კლასებს' },
        { status: 400 }
      )
    }

    // Get the admin record for the current user
    const admin = await prisma.admin.findUnique({
      where: { userId: session.user.id }
    })

    if (!admin) {
      return NextResponse.json(
        { error: 'ადმინისტრატორის პროფილი ვერ მოიძებნა' },
        { status: 400 }
      )
    }

    // Create olympiad event
    const olympiad = await prisma.olympiadEvent.create({
      data: {
        name,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        registrationStartDate: new Date(registrationStartDate),
        registrationDeadline: new Date(registrationDeadline),
        maxParticipants: 999999, // Set to a very high number to effectively remove limit
        isActive,
        showDetailedReview: showDetailedReview || false,
        rounds: parseInt(rounds),
        duration: parseFloat(duration),
        subjects: subjects,
        grades: grades.map((grade: string | number) => parseInt(grade.toString())),
        questionTypes: questionTypeOrder && questionTypeOrder.length > 0 ? questionTypeOrder : questionTypes,
        questionTypeQuantities: questionTypeQuantities || null,
        minimumPointsThreshold: minimumPointsThreshold ? parseInt(minimumPointsThreshold) : null,
        createdBy: admin.id,
        packages: {
          connect: packages.map(pkgId => ({ id: pkgId }))
        }
      },
      include: {
        packages: true,
        createdByUser: {
          select: {
            name: true,
            lastname: true,
            user: {
              select: {
                email: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json({
      message: 'ოლიმპიადა წარმატებით შეიქმნა',
      olympiad
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating olympiad:', error)
    return NextResponse.json(
      { error: 'სისტემური შეცდომა მოხდა ოლიმპიადის შექმნისას' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'ავტორიზაცია საჭიროა' },
        { status: 401 }
      )
    }

    // Check if user is admin
    if (session.user.userType !== 'ADMIN') {
      return NextResponse.json(
        { error: 'მხოლოდ ადმინისტრატორებს შეუძლიათ ოლიმპიადების ნახვა' },
        { status: 403 }
      )
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const isActive = searchParams.get('isActive')

    // Build where clause
    const where: Record<string, unknown> = {}
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === 'true'
    }

    // Get olympiad events with pagination
    const [olympiads, total] = await Promise.all([
      prisma.olympiadEvent.findMany({
        where,
        include: {
          packages: {
            select: {
              id: true,
              name: true,
              description: true
            }
          },
          createdByUser: {
            select: {
              name: true,
              lastname: true,
              user: {
                select: {
                  email: true
                }
              }
            }
          },
          _count: {
            select: {
              participations: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.olympiadEvent.count({ where })
    ])

    return NextResponse.json({
      olympiads,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching olympiads:', error)
    return NextResponse.json(
      { error: 'სისტემური შეცდომა მოხდა ოლიმპიადების ჩატვირთვისას' },
      { status: 500 }
    )
  }
}
