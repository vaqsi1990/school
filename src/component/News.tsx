'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'

interface BlogPost {
  id: string
  title: string
  slug: string
  content: string
  imageUrl: string
  createdAt: string
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

const News = () => {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch('/api/blog')
        if (response.ok) {
          const data = await response.json()
          if (data.blogPosts && Array.isArray(data.blogPosts)) {
            setPosts(data.blogPosts.slice(0, 4)) // Get only first 4 posts
          } else {
            setPosts([]) // Set empty array if no posts
          }
        }
      } catch (error) {
        console.error('Error fetching blog posts:', error)
        setPosts([]) // Set empty array on error
      } finally {
        setIsLoading(false)
      }
    }

    fetchPosts()
  }, [])

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

  if (isLoading) {
    return (
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <div className="text-black font-bold text-[16px]">იტვირთება...</div>
          </div>
        </div>
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-black mb-4">ბოლო სიახლეები</h2>
            <p className="text-lg md:text-xl text-black mb-8 leading-relaxed">სიახლეები ჯერ არ არის დამატებული</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <motion.h2 
            className="text-3xl font-bold text-black mb-4"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            ბოლო სიახლეები
          </motion.h2>
          <motion.p 
            className="text-black text-[16px]"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            შეიტყვე ყველაფერი ოლიმპიადის შესახებ
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {posts.map((post, index) => (
              <motion.div 
                key={post.id}
                className="bg-white rounded-lg shadow-lg overflow-hidden transition-shadow duration-300"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10, scale: 1.02 }}
              >
                {post.imageUrl ? (
                  <div className="relative h-48 w-full">
                    <Image
                      src={post.imageUrl}
                      alt={post.title}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        // Hide image if it fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  </div>
                ) : (
                  <div className="h-48 w-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                    <div className="text-center text-gray-600">
                      <svg className="w-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                      </svg>
                      <p className="text-sm">სურათი არ არის</p>
                    </div>
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-black text-[16px] font-semibold mb-3 line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-black text-[16px] mb-4 line-clamp-3">
                    {post.content.replace(/<[^>]*>/g, '').substring(0, 100)}...
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-black text-[16px] text-sm">
                      {formatDate(post.createdAt)}
                    </span>
                 
                  </div>
                  <div className="flex items-center justify-between">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="text-blue-600 mt-4 hover:text-blue-800 font-medium"
                  >
                    წაიკითხე მეტი →
                  </Link>
                  
                </div>
                </div>
              </motion.div>
            
            ))}
          </div>

        <motion.div 
          className="text-center mt-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link 
              href="/blog"
              className="bg-[#034e64] cursor-pointer text-white px-4 py-3 rounded-md md:text-[20px] text-[16px] font-bold transition-colors hover:bg-[#023a4d]"
            >
              ყველა სიახლე
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

export default News