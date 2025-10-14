import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'FAQ ID is required' }, { status: 400 })
    }

    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.userType !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const faq = await prisma.fAQ.findUnique({
      where: {
        id: parseInt(id)
      }
    })

    if (!faq) {
      return NextResponse.json({ error: 'FAQ not found' }, { status: 404 })
    }

    return NextResponse.json({ faq })
  } catch (error) {
    console.error('Error fetching FAQ:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'FAQ ID is required' }, { status: 400 })
    }

    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.userType !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { question, answer, published } = await request.json()

    if (!question || !answer) {
      return NextResponse.json({ error: 'Question and answer are required' }, { status: 400 })
    }

    const faq = await prisma.fAQ.update({
      where: {
        id: parseInt(id)
      },
      data: {
        question,
        answer,
        published
      }
    })

    return NextResponse.json({ faq })
  } catch (error) {
    console.error('Error updating FAQ:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'FAQ ID is required' }, { status: 400 })
    }

    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.userType !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.fAQ.delete({
      where: {
        id: parseInt(id)
      }
    })

    return NextResponse.json({ message: 'FAQ deleted successfully' })
  } catch (error) {
    console.error('Error deleting FAQ:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
