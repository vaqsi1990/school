'use client'

import { TeacherOnly } from '@/components/auth/ProtectedRoute'
import { useState, useEffect } from 'react'
import Link from 'next/link'

interface RecommendationResponse {
  id: string
  response: string
  createdAt: string
  student: {
    id: string
    name: string
    lastname: string
  }
}

interface AdminResponse {
  id: string
  response: string
  createdAt: string
  updatedAt: string
  admin: {
    id: string
    name: string
    lastname: string
  }
}

interface Recommendation {
  id: string
  title: string
  content: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  responses: RecommendationResponse[]
  adminResponse?: AdminResponse
}

function TeacherRecommendationsContent() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingRecommendation, setEditingRecommendation] = useState<Recommendation | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    content: ''
  })

  useEffect(() => {
    fetchRecommendations()
  }, [])

  const fetchRecommendations = async () => {
    try {
      const response = await fetch('/api/teacher/recommendations')
      if (response.ok) {
        const data = await response.json()
        setRecommendations(data.recommendations)
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error)
    } finally {
      setLoading(false)
    }
  }


  const handleCreateRecommendation = async () => {
    if (!formData.title || !formData.content) {
      alert('ყველა ველი სავალდებულოა')
      return
    }

    try {
      const response = await fetch('/api/teacher/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await fetchRecommendations()
        setShowCreateModal(false)
        setFormData({ title: '', content: '' })
        alert('რეკომენდაცია წარმატებით შეიქმნა!')
      } else {
        const errorData = await response.json()
        alert(`შეცდომა: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error creating recommendation:', error)
      alert('შეცდომა რეკომენდაციის შექმნისას')
    }
  }

  const handleEditRecommendation = async () => {
    if (!editingRecommendation) return

    try {
      const response = await fetch(`/api/teacher/recommendations/${editingRecommendation.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
        }),
      })

      if (response.ok) {
        await fetchRecommendations()
        setEditingRecommendation(null)
        setFormData({ title: '', content: '' })
        alert('რეკომენდაცია წარმატებით განახლდა!')
      } else {
        const errorData = await response.json()
        alert(`შეცდომა: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error updating recommendation:', error)
      alert('შეცდომა რეკომენდაციის განახლებისას')
    }
  }

  const handleDeleteRecommendation = async (id: string) => {
    if (!confirm('ნამდვილად გსურთ რეკომენდაციის წაშლა?')) {
      return
    }

    try {
      const response = await fetch(`/api/teacher/recommendations/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchRecommendations()
        alert('რეკომენდაცია წარმატებით წაიშალა!')
      } else {
        const errorData = await response.json()
        alert(`შეცდომა: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error deleting recommendation:', error)
      alert('შეცდომა რეკომენდაციის წაშლისას')
    }
  }

  const toggleRecommendationStatus = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/teacher/recommendations/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !isActive }),
      })

      if (response.ok) {
        await fetchRecommendations()
      } else {
        const errorData = await response.json()
        alert(`შეცდომა: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error updating recommendation status:', error)
      alert('შეცდომა რეკომენდაციის სტატუსის შეცვლისას')
    }
  }

  const startEdit = (recommendation: Recommendation) => {
    setEditingRecommendation(recommendation)
    setFormData({
      title: recommendation.title,
      content: recommendation.content
    })
  }

  const cancelEdit = () => {
    setEditingRecommendation(null)
    setFormData({ title: '', content: '' })
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">რეკომენდაციები</h1>
          <p className="text-gray-600 mt-2">მართეთ მოსწავლეების რეკომენდაციები</p>
        </div>

        <div className="flex justify-between items-center mb-6">
          <div className="text-sm text-gray-500">
            სულ: {recommendations.length} რეკომენდაცია
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
          >
            ახალი რეკომენდაცია
          </button>
        </div>

        {recommendations.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">რეკომენდაციები არ არის</h3>
            <p className="text-gray-600">შექმენით პირველი რეკომენდაცია</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {recommendations.map((recommendation) => (
              <div key={recommendation.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{recommendation.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        recommendation.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {recommendation.isActive ? 'აქტიური' : 'არააქტიური'}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3">{recommendation.content}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>შექმნა: {new Date(recommendation.createdAt).toLocaleDateString('ka-GE')}</span>
                      <span>პასუხები: {recommendation.responses.length}</span>
                      <span className={recommendation.adminResponse ? 'text-green-600 font-medium' : 'text-orange-600 font-medium'}>
                        {recommendation.adminResponse ? 'ადმინისტრატორის პასუხი მოცემულია' : 'ადმინისტრატორის პასუხი არ არის'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startEdit(recommendation)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      რედაქტირება
                    </button>
                    <button
                      onClick={() => toggleRecommendationStatus(recommendation.id, recommendation.isActive)}
                      className={`text-sm font-medium ${
                        recommendation.isActive 
                          ? 'text-orange-600 hover:text-orange-800' 
                          : 'text-green-600 hover:text-green-800'
                      }`}
                    >
                      {recommendation.isActive ? 'დეაქტივაცია' : 'აქტივაცია'}
                    </button>
                    <button
                      onClick={() => handleDeleteRecommendation(recommendation.id)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      წაშლა
                    </button>
                  </div>
                </div>

                {/* Responses */}
                {recommendation.responses.length > 0 && (
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">მოსწავლის პასუხები:</h4>
                    <div className="space-y-2">
                      {recommendation.responses.map((response) => (
                        <div key={response.id} className="p-3 bg-gray-50 rounded border">
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-sm font-medium text-gray-900">
                              {response.student.name} {response.student.lastname}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(response.createdAt).toLocaleDateString('ka-GE')}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">{response.response}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Admin Response */}
                {recommendation.adminResponse && (
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">ადმინისტრატორის პასუხი:</h4>
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex justify-between items-start mb-2">
                      
                        <span className="text-xs text-gray-500">
                          {new Date(recommendation.adminResponse.createdAt).toLocaleDateString('ka-GE')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{recommendation.adminResponse.response}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || editingRecommendation) && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingRecommendation ? 'რეკომენდაციის რედაქტირება' : 'ახალი რეკომენდაცია'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    სათაური *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="რეკომენდაციის სათაური"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    შინაარსი *
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                    placeholder="რეკომენდაციის შინაარსი"
                  />
                </div>

              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    if (editingRecommendation) {
                      cancelEdit()
                    } else {
                      setShowCreateModal(false)
                      setFormData({ title: '', content: '' })
                    }
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md"
                >
                  გაუქმება
                </button>
                <button
                  onClick={editingRecommendation ? handleEditRecommendation : handleCreateRecommendation}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                >
                  {editingRecommendation ? 'განახლება' : 'შექმნა'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function TeacherRecommendationsPage() {
  return (
    <TeacherOnly>
      <TeacherRecommendationsContent />
    </TeacherOnly>
  )
}
