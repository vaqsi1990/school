'use client'

import { useAuth } from '@/hooks/useAuth'
import { TeacherOnly } from '@/components/auth/ProtectedRoute'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

interface Student {
  id: string
  name: string
  lastname: string
  grade: number
  school: string
  code: string
}

interface TestResult {
  id: string
  student: Student
  score?: number
  status: string
  completedAt?: string
  answers: any[]
}

interface Test {
  id: string
  title: string
  description?: string
  subject: {
    id: string
    name: string
  }
  class: {
    id: string
    name: string
    students: Array<{
      student: Student
    }>
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
  results: TestResult[]
}

function TestResultsContent() {
  const { user } = useAuth()
  const params = useParams()
  const router = useRouter()
  const [test, setTest] = useState<Test | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchTestResults()
    }
  }, [params.id])

  const fetchTestResults = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/teacher/class-tests/${params.id}/results`)
      
      if (response.ok) {
        const data = await response.json()
        setTest(data.test)
      } else {
        console.error('Failed to fetch test results')
        router.push('/teacher/classes')
      }
    } catch (error) {
      console.error('Error fetching test results:', error)
      router.push('/teacher/classes')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800'
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800'
      case 'NOT_STARTED':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'დასრულებული'
      case 'IN_PROGRESS':
        return 'მიმდინარე'
      case 'NOT_STARTED':
        return 'არ დაწყებულა'
      default:
        return 'უცნობი'
    }
  }

  const calculateAverageScore = () => {
    if (!test?.results.length) return 0
    const completedResults = test.results.filter(r => r.status === 'COMPLETED' && r.score !== null)
    if (!completedResults.length) return 0
    const totalScore = completedResults.reduce((sum, r) => sum + (r.score || 0), 0)
    return Math.round(totalScore / completedResults.length)
  }

  const getCompletionRate = () => {
    if (!test?.class.students.length) return 0
    const completedCount = test.results.filter(r => r.status === 'COMPLETED').length
    return Math.round((completedCount / test.class.students.length) * 100)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">ტესტის შედეგების ჩატვირთვა...</p>
        </div>
      </div>
    )
  }

  if (!test) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">ტესტი ვერ მოიძებნა</p>
          <Link href="/teacher/classes" className="text-blue-600 hover:text-blue-800 mt-2 inline-block">
            კლასების სიაში დაბრუნება
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <Link href="/teacher/classes" className="text-blue-600 hover:text-blue-800 mb-2 inline-block">
                ← კლასების სიაში დაბრუნება
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">{test.title}</h1>
              <p className="mt-2 text-gray-600">{test.subject.name} - {test.class.name}</p>
              {test.description && (
                <p className="mt-1 text-gray-500">{test.description}</p>
              )}
            </div>
            <div className="flex items-center gap-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                test.isActive 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {test.isActive ? 'აქტიური' : 'არააქტიური'}
              </span>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-sm font-medium text-gray-500">მოსწავლეები</div>
              <div className="text-2xl font-bold text-gray-900">{test.class.students.length}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-sm font-medium text-gray-500">დასრულებული</div>
              <div className="text-2xl font-bold text-green-600">
                {test.results.filter(r => r.status === 'COMPLETED').length}
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-sm font-medium text-gray-500">დასრულების %</div>
              <div className="text-2xl font-bold text-blue-600">{getCompletionRate()}%</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-sm font-medium text-gray-500">საშუალო ქულა</div>
              <div className="text-2xl font-bold text-purple-600">{calculateAverageScore()}</div>
            </div>
          </div>

          {/* Test Details */}
          <div className="bg-white shadow rounded-lg mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">ტესტის დეტალები</h2>
            </div>
            <div className="px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-500">კითხვების რაოდენობა:</span>
                  <span className="ml-2 text-gray-900">{test.questions.length}</span>
                </div>
                {test.duration && (
                  <div>
                    <span className="font-medium text-gray-500">ხანგრძლივობა:</span>
                    <span className="ml-2 text-gray-900">{test.duration} წუთი</span>
                  </div>
                )}
                <div>
                  <span className="font-medium text-gray-500">შექმნის თარიღი:</span>
                  <span className="ml-2 text-gray-900">
                    {new Date(test.createdAt).toLocaleDateString('ka-GE')}
                  </span>
                </div>
                {test.startDate && (
                  <div>
                    <span className="font-medium text-gray-500">დაწყების თარიღი:</span>
                    <span className="ml-2 text-gray-900">
                      {new Date(test.startDate).toLocaleDateString('ka-GE')}
                    </span>
                  </div>
                )}
                {test.endDate && (
                  <div>
                    <span className="font-medium text-gray-500">დასრულების თარიღი:</span>
                    <span className="ml-2 text-gray-900">
                      {new Date(test.endDate).toLocaleDateString('ka-GE')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Students Results */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                მოსწავლეების შედეგები ({test.results.length})
              </h2>
            </div>
            <div className="px-6 py-4">
              {test.results.length === 0 ? (
                <div className="text-center py-8">
                  <div className="mx-auto h-16 w-16 text-gray-400">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">შედეგები არ არის</h3>
                  <p className="mt-1 text-sm text-gray-500">მოსწავლეებმა ჯერ არ დაწყეს ტესტი</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          მოსწავლე
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          სტატუსი
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ქულა
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          დასრულების თარიღი
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          სკოლა
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          მოქმედება
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {test.results.map((result) => (
                        <tr key={result.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {result.student.name} {result.student.lastname}
                            </div>
                            <div className="text-sm text-gray-500">
                              {result.student.grade} კლასი - {result.student.code}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(result.status)}`}>
                              {getStatusText(result.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {result.score !== null ? result.score : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {result.completedAt 
                              ? new Date(result.completedAt).toLocaleDateString('ka-GE')
                              : '-'
                            }
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {result.student.school}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {result.status === 'COMPLETED' ? (
                              <Link
                                href={`/teacher/class-tests/${test.id}/review/${result.student.id}`}
                                className="text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-md text-sm font-medium transition-colors"
                              >
                                გასწორება
                              </Link>
                            ) : (
                              <span className="text-gray-400 text-sm">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function TestResultsPage() {
  return (
    <TeacherOnly>
      <TestResultsContent />
    </TeacherOnly>
  )
}
