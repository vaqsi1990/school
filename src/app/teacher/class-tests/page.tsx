'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface ClassTest {
  id: string
  title: string
  description?: string
  subject: {
    id: string
    name: string
  }
  isActive: boolean
  startDate?: string
  endDate?: string
  duration?: number
  createdAt: string
  questions: Array<{
    id: string
    question: {
      id: string
      text: string
      type: string
    }
  }>
  results: Array<{
    id: string
    student: {
      id: string
      name: string
      lastname: string
    }
    score?: number
    totalPoints?: number
    status: string
    completedAt?: string
  }>
}

export default function ClassTestsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [tests, setTests] = useState<ClassTest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session?.user) {
      fetchTests()
    }
  }, [session])

  const fetchTests = async () => {
    try {
      const response = await fetch('/api/teacher/class-tests')
      if (response.ok) {
        const data = await response.json()
        setTests(data.tests)
      }
    } catch (error) {
      console.error('Error fetching tests:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteTest = async (testId: string) => {
    if (!confirm('ნამდვილად გსურთ ტესტის წაშლა?')) return

    try {
      const response = await fetch(`/api/teacher/class-tests/${testId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setTests(tests.filter(test => test.id !== testId))
      } else {
        alert('შეცდომა ტესტის წაშლისას')
      }
    } catch (error) {
      console.error('Error deleting test:', error)
      alert('შეცდომა ტესტის წაშლისას')
    }
  }

  const toggleTestStatus = async (testId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/teacher/class-tests/${testId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive: !isActive })
      })
      
      if (response.ok) {
        setTests(tests.map(test => 
          test.id === testId ? { ...test, isActive: !isActive } : test
        ))
      } else {
        alert('შეცდომა ტესტის სტატუსის შეცვლისას')
      }
    } catch (error) {
      console.error('Error updating test:', error)
      alert('შეცდომა ტესტის სტატუსის შეცვლისას')
    }
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">კლასის ტესტები</h1>
            <p className="text-gray-600 mt-2">მართეთ თქვენი კლასების ტესტები</p>
          </div>
          <button
            onClick={() => router.push('/teacher/class-tests/create')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            ახალი ტესტი
          </button>
        </div>

        {tests.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">ტესტები არ არის</h3>
            <p className="text-gray-600 mb-6">ჯერ არ შექმნილია არცერთი ტესტი</p>
            <button
              onClick={() => router.push('/teacher/class-tests/create')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              შექმენი პირველი ტესტი
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {tests.map((test) => (
              <div key={test.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{test.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        test.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {test.isActive ? 'აქტიური' : 'არააქტიური'}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-2">{test.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>📚 {test.subject.name}</span>
                      <span>❓ {test.questions.length} კითხვა</span>
                      {test.duration && <span>⏱️ {test.duration} წუთი</span>}
                      <span>👥 {test.results.length} მოსწავლე</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleTestStatus(test.id, test.isActive)}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                        test.isActive
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {test.isActive ? 'გათიშე' : 'გააქტიურე'}
                    </button>
                    <button
                      onClick={() => router.push(`/teacher/class-tests/${test.id}`)}
                      className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm font-medium hover:bg-blue-200 transition-colors"
                    >
                      ნახე
                    </button>
                    <button
                      onClick={() => deleteTest(test.id)}
                      className="bg-red-100 text-red-700 px-3 py-1 rounded text-sm font-medium hover:bg-red-200 transition-colors"
                    >
                      წაშალე
                    </button>
                  </div>
                </div>

                {test.results.length > 0 && (
                  <div className="border-t pt-4">
                    <h4 className="font-medium text-gray-900 mb-3">მოსწავლეების შედეგები</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {test.results.map((result) => (
                        <div key={result.id} className="bg-gray-50 rounded-lg p-3">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-900">
                              {result.student.name} {result.student.lastname}
                            </span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              result.status === 'COMPLETED'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {result.status === 'COMPLETED' ? 'დასრულებული' : 'მიმდინარე'}
                            </span>
                          </div>
                          {result.score !== undefined && result.totalPoints && (
                            <div className="mt-2 text-sm text-gray-600">
                              ქულა: {result.score}/{result.totalPoints}
                            </div>
                          )}
                        </div>
                      ))}
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
