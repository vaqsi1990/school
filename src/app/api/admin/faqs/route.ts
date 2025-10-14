import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.userType !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const faqs = await prisma.fAQ.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ faqs })
  } catch (error) {
    console.error('Error fetching FAQs:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.userType !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { question, answer, published = true } = await request.json()

    if (!question || !answer) {
      return NextResponse.json({ error: 'Question and answer are required' }, { status: 400 })
    }

    const faq = await prisma.fAQ.create({
      data: {
        question,
        answer,
        published
      }
    })

    return NextResponse.json({ faq }, { status: 201 })
  } catch (error) {
    console.error('Error creating FAQ:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
