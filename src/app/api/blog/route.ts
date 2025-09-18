import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit
    const tag = searchParams.get('tag')

    const where = {
      published: true,
      ...(tag && { tags: { has: tag } })
    }

    const blogPosts = await prisma.blogPost.findMany({
      where,
      skip,
      take: limit,
      include: {
        author: {
          select: {
            id: true,
            email: true,
            admin: true,
            teacher: true
          }
        }
      },
      orderBy: { publishedAt: 'desc' }
    })

    const total = await prisma.blogPost.count({ where })

    return NextResponse.json({
      blogPosts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching blog posts:', error)
    return NextResponse.json(
      { error: 'სერვერის შეცდომა' },
      { status: 500 }
    )
  }
}
