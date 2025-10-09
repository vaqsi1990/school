'use client'

import { useState, useEffect, use } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface TestQuestionGroup {
  id: string
  name: string
  description?: string
  subject: {
    id: string
    name: string
  }
  grade: number
  createdAt: string
  isActive: boolean
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
}

interface TestQuestion {
  id: string
  text: string
  type: string
  subject: {
    id: string
    name: string
  }
  grade: number
  createdAt: string
  isActive: boolean
}

export default function TestQuestionGroupDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { data: session } = useSession()
  const router = useRouter()
  const resolvedParams = use(params)
  const [group, setGroup] = useState<TestQuestionGroup | null>(null)
  const [availableQuestions, setAvailableQuestions] = useState<TestQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showAddQuestions, setShowAddQuestions] = useState(false)
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([])

  useEffect(() => {
    if (session?.user) {
      fetchGroup()
      fetchAvailableQuestions()
    }
  }, [session, resolvedParams.id])

  const fetchGroup = async () => {
    try {
      const response = await fetch(`/api/teacher/test-question-groups/${resolvedParams.id}`)
      if (response.ok) {
        const data = await response.json()
        setGroup(data.group)
      } else {
        router.push('/teacher/test-question-groups')
      }
    } catch (error) {
      console.error('Error fetching group:', error)
      router.push('/teacher/test-question-groups')
    } finally {
      setLoading(false)
    }
  }

  const fetchAvailableQuestions = async () => {
    try {
      const response = await fetch('/api/teacher/test-questions')
      if (response.ok) {
        const data = await response.json()
        setAvailableQuestions(data.questions)
      }
    } catch (error) {
      console.error('Error fetching questions:', error)
    }
  }

  const handleSave = async () => {
    if (!group) return

    setSaving(true)
    try {
      const response = await fetch(`/api/teacher/test-question-groups/${resolvedParams.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: group.name,
          description: group.description,
          grade: group.grade,
          questionIds: group.questions.map(q => q.question.id)
        })
      })

      if (response.ok) {
        alert('ჯგუფი წარმატებით განახლდა!')
      } else {
        const error = await response.json()
        alert(error.error || 'შეცდომა ჯგუფის განახლებისას')
      }
    } catch (error) {
      console.error('Error updating group:', error)
      alert('შეცდომა ჯგუფის განახლებისას')
    } finally {
      setSaving(false)
    }
  }

  const addQuestions = () => {
    if (selectedQuestions.length === 0) {
      alert('გთხოვთ აირჩიოთ მინიმუმ ერთი კითხვა')
      return
    }

    const newQuestions = selectedQuestions.map(questionId => {
      const question = availableQuestions.find(q => q.id === questionId)
      if (!question) return null

      return {
        id: `temp-${Date.now()}-${Math.random()}`,
        order: group!.questions.length + 1,
        points: 1,
        question: {
          id: question.id,
          text: question.text,
          type: question.type,
          options: [],
          correctAnswer: '',
          answerTemplate: ''
        }
      }
    }).filter((q): q is NonNullable<typeof q> => q !== null)

    setGroup(prev => prev ? {
      ...prev,
      questions: [...prev.questions, ...newQuestions]
    } : null)

    setSelectedQuestions([])
    setShowAddQuestions(false)
  }

  const removeQuestion = (questionId: string) => {
    setGroup(prev => prev ? {
      ...prev,
      questions: prev.questions.filter(q => q.question.id !== questionId)
    } : null)
  }

  const moveQuestion = (questionId: string, direction: 'up' | 'down') => {
    if (!group) return

    const questions = [...group.questions]
    const index = questions.findIndex(q => q.question.id === questionId)
    
    if (direction === 'up' && index > 0) {
      [questions[index], questions[index - 1]] = [questions[index - 1], questions[index]]
    } else if (direction === 'down' && index < questions.length - 1) {
      [questions[index], questions[index + 1]] = [questions[index + 1], questions[index]]
    }

    // Update order
    questions.forEach((q, i) => {
      q.order = i + 1
    })

    setGroup(prev => prev ? { ...prev, questions } : null)
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

  if (!group) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">ჯგუფი არ მოიძებნა</h1>
          <button
            onClick={() => router.push('/teacher/test-question-groups')}
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{group.name}</h1>
              <p className="text-gray-600 mb-4">{group.description}</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="bg-white p-3 rounded-lg border">
                  <div className="text-gray-500">საგანი</div>
                  <div className="font-medium">{group.subject.name}</div>
                </div>
                <div className="bg-white p-3 rounded-lg border">
                  <div className="text-gray-500">კლასი</div>
                  <div className="font-medium">{group.grade}</div>
                </div>
                <div className="bg-white p-3 rounded-lg border">
                  <div className="text-gray-500">კითხვები</div>
                  <div className="font-medium">{group.questions.length}</div>
                </div>
                <div className="bg-white p-3 rounded-lg border">
                  <div className="text-gray-500">შექმნის თარიღი</div>
                  <div className="font-medium">{new Date(group.createdAt).toLocaleDateString('ka-GE')}</div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAddQuestions(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                კითხვების დამატება
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? 'შენახვა...' : 'შენახვა'}
              </button>
            </div>
          </div>
        </div>

        {/* Questions List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">კითხვები</h2>
          
          {group.questions.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">❓</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">კითხვები არ არის</h3>
              <p className="text-gray-600 mb-6">ჯერ არ არის დამატებული კითხვები</p>
              <button
                onClick={() => setShowAddQuestions(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                კითხვების დამატება
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {group.questions.map((groupQuestion, index) => (
                <div key={groupQuestion.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        {index + 1}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        groupQuestion.question.type === 'OPEN_ENDED'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {groupQuestion.question.type === 'OPEN_ENDED' ? 'ღია' : 'დახურული'}
                      </span>
                      <span className="text-sm text-gray-500">
                        {groupQuestion.points} ქულა
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => moveQuestion(groupQuestion.question.id, 'up')}
                        disabled={index === 0}
                        className="p-1 text-gray-500 hover:text-gray-700 disabled:text-gray-300"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => moveQuestion(groupQuestion.question.id, 'down')}
                        disabled={index === group.questions.length - 1}
                        className="p-1 text-gray-500 hover:text-gray-700 disabled:text-gray-300"
                      >
                        ↓
                      </button>
                      <button
                        onClick={() => removeQuestion(groupQuestion.question.id)}
                        className="p-1 text-red-500 hover:text-red-700"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-gray-900">{groupQuestion.question.text}</p>
                  </div>

                  {groupQuestion.question.type === 'CLOSED_ENDED' && groupQuestion.question.options && (
                    <div className="space-y-1">
                      {groupQuestion.question.options.map((option, optionIndex) => (
                        <div key={optionIndex} className="flex items-center gap-2">
                          <span className="text-sm text-gray-500 w-6">
                            {String.fromCharCode(65 + optionIndex)}.
                          </span>
                          <span className={`px-2 py-1 rounded text-sm ${
                            option === groupQuestion.question.correctAnswer
                              ? 'bg-green-100 text-green-800 border border-green-200'
                              : 'bg-gray-50 text-gray-700'
                          }`}>
                            {option}
                            {option === groupQuestion.question.correctAnswer && (
                              <span className="ml-2 text-green-600">✓</span>
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Questions Modal */}
        {showAddQuestions && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">კითხვების დამატება</h2>
                  <button
                    onClick={() => setShowAddQuestions(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto mb-6">
                  {availableQuestions
                    .filter(q => !group.questions.some(gq => gq.question.id === q.id))
                    .map((question) => (
                    <div
                      key={question.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        selectedQuestions.includes(question.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => {
                        if (selectedQuestions.includes(question.id)) {
                          setSelectedQuestions(prev => prev.filter(id => id !== question.id))
                        } else {
                          setSelectedQuestions(prev => [...prev, question.id])
                        }
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              question.type === 'OPEN_ENDED'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {question.type === 'OPEN_ENDED' ? 'ღია' : 'დახურული'}
                            </span>
                            <span className="text-sm text-gray-500">
                              კლასი {question.grade}
                            </span>
                          </div>
                          <p className="text-gray-900">{question.text}</p>
                        </div>
                        <div className="ml-4">
                          {selectedQuestions.includes(question.id) ? (
                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          ) : (
                            <div className="w-6 h-6 border-2 border-gray-300 rounded-full"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {selectedQuestions.length > 0 && (
                  <div className="mb-6 p-3 bg-blue-50 rounded-lg">
                    <p className="text-blue-800 font-medium">
                      არჩეულია {selectedQuestions.length} კითხვა
                    </p>
                  </div>
                )}

                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setShowAddQuestions(false)}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    გაუქმება
                  </button>
                  <button
                    onClick={addQuestions}
                    disabled={selectedQuestions.length === 0}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    დამატება
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
