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

interface Question {
  id: string
  order: number
  points: number
  question: {
    id: string
    text: string
    type: string
    options?: any
    correctAnswer?: any
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
  const { user } = useAuth()
  const params = useParams()
  const router = useRouter()
  const [test, setTest] = useState<Test | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id && params.studentId) {
      fetchTestReview()
    }
  }, [params.id, params.studentId])

  const fetchTestReview = async () => {
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
  }

  const getAnswerForQuestion = (questionId: string) => {
    if (!test?.result.answers) return null
    return test.result.answers.find(answer => answer.questionId === questionId)
  }

  const isAnswerCorrect = (question: Question, answer: any) => {
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
              <h2 className="text-lg font-medium text-gray-900">
                კითხვები და პასუხები ({test.questions.length})
              </h2>
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
                    {question.question.type === 'multiple_choice' && question.question.options && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">ვარიანტები:</h4>
                        <div className="space-y-2">
                          {Object.entries(question.question.options).map(([key, value]) => (
                            <div key={key} className={`p-2 rounded border ${
                              answer?.selectedOption === key
                                ? isCorrect
                                  ? 'bg-green-50 border-green-200'
                                  : 'bg-red-50 border-red-200'
                                : question.question.correctAnswer === key
                                  ? 'bg-blue-50 border-blue-200'
                                  : 'bg-gray-50 border-gray-200'
                            }`}>
                              <span className={`font-medium ${
                                answer?.selectedOption === key
                                  ? isCorrect
                                    ? 'text-green-800'
                                    : 'text-red-800'
                                  : question.question.correctAnswer === key
                                    ? 'text-blue-800'
                                    : 'text-gray-800'
                              }`}>
                                {key}:
                              </span>
                              <span className={`ml-2 ${
                                answer?.selectedOption === key
                                  ? isCorrect
                                    ? 'text-green-700'
                                    : 'text-red-700'
                                  : question.question.correctAnswer === key
                                    ? 'text-blue-700'
                                    : 'text-gray-700'
                              }`}>
                                {value as string}
                              </span>
                              {answer?.selectedOption === key && (
                                <span className="ml-2 text-sm font-medium">
                                  {isCorrect ? '✓ სწორი პასუხი' : '✗ მოსწავლის პასუხი'}
                                </span>
                              )}
                              {question.question.correctAnswer === key && answer?.selectedOption !== key && (
                                <span className="ml-2 text-sm font-medium text-blue-600">
                                  ✓ სწორი პასუხი
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Student's Answer */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">მოსწავლის პასუხი:</h4>
                      <div className="p-3 bg-gray-50 rounded border">
                        {answer ? (
                          <p className="text-gray-900">{answer.text || answer.selectedOption || 'პასუხი არ არის'}</p>
                        ) : (
                          <p className="text-gray-500 italic">პასუხი არ არის</p>
                        )}
                      </div>
                    </div>

                    {/* Explanation */}
                    {(question.question.content || question.question.rubric) && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">განმარტება:</h4>
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
