'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface Teacher {
  id: string
  name: string
  lastname: string
}

interface RecommendationResponse {
  id: string
  response: string
  createdAt: string
}

interface Recommendation {
  id: string
  title: string
  content: string
  createdAt: string
  teacher: Teacher
  responses: RecommendationResponse[]
}

function StudentRecommendationsContent() {
  const { data: session } = useSession()
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [respondingTo, setRespondingTo] = useState<string | null>(null)
  const [responseText, setResponseText] = useState('')
  const [savingResponse, setSavingResponse] = useState(false)

  useEffect(() => {
    if (session?.user) {
      fetchRecommendations()
    }
  }, [session])

  const fetchRecommendations = async () => {
    try {
      const response = await fetch('/api/student/recommendations')
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

  const handleResponseSubmit = async (recommendationId: string) => {
    if (!responseText.trim()) {
      alert('შეიყვანეთ პასუხი')
      return
    }

    setSavingResponse(true)
    try {
      const response = await fetch(`/api/student/recommendations/${recommendationId}/response`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ response: responseText }),
      })

      if (response.ok) {
        await fetchRecommendations()
        setRespondingTo(null)
        setResponseText('')
        alert('პასუხი წარმატებით შეინახა!')
      } else {
        const errorData = await response.json()
        alert(`შეცდომა: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error saving response:', error)
      alert('შეცდომა პასუხის შენახვისას')
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">რეკომენდაციები</h1>
          <p className="text-gray-600 mt-2">მასწავლებლების რეკომენდაციები და თქვენი პასუხები</p>
        </div>

        {recommendations.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">რეკომენდაციები არ არის</h3>
            <p className="text-gray-600">ჯერ არ არის მიღებული რეკომენდაციები</p>
          </div>
        ) : (
          <div className="space-y-6">
            {recommendations.map((recommendation) => {
              const hasResponse = recommendation.responses.length > 0
              const myResponse = recommendation.responses[0]

              return (
                <div key={recommendation.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{recommendation.title}</h3>
                      <span className="text-sm text-gray-500">
                        {new Date(recommendation.createdAt).toLocaleDateString('ka-GE')}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                      <span>მასწავლებელი: {recommendation.teacher.name} {recommendation.teacher.lastname}</span>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{recommendation.content}</p>
                  </div>

                  {/* Response Section */}
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-lg font-medium text-gray-900">თქვენი პასუხი</h4>
                      {!hasResponse && (
                        <span className="text-sm text-orange-600 font-medium">პასუხი არ არის</span>
                      )}
                      {hasResponse && (
                        <span className="text-sm text-green-600 font-medium">პასუხი მოცემულია</span>
                      )}
                    </div>

                    {respondingTo === recommendation.id ? (
                      <div className="space-y-3">
                        <textarea
                          value={responseText}
                          onChange={(e) => setResponseText(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows={4}
                          placeholder="შეიყვანეთ თქვენი პასუხი..."
                        />
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={cancelResponse}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md"
                          >
                            გაუქმება
                          </button>
                          <button
                            onClick={() => handleResponseSubmit(recommendation.id)}
                            disabled={savingResponse}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:bg-gray-400"
                          >
                            {savingResponse ? 'შენახვა...' : 'შენახვა'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {hasResponse && myResponse && (
                          <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-sm font-medium text-green-800">თქვენი პასუხი:</span>
                              <span className="text-xs text-green-600">
                                {new Date(myResponse.createdAt).toLocaleDateString('ka-GE')}
                              </span>
                            </div>
                            <p className="text-green-900">{myResponse.response}</p>
                          </div>
                        )}
                        
                        <div className="flex justify-end">
                          <button
                            onClick={() => startResponse(recommendation.id, myResponse?.response)}
                            className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-md"
                          >
                            {hasResponse ? 'პასუხის რედაქტირება' : 'პასუხის მიცემა'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default function StudentRecommendationsPage() {
  return <StudentRecommendationsContent />
}
