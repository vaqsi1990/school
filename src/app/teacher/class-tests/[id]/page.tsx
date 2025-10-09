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
  class: {
    id: string
    name: string
    students: Array<{
      student: {
        id: string
        name: string
        lastname: string
      }
    }>
  }
  isActive: boolean
  startDate?: string
  endDate?: string
  duration?: number
  createdAt: string
  questions: Array<{
    id: string
    order: number
    points: number
    question: {
      id: string
      text: string
      type: string
      options?: string[]
      correctAnswer?: string
      answerTemplate?: string
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
    answers?: Record<string, string | number | boolean>
  }>
}

export default function ClassTestDetailPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession()
  const router = useRouter()
  const [test, setTest] = useState<ClassTest | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'questions' | 'results'>('questions')

  useEffect(() => {
    if (session?.user) {
      fetchTest()
    }
  }, [session, params.id])

  const fetchTest = async () => {
    try {
      const response = await fetch(`/api/teacher/class-tests/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setTest(data.test)
      } else {
        router.push('/teacher/class-tests')
      }
    } catch (error) {
      console.error('Error fetching test:', error)
      router.push('/teacher/class-tests')
    } finally {
      setLoading(false)
    }
  }

  const toggleTestStatus = async () => {
    if (!test) return

    try {
      const response = await fetch(`/api/teacher/class-tests/${test.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive: !test.isActive })
      })
      
      if (response.ok) {
        setTest({ ...test, isActive: !test.isActive })
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

  if (!test) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">ტესტი არ მოიძებნა</h1>
          <button
            onClick={() => router.push('/teacher/class-tests')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            უკან დაბრუნება
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-700 mb-4"
          >
            ← უკან
          </button>
          
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{test.title}</h1>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  test.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {test.isActive ? 'აქტიური' : 'არააქტიური'}
                </span>
              </div>
              <p className="text-gray-600 mb-4">{test.description}</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="bg-white p-3 rounded-lg border">
                  <div className="text-gray-500">საგანი</div>
                  <div className="font-medium">{test.subject.name}</div>
                </div>
                <div className="bg-white p-3 rounded-lg border">
                  <div className="text-gray-500">კლასი</div>
                  <div className="font-medium">{test.class.name}</div>
                </div>
                <div className="bg-white p-3 rounded-lg border">
                  <div className="text-gray-500">კითხვები</div>
                  <div className="font-medium">{test.questions.length}</div>
                </div>
                <div className="bg-white p-3 rounded-lg border">
                  <div className="text-gray-500">მოსწავლეები</div>
                  <div className="font-medium">{test.class.students.length}</div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={toggleTestStatus}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  test.isActive
                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
              >
                {test.isActive ? 'გათიშე' : 'გააქტიურე'}
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('questions')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'questions'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                კითხვები ({test.questions.length})
              </button>
              <button
                onClick={() => setActiveTab('results')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'results'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                შედეგები ({test.results.length})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'questions' && (
              <div className="space-y-6">
                {test.questions.map((testQuestion, index) => (
                  <div key={testQuestion.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                          კითხვა {index + 1}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          testQuestion.question.type === 'OPEN_ENDED'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {testQuestion.question.type === 'OPEN_ENDED' ? 'ღია' : 'დახურული'}
                        </span>
                        <span className="text-sm text-gray-500">
                          {testQuestion.points} ქულა
                        </span>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-gray-900 text-lg">{testQuestion.question.text}</p>
                    </div>

                    {testQuestion.question.type === 'CLOSED_ENDED' && testQuestion.question.options && (
                      <div className="space-y-2">
                        {testQuestion.question.options.map((option, optionIndex) => (
                          <div key={optionIndex} className="flex items-center gap-3">
                            <span className="text-sm text-gray-500 w-6">
                              {String.fromCharCode(65 + optionIndex)}.
                            </span>
                            <span className={`px-3 py-2 rounded-lg text-sm ${
                              option === testQuestion.question.correctAnswer
                                ? 'bg-green-100 text-green-800 border border-green-200'
                                : 'bg-gray-50 text-gray-700'
                            }`}>
                              {option}
                              {option === testQuestion.question.correctAnswer && (
                                <span className="ml-2 text-green-600">✓</span>
                              )}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {testQuestion.question.type === 'OPEN_ENDED' && testQuestion.question.answerTemplate && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2">სწორი პასუხის შაბლონი:</h4>
                        <p className="text-gray-700">{testQuestion.question.answerTemplate}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'results' && (
              <div className="space-y-4">
                {test.results.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400 text-6xl mb-4">📊</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">შედეგები არ არის</h3>
                    <p className="text-gray-600">ჯერ არცერთმა მოსწავლემ არ დაასრულა ტესტი</p>
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
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {test.results.map((result) => (
                          <tr key={result.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {result.student.name} {result.student.lastname}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                result.status === 'COMPLETED'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {result.status === 'COMPLETED' ? 'დასრულებული' : 'მიმდინარე'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {result.score !== undefined && result.totalPoints ? (
                                <span className="font-medium">
                                  {result.score}/{result.totalPoints}
                                </span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {result.completedAt ? (
                                new Date(result.completedAt).toLocaleString('ka-GE')
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
