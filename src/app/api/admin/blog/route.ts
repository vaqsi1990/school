import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'ავტორიზაცია საჭიროა' }, { status: 401 })
    }

    // Check if user is admin or teacher
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { admin: true, teacher: true }
    })

    if (!user?.admin && !user?.teacher) {
      return NextResponse.json({ error: 'წვდომა აკრძალულია' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const blogPosts = await prisma.blogPost.findMany({
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
      orderBy: { createdAt: 'desc' }
    })

    const total = await prisma.blogPost.count()

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

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'ავტორიზაცია საჭიროა' }, { status: 401 })
    }

    // Check if user is admin or teacher
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { admin: true, teacher: true }
    })

    if (!user?.admin && !user?.teacher) {
      return NextResponse.json({ error: 'წვდომა აკრძალულია' }, { status: 403 })
    }

    const body = await request.json()
    const { title, content, excerpt, slug, published, tags, imageUrl } = body

    if (!title || !content || !slug) {
      return NextResponse.json(
        { error: 'სათაური, კონტენტი და slug აუცილებელია' },
        { status: 400 }
      )
    }

    // Check if slug already exists
    const existingPost = await prisma.blogPost.findUnique({
      where: { slug }
    })

    if (existingPost) {
      return NextResponse.json(
        { error: 'ეს slug უკვე არსებობს' },
        { status: 400 }
      )
    }

    const blogPost = await prisma.blogPost.create({
      data: {
        title,
        content,
        excerpt: excerpt || content.substring(0, 200) + '...',
        slug,
        authorId: session.user.id,
        published: published || false,
        publishedAt: published ? new Date() : null,
        tags: tags || [],
        imageUrl
      },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            admin: true,
            teacher: true
          }
        }
      }
    })

    return NextResponse.json(blogPost, { status: 201 })
  } catch (error) {
    console.error('Error creating blog post:', error)
    return NextResponse.json(
      { error: 'სერვერის შეცდომა' },
      { status: 500 }
    )
  }
}
