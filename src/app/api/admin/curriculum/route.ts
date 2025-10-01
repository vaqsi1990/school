import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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
        { error: 'მხოლოდ ადმინისტრატორებს შეუძლიათ სასწავლო პროგრამების ნახვა' },
        { status: 403 }
      )
    }

    const curriculums = await prisma.curriculum.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ curriculums })
  } catch (error) {
    console.error('Error fetching curriculums:', error)
    return NextResponse.json(
      { error: 'სისტემური შეცდომა მოხდა სასწავლო პროგრამების ჩამოტვირთვისას' },
      { status: 500 }
    )
  }
}

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
        { error: 'მხოლოდ ადმინისტრატორებს შეუძლიათ სასწავლო პროგრამების შექმნა' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { title, content } = body

    // Validate required fields
    if (!title) {
      return NextResponse.json(
        { error: 'სასწავლო პროგრამის სათაური საჭიროა' },
        { status: 400 }
      )
    }

    // Create curriculum
    const curriculum = await prisma.curriculum.create({
      data: {
        title,
        content: content || null
      }
    })

    return NextResponse.json({
      message: 'სასწავლო პროგრამა წარმატებით შეიქმნა',
      curriculum
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating curriculum:', error)
    return NextResponse.json(
      { error: 'სისტემური შეცდომა მოხდა სასწავლო პროგრამის შექმნისას' },
      { status: 500 }
    )
  }
}
