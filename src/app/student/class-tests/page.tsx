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
  teacher: {
    id: string
    name: string
    lastname: string
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
  studentResult?: {
    id: string
    score?: number
    totalPoints?: number
    status: string
    completedAt?: string
  } | null
}

export default function StudentClassTestsPage() {
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
      const response = await fetch('/api/student/class-tests')
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

  const isTestAvailable = (test: ClassTest) => {
    if (!test.isActive) return false
    if (test.startDate && new Date() < new Date(test.startDate)) return false
    if (test.endDate && new Date() > new Date(test.endDate)) return false
    return true
  }

  const getTestStatus = (test: ClassTest) => {
    if (!test.isActive) return { status: 'inactive', text: 'არააქტიური', color: 'gray' }
    if (test.startDate && new Date() < new Date(test.startDate)) {
      return { status: 'not-started', text: 'ჯერ არ დაწყებულა', color: 'yellow' }
    }
    if (test.endDate && new Date() > new Date(test.endDate)) {
      return { status: 'ended', text: 'დასრულებული', color: 'red' }
    }
    if (test.studentResult?.status === 'COMPLETED') {
      return { status: 'completed', text: 'დასრულებული', color: 'green' }
    }
    return { status: 'available', text: 'ხელმისაწვდომი', color: 'blue' }
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
          <h1 className="text-3xl font-bold text-gray-900">კლასის ტესტები</h1>
          <p className="text-gray-600 mt-2">შეასრულეთ თქვენი კლასების ტესტები</p>
        </div>

        {tests.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">ტესტები არ არის</h3>
            <p className="text-gray-600">ჯერ არ არის ხელმისაწვდომი ტესტები</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {tests.map((test) => {
              const testStatus = getTestStatus(test)
              const isAvailable = isTestAvailable(test)
              
              return (
                <div key={test.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">{test.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          testStatus.color === 'green' ? 'bg-green-100 text-green-800' :
                          testStatus.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                          testStatus.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                          testStatus.color === 'red' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {testStatus.text}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-2">{test.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span> {test.subject.name}</span>
                        <span> {test.teacher.name} {test.teacher.lastname}</span>
                        <span> {test.questions.length} კითხვა</span>
                        {test.duration && <span>⏱️ {test.duration} წუთი</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isAvailable && test.studentResult?.status !== 'COMPLETED' ? (
                        <button
                          onClick={() => router.push(`/student/class-tests/${test.id}`)}
                          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          ტესტის დაწყება
                        </button>
                      ) : test.studentResult?.status === 'COMPLETED' ? (
                        <div className="text-right">
                          <div className="text-sm text-gray-500 mb-1">ქულა:</div>
                          <div className="text-lg font-semibold text-green-600">
                            {test.studentResult.score}/{test.studentResult.totalPoints}
                          </div>
                          <button
                            onClick={() => router.push(`/student/class-tests/${test.id}`)}
                            className="text-blue-600 hover:text-blue-700 text-sm mt-2"
                          >
                            შედეგების ნახვაას
                          </button>
                        </div>
                      ) : (
                        <div className="text-right">
                          <div className="text-sm text-gray-500">ტესტი არ არის ხელმისაწვდომი</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Time Information */}
                  {(test.startDate || test.endDate) && (
                    <div className="border-t pt-4">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        {test.startDate && (
                          <div>
                            <span className="font-medium">დაწყება:</span> {new Date(test.startDate).toLocaleString('ka-GE')}
                          </div>
                        )}
                        {test.endDate && (
                          <div>
                            <span className="font-medium">დასრულება:</span> {new Date(test.endDate).toLocaleString('ka-GE')}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
