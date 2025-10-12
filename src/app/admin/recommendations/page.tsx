'use client'

import { AdminOnly } from '@/components/auth/ProtectedRoute'
import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Teacher {
  id: string
  name: string
  lastname: string
}

interface Student {
  id: string
  name: string
  lastname: string
  grade: number
  school: string
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
  teacher: Teacher
  adminResponse?: AdminResponse
}

interface Statistics {
  totalRecommendations: number
  activeRecommendations: number
  totalResponses: number
}

function AdminRecommendationsContent() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [statistics, setStatistics] = useState<Statistics>({
    totalRecommendations: 0,
    activeRecommendations: 0,
    totalResponses: 0
  })
  const [loading, setLoading] = useState(true)
  const [selectedRecommendation, setSelectedRecommendation] = useState<Recommendation | null>(null)
  const [respondingTo, setRespondingTo] = useState<string | null>(null)
  const [responseText, setResponseText] = useState('')
  const [savingResponse, setSavingResponse] = useState(false)

  useEffect(() => {
    fetchRecommendations()
  }, [])

  const fetchRecommendations = async () => {
    try {
      const response = await fetch('/api/admin/recommendations')
      if (response.ok) {
        const data = await response.json()
        setRecommendations(data.recommendations)
        setStatistics(data.statistics)
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteRecommendation = async (id: string) => {
    if (!confirm('ნამდვილად გსურთ რეკომენდაციის წაშლა? ეს მოქმედება შეუქცევადია და ყველა პასუხიც წაიშლება.')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/recommendations?id=${id}`, {
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

  const handleResponseSubmit = async (recommendationId: string) => {
    if (!responseText.trim()) {
      alert('შეიყვანეთ პასუხი')
      return
    }

    setSavingResponse(true)
    try {
      const response = await fetch('/api/admin/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          recommendationId: recommendationId,
          response: responseText 
        }),
      })

      if (response.ok) {
        await fetchRecommendations()
        setRespondingTo(null)
        setResponseText('')
        alert('პასუხი წარმატებით გაიგზავნა მასწავლებელს!')
      } else {
        const errorData = await response.json()
        alert(`შეცდომა: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error saving response:', error)
      alert('შეცდომა პასუხის გაგზავნისას')
    } finally {
      setSavingResponse(false)
    }
  }

  const startResponse = (recommendationId: string, existingResponse?: string) => {
    setRespondingTo(recommendationId)
    setResponseText(existingResponse || '')
  }

  const cancelResponse = () => {
    setRespondingTo(null)
    setResponseText('')
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
          <Link href="/admin/dashboard" className="text-blue-600 hover:text-blue-800 mb-2 inline-block">
            ← ადმინის დეშბორდზე დაბრუნება
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">რეკომენდაციები</h1>
          <p className="text-gray-600 mt-2">ყველა მასწავლებლის რეკომენდაციები და მოსწავლეების პასუხები</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">სულ რეკომენდაციები</dt>
                    <dd className="text-lg font-medium text-gray-900">{statistics.totalRecommendations}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">აქტიური რეკომენდაციები</dt>
                    <dd className="text-lg font-medium text-gray-900">{statistics.activeRecommendations}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">სულ პასუხები</dt>
                    <dd className="text-lg font-medium text-gray-900">{statistics.totalResponses}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations List */}
        {recommendations.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">რეკომენდაციები არ არის</h3>
            <p className="text-gray-600">ჯერ არ არის შექმნილი რეკომენდაციები</p>
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
                      <span>მასწავლებელი: {recommendation.teacher.name} {recommendation.teacher.lastname}</span>
                      <span>შექმნა: {new Date(recommendation.createdAt).toLocaleDateString('ka-GE')}</span>
                      <span className={recommendation.adminResponse ? 'text-green-600 font-medium' : 'text-orange-600 font-medium'}>
                        {recommendation.adminResponse ? 'პასუხი მოცემულია' : 'პასუხი არ არის'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startResponse(recommendation.id, recommendation.adminResponse?.response)}
                      className="text-green-600 hover:text-green-800 text-sm font-medium"
                    >
                      {recommendation.adminResponse ? 'პასუხის რედაქტირება' : 'პასუხის მიცემა'}
                    </button>
                    <button
                      onClick={() => handleDeleteRecommendation(recommendation.id)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      წაშლა
                    </button>
                  </div>
                </div>

                {/* Admin Response */}
                {respondingTo === recommendation.id && (
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">ადმინის პასუხი მასწავლებელს:</h4>
                    <div className="space-y-3">
                      <textarea
                        value={responseText}
                        onChange={(e) => setResponseText(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        rows={4}
                        placeholder="შეიყვანეთ პასუხი მასწავლებელს..."
                      />
                      <div className="flex justify-end space-x-3">
                        <button
                          onClick={cancelResponse}
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md"
                        >
                          გაუქმება
                        </button>
                        <button
                          onClick={() => handleResponseSubmit(recommendation.id)}
                          disabled={savingResponse}
                          className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-green-400 rounded-md"
                        >
                          {savingResponse ? 'მიმდინარეობს...' : 'პასუხის გაგზავნა'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Existing Admin Response */}
                {recommendation.adminResponse && (
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">ადმინის პასუხი:</h4>
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">
                            {recommendation.adminResponse.admin.name} {recommendation.adminResponse.admin.lastname}
                          </span>
                          <span className="text-xs text-gray-500">ადმინი</span>
                        </div>
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
    </div>
  )
}

export default function AdminRecommendationsPage() {
  return (
    <AdminOnly>
      <AdminRecommendationsContent />
    </AdminOnly>
  )
}
