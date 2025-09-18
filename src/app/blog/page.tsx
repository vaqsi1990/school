'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'

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

const BlogPage = () => {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTag, setSelectedTag] = useState<string>('')
  const [allTags, setAllTags] = useState<string[]>([])

  useEffect(() => {
    fetchBlogPosts()
  }, [selectedTag])

  const fetchBlogPosts = async () => {
    try {
      const url = selectedTag 
        ? `/api/blog?tag=${encodeURIComponent(selectedTag)}`
        : '/api/blog'
      
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setBlogPosts(data.blogPosts)
        
        // Extract unique tags
        const tags = new Set<string>()
        data.blogPosts.forEach((post: BlogPost) => {
          post.tags.forEach(tag => tags.add(tag))
        })
        setAllTags(Array.from(tags))
      }
    } catch (error) {
      console.error('Error fetching blog posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ka-GE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-black mb-4">სიახლეები</h1>
          <p className="text-xl text-gray-600">განათლებისა და ოლიმპიადების შესახებ საინტერესო სტატიები</p>
        </div>

        {/* Tag Filter */}
        {allTags.length > 0 && (
          <div className="mb-8">
            <div className="flex flex-wrap gap-2 justify-center">
              <button
                onClick={() => setSelectedTag('')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedTag === ''
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                ყველა
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedTag === tag
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post) => (
            <article key={post.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              {post.imageUrl && (
                <div className="aspect-w-16 aspect-h-9">
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="w-full h-48 object-cover"
                  />
                </div>
              )}
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">{getAuthorName(post.author)}</span>
                  <span className="text-sm text-gray-500">{formatDate(post.publishedAt || post.createdAt)}</span>
                </div>
                
                <h2 className="text-xl font-bold text-black mb-3 line-clamp-2">
                  {post.title}
                </h2>
                
                {post.excerpt && (
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                )}
                
                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                    {post.tags.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        +{post.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    წაიკითხე მეტი →
                  </Link>
                  <span className="text-sm text-gray-500">
                    👁 {post.views}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>

        {blogPosts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">სიახლეები ჯერ არ არის გამოქვეყნებული</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default BlogPage