import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const blogPost = await prisma.blogPost.findUnique({
      where: { id: params.id },
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

    if (!blogPost) {
      return NextResponse.json({ error: 'ბლოგი ვერ მოიძებნა' }, { status: 404 })
    }

    return NextResponse.json(blogPost)
  } catch (error) {
    console.error('Error fetching blog post:', error)
    return NextResponse.json(
      { error: 'სერვერის შეცდომა' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Check if slug already exists (excluding current post)
    const existingPost = await prisma.blogPost.findFirst({
      where: { 
        slug,
        id: { not: params.id }
      }
    })

    if (existingPost) {
      return NextResponse.json(
        { error: 'ეს slug უკვე არსებობს' },
        { status: 400 }
      )
    }

    const blogPost = await prisma.blogPost.update({
      where: { id: params.id },
      data: {
        title,
        content,
        excerpt: excerpt || content.substring(0, 200) + '...',
        slug,
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

    return NextResponse.json(blogPost)
  } catch (error) {
    console.error('Error updating blog post:', error)
    return NextResponse.json(
      { error: 'სერვერის შეცდომა' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    await prisma.blogPost.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'ბლოგი წაიშალა' })
  } catch (error) {
    console.error('Error deleting blog post:', error)
    return NextResponse.json(
      { error: 'სერვერის შეცდომა' },
      { status: 500 }
    )
  }
}
