import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Types for database queries
interface OlympiadEventData {
  id: string
  name: string
  description: string | null
  startDate: Date
  endDate: Date
  registrationDeadline: Date
  subjects: string[]
  grades: number[]
  isActive: boolean
}

interface OlympiadRegistrationData {
  id: string
  name: string
  registrationDeadline: Date
  isActive: boolean
  maxParticipants: number
}

interface StudentData {
  id: string
  grade: number
}

interface TransformedOlympiad {
  id: string
  title: string
  description: string
  startDate: string
  endDate: string
  registrationDeadline: string
  subjects: string[]
  grades: number[]
  status: 'upcoming' | 'completed'
  isRegistered: boolean
  registrationStatus?: 'REGISTERED' | 'IN_PROGRESS' | 'COMPLETED' | 'DISQUALIFIED'
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'ავტორიზაცია საჭიროა' },
        { status: 401 }
      )
    }

    // Check if user is a student
    if (session.user.userType !== 'STUDENT') {
      return NextResponse.json(
        { error: 'მხოლოდ სტუდენტებს შეუძლიათ ოლიმპიადების ნახვა' },
        { status: 403 }
      )
    }

    console.log('User ID:', session.user.id)

    // Get student's grade and ID
    const student = await prisma.student.findUnique({
      where: { userId: session.user.id },
      select: { id: true, grade: true }
    }) as StudentData | null

    console.log('Student found:', student)

    if (!student) {
      console.log('Student profile not found')
      return NextResponse.json(
        { error: 'სტუდენტის პროფილი ვერ მოიძებნა' },
        { status: 404 }
      )
    }

    console.log('Student grade:', student.grade)

    // Fetch olympiads that match student's grade
    const olympiads = await prisma.olympiadEvent.findMany({
      where: {
        grades: {
          has: student.grade
        },
        startDate: {
          gte: new Date()
        }
      },
      select: {
        id: true,
        name: true,
        description: true,
        startDate: true,
        endDate: true,
        registrationDeadline: true,
        subjects: true,
        grades: true,
        isActive: true
      },
      orderBy: {
        startDate: 'asc'
      }
    }) as OlympiadEventData[]

    console.log('Found olympiads:', olympiads.length)
    console.log('Olympiads:', olympiads)

    // Get student's registrations for all olympiads
    const studentRegistrations = await prisma.studentOlympiadEvent.findMany({
      where: {
        studentId: student.id,
        olympiadEventId: {
          in: olympiads.map(o => o.id)
        }
      },
      select: {
        olympiadEventId: true,
        status: true
      }
    })

    // Create a map for quick lookup
    const registrationMap = new Map(
      studentRegistrations.map(reg => [reg.olympiadEventId, reg.status])
    )

    // Transform data for frontend
    const transformedOlympiads: TransformedOlympiad[] = olympiads.map((olympiad: OlympiadEventData) => {
      const registrationStatus = registrationMap.get(olympiad.id)
      return {
        id: olympiad.id,
        title: olympiad.name,
        description: olympiad.description || '',
        startDate: olympiad.startDate.toISOString(),
        endDate: olympiad.endDate.toISOString(),
        registrationDeadline: olympiad.registrationDeadline.toISOString(),
        subjects: olympiad.subjects,
        grades: olympiad.grades,
        status: olympiad.isActive ? 'upcoming' : 'completed',
        isRegistered: !!registrationStatus,
        registrationStatus: registrationStatus || undefined
      }
    })

    console.log('Transformed olympiads:', transformedOlympiads)

    return NextResponse.json({
      olympiads: transformedOlympiads
    })

  } catch (error) {
    console.error('Error fetching student olympiads:', error)
    return NextResponse.json(
      { error: 'სერვერის შეცდომა' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'ავტორიზაცია საჭიროა' },
        { status: 401 }
      )
    }

    // Check if user is a student
    if (session.user.userType !== 'STUDENT') {
      return NextResponse.json(
        { error: 'მხოლოდ სტუდენტებს შეუძლიათ ოლიმპიადებზე რეგისტრაცია' },
        { status: 403 }
      )
    }

    const { olympiadId } = await request.json()

    if (!olympiadId) {
      return NextResponse.json(
        { error: 'ოლიმპიადის ID საჭიროა' },
        { status: 400 }
      )
    }

    // Check if olympiad exists and is active
    const olympiad = await prisma.olympiadEvent.findUnique({
      where: { id: olympiadId },
      select: {
        id: true,
        name: true,
        registrationDeadline: true,
        isActive: true,
        maxParticipants: true
      }
    }) as OlympiadRegistrationData | null

    if (!olympiad) {
      return NextResponse.json(
        { error: 'ოლიმპიადა ვერ მოიძებნა' },
        { status: 404 }
      )
    }

    if (!olympiad.isActive) {
      return NextResponse.json(
        { error: 'ოლიმპიადა არ არის აქტიური' },
        { status: 400 }
      )
    }

    // Check if registration deadline has passed
    if (new Date() > olympiad.registrationDeadline) {
      return NextResponse.json(
        { error: 'რეგისტრაციის ვადა გასდა' },
        { status: 400 }
      )
    }

    // Get student record first
    const studentRecord = await prisma.student.findUnique({
      where: { userId: session.user.id },
      select: { id: true }
    }) as { id: string } | null

    if (!studentRecord) {
      return NextResponse.json(
        { error: 'სტუდენტის პროფილი ვერ მოიძებნა' },
        { status: 404 }
      )
    }

    // Check if student is already registered
    const existingRegistration = await prisma.studentOlympiadEvent.findFirst({
      where: {
        studentId: studentRecord.id,
        olympiadEventId: olympiadId
      }
    })

    if (existingRegistration) {
      return NextResponse.json(
        { error: 'თქვენ უკვე დარეგისტრირებული ხართ ამ ოლიმპიადაზე' },
        { status: 400 }
      )
    }

    // Check participant limit
    const participantCount = await prisma.studentOlympiadEvent.count({
      where: { olympiadEventId: olympiadId }
    })

    if (participantCount >= olympiad.maxParticipants) {
      return NextResponse.json(
        { error: 'ოლიმპიადაზე მონაწილეთა ლიმიტი ამოწურულია' },
        { status: 400 }
      )
    }

    // Create registration
    const registration = await prisma.studentOlympiadEvent.create({
      data: {
        studentId: studentRecord.id,
        olympiadEventId: olympiadId,
        status: 'REGISTERED'
      }
    })

    return NextResponse.json({
      success: true,
      message: `წარმატებით დარეგისტრირდით ${olympiad.name} ოლიმპიადაზე!`,
      registrationId: registration.id
    })

  } catch (error) {
    console.error('Error registering for olympiad:', error)
    return NextResponse.json(
      { error: 'რეგისტრაცია ვერ მოხერხდა' },
      { status: 500 }
    )
  }
}
