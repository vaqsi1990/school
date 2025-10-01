'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import Link from 'next/link'

interface Curriculum {
  id: string
  title: string
  content: string | null
  createdAt: string
  updatedAt: string
}

function CurriculumManagement() {
  const { user } = useAuth()
  const [curriculums, setCurriculums] = useState<Curriculum[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCurriculum, setEditingCurriculum] = useState<Curriculum | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    content: ''
  })

  useEffect(() => {
    fetchCurriculums()
  }, [])

  const fetchCurriculums = async () => {
    try {
      const response = await fetch('/api/admin/curriculum')
      const data = await response.json()
      
      if (response.ok) {
        setCurriculums(data.curriculums)
      } else {
        console.error('Error fetching curriculums:', data.error)
      }
    } catch (error) {
      console.error('Error fetching curriculums:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      alert('სასწავლო პროგრამის სათაური საჭიროა')
      return
    }

    try {
      const url = editingCurriculum 
        ? `/api/admin/curriculum/${editingCurriculum.id}`
        : '/api/admin/curriculum'
      
      const method = editingCurriculum ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        alert(editingCurriculum ? 'სასწავლო პროგრამა წარმატებით განახლდა!' : 'სასწავლო პროგრამა წარმატებით შეიქმნა!')
        fetchCurriculums()
        resetForm()
      } else {
        alert(data.error || 'შეცდომა მოხდა')
      }
    } catch (error) {
      console.error('Error saving curriculum:', error)
      alert('შეცდომა მოხდა სასწავლო პროგრამის შენახვისას')
    }
  }

  const handleEdit = (curriculum: Curriculum) => {
    setEditingCurriculum(curriculum)
    setFormData({
      title: curriculum.title,
      content: curriculum.content || ''
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('დარწმუნებული ხართ, რომ გსურთ ამ სასწავლო პროგრამის წაშლა?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/curriculum/${id}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (response.ok) {
        alert('სასწავლო პროგრამა წარმატებით წაიშალა!')
        fetchCurriculums()
      } else {
        alert(data.error || 'შეცდომა მოხდა')
      }
    } catch (error) {
      console.error('Error deleting curriculum:', error)
      alert('შეცდომა მოხდა სასწავლო პროგრამის წაშლისას')
    }
  }

  const resetForm = () => {
    setFormData({ title: '', content: '' })
    setEditingCurriculum(null)
    setIsModalOpen(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">იტვირთება...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            უკან დაბრუნება
          </Link>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">სასწავლო პროგრამების მართვა</h1>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                ახალი სასწავლო პროგრამა
              </button>
            </div>
          </div>

          <div className="p-6">
            {curriculums.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">სასწავლო პროგრამები ჯერ არ არის შექმნილი</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {curriculums.map((curriculum) => (
                  <div key={curriculum.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {curriculum.title}
                        </h3>
                        {curriculum.content && (
                          <p className="text-gray-600 mb-2 line-clamp-3">
                            {curriculum.content}
                          </p>
                        )}
                        <p className="text-sm text-gray-500">
                          შექმნილია: {new Date(curriculum.createdAt).toLocaleDateString('ka-GE')}
                        </p>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => handleEdit(curriculum)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          რედაქტირება
                        </button>
                        <button
                          onClick={() => handleDelete(curriculum.id)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          წაშლა
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
            <h2 className="text-xl font-bold mb-4">
              {editingCurriculum ? 'სასწავლო პროგრამის რედაქტირება' : 'ახალი სასწავლო პროგრამა'}
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  სასწავლო პროგრამის სათაური *
                </label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="mb-6">
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                  შინაარსი
                </label>
                <textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                >
                  გაუქმება
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  {editingCurriculum ? 'განახლება' : 'შექმნა'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default function CurriculumPage() {
  return (
    <ProtectedRoute allowedUserTypes={['ADMIN']}>
      <CurriculumManagement />
    </ProtectedRoute>
  )
}
