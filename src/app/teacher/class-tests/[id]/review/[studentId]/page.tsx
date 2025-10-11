'use client'

import { useAuth } from '@/hooks/useAuth'
import { TeacherOnly } from '@/components/auth/ProtectedRoute'
import { useState, useEffect, useCallback } from 'react'
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

interface Question {
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
    content?: string
    rubric?: string
  }
}

interface TestResult {
  id: string
  score?: number
  status: string
  completedAt?: string
  answers: Array<{
    questionId: string
    text?: string
    selectedOption?: string
  }>
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
  }
  student: Student
  isActive: boolean
  startDate?: string
  endDate?: string
  duration?: number
  createdAt: string
  questions: Question[]
  result: TestResult
}

function TestReviewContent() {
  const params = useParams()
  const router = useRouter()
  const [test, setTest] = useState<Test | null>(null)
  const [loading, setLoading] = useState(true)
  const [editingAnswers, setEditingAnswers] = useState<Record<string, string>>({})
  const [isEditing, setIsEditing] = useState(false)

  const fetchTestReview = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/teacher/class-tests/${params.id}/review/${params.studentId}`)
      
      if (response.ok) {
        const data = await response.json()
        setTest(data.test)
      } else {
        console.error('Failed to fetch test review')
        router.push('/teacher/classes')
      }
    } catch (error) {
      console.error('Error fetching test review:', error)
      router.push('/teacher/classes')
    } finally {
      setLoading(false)
    }
  }, [params.id, params.studentId, router])

  useEffect(() => {
    if (params.id && params.studentId) {
      fetchTestReview()
    }
  }, [params.id, params.studentId, fetchTestReview])

  const getAnswerForQuestion = (questionId: string): TestResult['answers'][0] | null => {
    if (!test?.result.answers || !Array.isArray(test.result.answers)) return null
    return test.result.answers.find(answer => answer.questionId === questionId) || null
  }

  const isAnswerCorrect = (question: Question, answer: TestResult['answers'][0] | null) => {
    if (!answer) return false
    if (question.question.type === 'multiple_choice') {
      return answer.selectedOption === question.question.correctAnswer
    }
    // Add more answer type checks as needed
    return false
  }

  const calculateScore = () => {
    if (!test?.questions.length) return 0
    let correctAnswers = 0
    test.questions.forEach(question => {
      const answer = getAnswerForQuestion(question.question.id)
      if (isAnswerCorrect(question, answer)) {
        correctAnswers++
      }
    })
    return Math.round((correctAnswers / test.questions.length) * 100)
  }

  const startEditing = () => {
    if (!test) return
    
    const initialAnswers: Record<string, string> = {}
    test.questions.forEach(question => {
      const answer = getAnswerForQuestion(question.question.id)
      initialAnswers[question.question.id] = answer?.selectedOption || answer?.text || ''
    })
    
    setEditingAnswers(initialAnswers)
    setIsEditing(true)
  }

  const cancelEditing = () => {
    setEditingAnswers({})
    setIsEditing(false)
  }

  const saveAnswers = async () => {
    if (!test) return
    
    try {
      const response = await fetch(`/api/teacher/class-tests/${test.id}/review/${test.student.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answers: editingAnswers
        })
      })
      
      if (response.ok) {
        // Refresh the test data
        await fetchTestReview()
        setIsEditing(false)
        setEditingAnswers({})
      } else {
        console.error('Failed to save answers')
      }
    } catch (error) {
      console.error('Error saving answers:', error)
    }
  }

  const updateAnswer = (questionId: string, newAnswer: string) => {
    setEditingAnswers(prev => ({
      ...prev,
      [questionId]: newAnswer
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">ტესტის გასწორების ჩატვირთვა...</p>
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
      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <Link href={`/teacher/class-tests/${test.id}/results`} className="text-blue-600 hover:text-blue-800 mb-2 inline-block">
                ← ტესტის შედეგებზე დაბრუნება
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">{test.title}</h1>
              <p className="mt-2 text-gray-600">{test.subject.name} - {test.class.name}</p>
              <p className="mt-1 text-gray-500">
                მოსწავლე: {test.student.name} {test.student.lastname} ({test.student.grade} კლასი)
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">{test.result.score || calculateScore()}%</div>
              <div className="text-sm text-gray-500">ქულა</div>
              <div className="mt-4">
                {!isEditing ? (
                  <button
                    onClick={startEditing}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    რედაქტირება
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={saveAnswers}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      შენახვა
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      გაუქმება
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Student Info */}
          <div className="bg-white shadow rounded-lg mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">მოსწავლის ინფორმაცია</h2>
            </div>
            <div className="px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-500">სახელი:</span>
                  <span className="ml-2 text-gray-900">{test.student.name} {test.student.lastname}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-500">კლასი:</span>
                  <span className="ml-2 text-gray-900">{test.student.grade} კლასი</span>
                </div>
                <div>
                  <span className="font-medium text-gray-500">კოდი:</span>
                  <span className="ml-2 text-gray-900">{test.student.code}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-500">სკოლა:</span>
                  <span className="ml-2 text-gray-900">{test.student.school}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-500">დასრულების თარიღი:</span>
                  <span className="ml-2 text-gray-900">
                    {test.result.completedAt 
                      ? new Date(test.result.completedAt).toLocaleDateString('ka-GE')
                      : '-'
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Questions and Answers */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900">
                  კითხვები და პასუხები ({test.questions.length})
                </h2>
                {isEditing && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
                    <p className="text-yellow-800 text-sm font-medium">
                      ✏️ რედაქტირების რეჟიმი - შეგიძლიათ შეცვალოთ მოსწავლის პასუხები
                    </p>
                  </div>
                )}
              </div>
            </div>
            <div className="px-6 py-4">
              {test.questions.map((question, index) => {
                const answer = getAnswerForQuestion(question.question.id)
                const isCorrect = isAnswerCorrect(question, answer)
                
                return (
                  <div key={question.id} className="mb-8 p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                            კითხვა {index + 1}
                          </span>
                          <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm font-medium">
                            {question.points} ქულა
                          </span>
                          <span className={`px-2 py-1 rounded text-sm font-medium ${
                            isCorrect 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {isCorrect ? 'სწორი' : 'არასწორი'}
                          </span>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-3">
                          {question.question.text}
                        </h3>
                      </div>
                    </div>


                    {/* Question Options (for multiple choice) */}
                    {question.question.type === 'CLOSED_ENDED' && question.question.options && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">ყველა ვარიანტი:</h4>
                        <div className="space-y-2">
                          {question.question.options.map((option, index) => {
                            const optionKey = String.fromCharCode(65 + index) // A, B, C, D
                            const isStudentAnswer = answer?.selectedOption === optionKey
                            const isCorrectAnswer = question.question.correctAnswer === optionKey
                            
                            return (
                              <div key={optionKey} className={`p-3 rounded-lg border-2 ${
                                isStudentAnswer && isCorrectAnswer
                                  ? 'bg-green-200 border-green-500'
                                  : isStudentAnswer && !isCorrectAnswer
                                    ? 'bg-red-100 border-red-400'
                                    : isCorrectAnswer
                                      ? 'bg-green-200 border-green-500'
                                      : 'bg-gray-50 border-gray-300'
                              }`}>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center">
                                    <span className={`font-bold text-lg mr-3 ${
                                      isStudentAnswer && isCorrectAnswer
                                        ? 'text-green-800'
                                        : isStudentAnswer && !isCorrectAnswer
                                          ? 'text-red-800'
                                          : isCorrectAnswer
                                            ? 'text-green-800'
                                            : 'text-gray-600'
                                    }`}>
                                      {optionKey}
                                    </span>
                                    <span className={`text-base ${
                                      isStudentAnswer && isCorrectAnswer
                                        ? 'text-green-800'
                                        : isStudentAnswer && !isCorrectAnswer
                                          ? 'text-red-800'
                                          : isCorrectAnswer
                                            ? 'text-green-800'
                                            : 'text-gray-700'
                                    }`}>
                                      {option}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {isStudentAnswer && (
                                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                                        isCorrectAnswer
                                          ? 'bg-green-200 text-green-800'
                                          : 'bg-red-200 text-red-800'
                                      }`}>
                                        {isCorrectAnswer ? '✓ მოსწავლის სწორი პასუხი' : '✗ მოსწავლის არასწორი პასუხი'}
                                      </span>
                                    )}
                                    {isCorrectAnswer && !isStudentAnswer && (
                                      <span className="px-2 py-1 rounded text-xs font-medium bg-green-200 text-green-800">
                                        ✓ სწორი პასუხი
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* Student's Answer */}
                    <div className="mb-4">
                      <h4 className="text-[20px] font-bold text-black mb-2">
                        {isEditing ? 'რედაქტირება - მოსწავლის პასუხი:' : 'მოსწავლის პასუხი:'}
                      </h4>
                      {isEditing ? (
                        <div className="space-y-3">
                          {question.question.type === 'CLOSED_ENDED' && question.question.options ? (
                            <div className="space-y-2">
                              <p className="text-sm text-gray-600 mb-2">აირჩიეთ სწორი პასუხი:</p>
                              {question.question.options.map((option, index) => {
                                const optionKey = String.fromCharCode(65 + index)
                                return (
                                  <label key={optionKey} className={`flex items-center p-3 border-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors ${
                                    editingAnswers[question.question.id] === optionKey 
                                      ? 'border-purple-400 bg-purple-50' 
                                      : 'border-gray-300'
                                  }`}>
                                    <input
                                      type="radio"
                                      name={`answer-${question.question.id}`}
                                      value={optionKey}
                                      checked={editingAnswers[question.question.id] === optionKey}
                                      onChange={(e) => updateAnswer(question.question.id, e.target.value)}
                                      className="mr-3 text-purple-600"
                                    />
                                    <span className="font-bold text-lg mr-3 text-purple-700">{optionKey}:</span>
                                    <span className="text-gray-800">{option}</span>
                                  </label>
                                )
                              })}
                            </div>
                          ) : (
                            <div>
                              <p className="text-sm text-gray-600 mb-2">შეიყვანეთ პასუხი:</p>
                              <textarea
                                value={editingAnswers[question.question.id] || ''}
                                onChange={(e) => updateAnswer(question.question.id, e.target.value)}
                                className="w-full p-3 border-2 border-purple-300 rounded-md resize-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                                rows={4}
                                placeholder="შეიყვანეთ პასუხი..."
                              />
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="p-3 bg-gray-50 rounded border">
                            {answer ? (
                              <p className="text-gray-900">
                                {answer.selectedOption || answer.text || 'პასუხი არ არის'}
                              </p>
                            ) : (
                              <p className="text-gray-500 italic">პასუხი არ არის</p>
                            )}
                          </div>
                          
                          {/* Show correct answer */}
                          {question.question.type === 'CLOSED_ENDED' && question.question.options && question.question.correctAnswer && (
                            <div className="p-3 bg-green-50 rounded border border-green-200">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <span className="font-bold text-lg mr-3 text-green-800">
                                    სწორი პასუხი:
                                  </span>
                                  <span className="text-base text-green-800">
                                    {(() => {
                                      const correctAnswer = question.question.correctAnswer
                                      console.log('Correct answer:', correctAnswer, 'Options:', question.question.options)
                                      
                                      // If correctAnswer is a letter (A, B, C, D)
                                      if (correctAnswer && correctAnswer.length === 1) {
                                        const index = correctAnswer.charCodeAt(0) - 65
                                        return question.question.options[index] || correctAnswer
                                      }
                                      
                                      // If correctAnswer is the actual text
                                      if (correctAnswer && question.question.options.includes(correctAnswer)) {
                                        return correctAnswer
                                      }
                                      
                                      // Fallback
                                      return correctAnswer || 'სწორი პასუხი არ არის მითითებული'
                                    })()}
                                  </span>
                                </div>
                                <span className="px-2 py-1 rounded text-xs font-medium bg-green-200 text-green-800">
                                  ✓ სწორი
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Explanation */}
                    {(question.question.content || question.question.rubric) && (
                      <div className="mb-4">
                        <h4 className="text-[20px] font-bold text-black mb-2">განმარტება:</h4>
                        <div className="p-3 bg-blue-50 rounded border border-blue-200">
                          {question.question.content && (
                            <p className="text-blue-900 mb-2">{question.question.content}</p>
                          )}
                          {question.question.rubric && (
                            <div>
                              <p className="text-blue-900 font-medium mb-1">შეფასების კრიტერიუმები:</p>
                              <p className="text-blue-900">{question.question.rubric}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function TestReviewPage() {
  return (
    <TeacherOnly>
      <TestReviewContent />
    </TeacherOnly>
  )
}
