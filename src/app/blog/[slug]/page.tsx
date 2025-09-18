'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

interface BlogPost {
  id: string
  title: string
  content: string
  excerpt?: string
  slug: string
  published: boolean
  publishedAt?: string
  createdAt: string
  updatedAt: string
  tags: string[]
  imageUrl?: string
  views: number
  author: {
    id: string
    email: string
    admin?: {
      id: string
      name: string
      lastname: string
      role: string
    }
    teacher?: {
      id: string
      name: string
      lastname: string
      subject: string
      school: string
    }
  }
}

const BlogPostPage = () => {
  const params = useParams()
  const slug = params.slug as string
  const [blogPost, setBlogPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    if (slug) {
      fetchBlogPost()
    }
  }, [slug])

  const fetchBlogPost = async () => {
    try {
      const response = await fetch(`/api/blog/${slug}`)
      if (response.ok) {
        const data = await response.json()
        setBlogPost(data)
      } else {
        setError('სიახლე ვერ მოიძებნა')
      }
    } catch (error) {
      console.error('Error fetching blog post:', error)
      setError('შეცდომა სიახლეს ჩატვისას')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const georgianMonths = [
      'იანვარი', 'თებერვალი', 'მარტი', 'აპრილი',
      'მაისი', 'ივნისი', 'ივლისი', 'აგვისტო',
      'სექტემბერი', 'ოქტომბერი', 'ნოემბერი', 'დეკემბერი'
    ]
    
    const day = date.getDate()
    const month = georgianMonths[date.getMonth()]
    const year = date.getFullYear()
    
    return `${day} ${month} ${year}`
  }

  const getAuthorName = (author: BlogPost['author']) => {
    if (author.admin) return 'ადმინისტრატორი'
    if (author.teacher) return 'მასწავლებელი'
    return 'ავტორი'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">იტვირთება...</p>
        </div>
      </div>
    )
  }

  if (error || !blogPost) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-black mb-4">სიახლე ვერ მოიძებნა</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/blog"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            სიახლეებზე დაბრუნება
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {blogPost.imageUrl && (
            <div className="aspect-w-16 aspect-h-9">
              <img
                src={blogPost.imageUrl}
                alt={blogPost.title}
                className="w-full h-64 md:h-96 object-cover"
              />
            </div>
          )}
          
          <div className="p-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-500">{getAuthorName(blogPost.author)}</span>
                <span className="text-sm text-gray-500">{formatDate(blogPost.publishedAt || blogPost.createdAt)}</span>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold text-black mb-4">
                {blogPost.title}
              </h1>
              
              {blogPost.excerpt && (
                <p className="text-xl text-gray-600 leading-relaxed">
                  {blogPost.excerpt}
                </p>
              )}
            </div>

            {/* Tags */}
            {blogPost.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {blogPost.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Content */}
            <div className="prose prose-lg max-w-none">
              <div 
                className="text-gray-800 leading-relaxed whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: blogPost.content.replace(/\n/g, '<br>') }}
              />
            </div>

            {/* Footer */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500">
                    👁 {blogPost.views} ნახვა
                  </span>
                  <span className="text-sm text-gray-500">
                    📅 განახლებული: {formatDate(blogPost.updatedAt)}
                  </span>
                </div>
                
                <Link
                  href="/blog"
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  სიახლეებზე დაბრუნება
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BlogPostPage
