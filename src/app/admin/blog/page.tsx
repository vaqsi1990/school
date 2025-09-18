'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import ImageUpload from '@/component/CloudinaryUploader'

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
    admin?: any
    teacher?: any
  }
}

const AdminBlogPage = () => {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    slug: '',
    published: false,
    tags: '',
    imageUrl: '',
    images: [] as string[]
  })

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/auth/signin')
      return
    }

    fetchBlogPosts()
  }, [session, status, router])

  const fetchBlogPosts = async () => {
    try {
      const response = await fetch('/api/admin/blog')
      if (response.ok) {
        const data = await response.json()
        setBlogPosts(data.blogPosts)
      }
    } catch (error) {
      console.error('Error fetching blog posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      
      const response = editingPost 
        ? await fetch(`/api/admin/blog/${editingPost.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...formData,
              tags: tagsArray
            })
          })
        : await fetch('/api/admin/blog', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...formData,
              tags: tagsArray
            })
          })

      if (response.ok) {
        setShowForm(false)
        setEditingPost(null)
        setFormData({
          title: '',
          content: '',
          excerpt: '',
          slug: '',
          published: false,
          tags: '',
          imageUrl: '',
          images: []
        })
        fetchBlogPosts()
      } else {
        const error = await response.json()
        alert(`შეცდომა: ${error.error}`)
      }
    } catch (error) {
      console.error('Error saving blog post:', error)
      alert('შეცდომა ბლოგის შენახვისას')
    }
  }

  const editPost = (post: BlogPost) => {
    setEditingPost(post)
    setFormData({
      title: post.title,
      content: post.content,
      excerpt: post.excerpt || '',
      slug: post.slug,
      published: post.published,
      tags: post.tags.join(', '),
      imageUrl: post.imageUrl || '',
      images: []
    })
    setShowForm(true)
  }

  const deletePost = async (id: string) => {
    if (!confirm('ნამდვილად გინდათ ამ ბლოგის წაშლა?')) return

    try {
      const response = await fetch(`/api/admin/blog/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchBlogPosts()
      } else {
        alert('შეცდომა ბლოგის წაშლისას')
      }
    } catch (error) {
      console.error('Error deleting blog post:', error)
      alert('შეცდომა ბლოგის წაშლისას')
    }
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9ა-ჰ\s]/g, '')
      .replace(/\s+/g, '-')
      .trim()
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-500 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-black">იტვირთება...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-500 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-black">ბლოგის მართვა</h1>
            <button
              onClick={() => {
                setShowForm(true)
                setEditingPost(null)
                setFormData({
                  title: '',
                  content: '',
                  excerpt: '',
                  slug: '',
                  published: false,
                  tags: '',
                  imageUrl: '',
                  images: []
                })
              }}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              ახალი ბლოგი
            </button>
          </div>

          {showForm && (
            <div className="mb-8 p-6 border rounded-lg bg-gray-50">
              <h2 className="text-2xl font-bold text-black mb-4">
                {editingPost ? 'ბლოგის რედაქტირება' : 'ახალი ბლოგი'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[16px] font-medium text-black mb-2">
                    სათაური *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, title: e.target.value }))
                      if (!editingPost) {
                        setFormData(prev => ({ ...prev, slug: generateSlug(e.target.value) }))
                      }
                    }}
                    className="w-full text-black placeholder:text-black p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[16px] font-medium text-black mb-2">
                    Slug *
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    className="w-full text-black placeholder:text-black p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[16px] font-medium text-black mb-2">
                    მოკლე აღწერა
                  </label>
                  <textarea
                    value={formData.excerpt}
                    onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                    className="w-full text-black placeholder:text-black p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-[16px] font-medium text-black mb-2">
                    კონტენტი *
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    className="w-full text-black placeholder:text-black p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={10}
                    required
                  />
                </div>

                <div>
                  <label className="block text-[16px] font-medium text-black mb-2">
                    ტეგები (მძიმით გამოყოფილი)
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                    className="w-full text-black placeholder:text-black p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="მაგ: განათლება, ტექნოლოგია, ოლიმპიადა"
                  />
                </div>

                <div>
                  <label className="block text-[16px] font-medium text-black mb-2">
                    სურათების ატვირთვა
                  </label>
                  <ImageUpload
                    value={formData.images}
                    onChange={(urls) => setFormData(prev => ({ ...prev, images: urls }))}
                  />
                </div>

                <div>
                  <label className="block text-[16px] font-medium text-black mb-2">
                    სურათის URL (ალტერნატივა)
                  </label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                    className="w-full text-black placeholder:text-black p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="published"
                    checked={formData.published}
                    onChange={(e) => setFormData(prev => ({ ...prev, published: e.target.checked }))}
                    className="w-4 h-4 text-black placeholder:text-black border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="published" className="text-[16px] font-medium text-black">
                    გამოქვეყნება
                  </label>
                </div>

                <div className="flex space-x-4">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {editingPost ? 'განახლება' : 'შენახვა'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false)
                      setEditingPost(null)
                    }}
                    className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    გაუქმება
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-[15px] font-medium text-black uppercase tracking-wider">
                    სათაური
                  </th>
                  <th className="px-6 py-3 text-left text-[15px] font-medium text-black uppercase tracking-wider">
                    ავტორი
                  </th>
                  <th className="px-6 py-3 text-left text-[15px] font-medium text-black uppercase tracking-wider">
                    სტატუსი
                  </th>
                  <th className="px-6 py-3 text-left text-[15px] font-medium text-black uppercase tracking-wider">
                    ნახვები
                  </th>
                  <th className="px-6 py-3 text-left text-[15px] font-medium text-black uppercase tracking-wider">
                    შექმნის თარიღი
                  </th>
                  <th className="px-6 py-3 text-left text-[15px] font-medium text-black uppercase tracking-wider">
                    მოქმედებები
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {blogPosts.map((post) => (
                  <tr key={post.id} className="">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-[16px] font-medium text-black">{post.title}</div>
                      <div className="text-[16px] text-black">{post.slug}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[16px] text-black">
                      {post.author.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        post.published 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {post.published ? 'გამოქვეყნებული' : 'დრაფტი'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[16px] text-black">
                      {post.views}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[16px] text-black">
                      {new Date(post.createdAt).toLocaleDateString('ka-GE')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[16px] font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => editPost(post)}
                          className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-blue-700"
                        >
                          რედაქტირება
                        </button>
                        <button
                          onClick={() => deletePost(post.id)}
                          className="bg-red-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-red-700"
                        >
                          წაშლა
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {blogPosts.length === 0 && (
            <div className="text-center py-8">
              <p className="text-black">ბლოგები ჯერ არ არის დამატებული</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminBlogPage
