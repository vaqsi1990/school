import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const blogPost = await prisma.blogPost.findUnique({
      where: { 
        slug: params.slug,
        published: true
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

    if (!blogPost) {
      return NextResponse.json({ error: 'ბლოგი ვერ მოიძებნა' }, { status: 404 })
    }

    // Increment view count
    await prisma.blogPost.update({
      where: { id: blogPost.id },
      data: { views: { increment: 1 } }
    })

    return NextResponse.json(blogPost)
  } catch (error) {
    console.error('Error fetching blog post:', error)
    return NextResponse.json(
      { error: 'სერვერის შეცდომა' },
      { status: 500 }
    )
  }
}
