import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
        { error: 'მხოლოდ ადმინისტრატორებს შეუძლიათ სასწავლო პროგრამების რედაქტირება' },
        { status: 403 }
      )
    }

    const resolvedParams = await params
    const body = await request.json()
    const { title, content } = body

    // Validate required fields
    if (!title) {
      return NextResponse.json(
        { error: 'სასწავლო პროგრამის სათაური საჭიროა' },
        { status: 400 }
      )
    }

    // Update curriculum
    const curriculum = await prisma.curriculum.update({
      where: { id: resolvedParams.id },
      data: {
        title,
        content: content || null
      }
    })

    return NextResponse.json({
      message: 'სასწავლო პროგრამა წარმატებით განახლდა',
      curriculum
    })

  } catch (error) {
    console.error('Error updating curriculum:', error)
    return NextResponse.json(
      { error: 'სისტემური შეცდომა მოხდა სასწავლო პროგრამის განახლებისას' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
        { error: 'მხოლოდ ადმინისტრატორებს შეუძლიათ სასწავლო პროგრამების წაშლა' },
        { status: 403 }
      )
    }

    const resolvedParams = await params

    // Check if curriculum is used by any olympiads
    const olympiadsUsingCurriculum = await prisma.olympiad.count({
      where: { curriculumId: resolvedParams.id }
    })

    if (olympiadsUsingCurriculum > 0) {
      return NextResponse.json(
        { error: 'ამ სასწავლო პროგრამას იყენებს ოლიმპიადები, ვერ წაიშლება' },
        { status: 400 }
      )
    }

    // Delete curriculum
    await prisma.curriculum.delete({
      where: { id: resolvedParams.id }
    })

    return NextResponse.json({
      message: 'სასწავლო პროგრამა წარმატებით წაიშალა'
    })

  } catch (error) {
    console.error('Error deleting curriculum:', error)
    return NextResponse.json(
      { error: 'სისტემური შეცდომა მოხდა სასწავლო პროგრამის წაშლისას' },
      { status: 500 }
    )
  }
}
