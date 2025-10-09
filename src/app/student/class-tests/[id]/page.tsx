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
  studentResult?: {
    id: string
    score?: number
    totalPoints?: number
    status: string
    completedAt?: string
    answers?: Record<string, string | number | boolean>
  } | null
}

export default function StudentClassTestPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession()
  const router = useRouter()
  const [test, setTest] = useState<ClassTest | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [testStarted, setTestStarted] = useState(false)

  useEffect(() => {
    if (session?.user) {
      fetchTest()
    }
  }, [session, params.id])

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    
    if (testStarted && test?.duration && timeLeft !== null) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev === null || prev <= 0) {
            handleSubmit()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [testStarted, test?.duration, timeLeft])

  const fetchTest = async () => {
    try {
      const response = await fetch(`/api/student/class-tests/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setTest(data.test)
        
        // Initialize answers if test was already started
        if (data.test.studentResult?.answers) {
          setAnswers(data.test.studentResult.answers)
        }
        
        // Initialize timer if test has duration
        if (data.test.duration && !data.test.studentResult) {
          setTimeLeft(data.test.duration * 60) // Convert minutes to seconds
        }
      } else {
        const error = await response.json()
        alert(error.error || 'ტესტი არ მოიძებნა')
        router.push('/student/class-tests')
      }
    } catch (error) {
      console.error('Error fetching test:', error)
      router.push('/student/class-tests')
    } finally {
      setLoading(false)
    }
  }

  const startTest = () => {
    setTestStarted(true)
  }

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }))
  }

  const handleSubmit = async () => {
    if (!test) return

    setSubmitting(true)
    try {
      const response = await fetch(`/api/student/class-tests/${test.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ answers })
      })

      if (response.ok) {
        const data = await response.json()
        setTest(prev => prev ? {
          ...prev,
          studentResult: data.result
        } : null)
        alert('ტესტი წარმატებით დასრულდა!')
      } else {
        const error = await response.json()
        alert(error.error || 'შეცდომა ტესტის გაგზავნისას')
      }
    } catch (error) {
      console.error('Error submitting test:', error)
      alert('შეცდომა ტესტის გაგზავნისას')
    } finally {
      setSubmitting(false)
    }
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
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
            onClick={() => router.push('/student/class-tests')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            უკან დაბრუნება
          </button>
        </div>
      </div>
    )
  }

  const isCompleted = test.studentResult?.status === 'COMPLETED'

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{test.title}</h1>
              <p className="text-gray-600 mb-4">{test.description}</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="bg-white p-3 rounded-lg border">
                  <div className="text-gray-500">საგანი</div>
                  <div className="font-medium">{test.subject.name}</div>
                </div>
                <div className="bg-white p-3 rounded-lg border">
                  <div className="text-gray-500">მასწავლებელი</div>
                  <div className="font-medium">{test.teacher.name} {test.teacher.lastname}</div>
                </div>
                <div className="bg-white p-3 rounded-lg border">
                  <div className="text-gray-500">კითხვები</div>
                  <div className="font-medium">{test.questions.length}</div>
                </div>
                {test.duration && (
                  <div className="bg-white p-3 rounded-lg border">
                    <div className="text-gray-500">ხანგრძლივობა</div>
                    <div className="font-medium">{test.duration} წუთი</div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Timer */}
            {testStarted && timeLeft !== null && !isCompleted && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="text-red-800 font-medium text-lg">
                  {formatTime(timeLeft)}
                </div>
                <div className="text-red-600 text-sm">დარჩენილი დრო</div>
              </div>
            )}

            {/* Results */}
            {isCompleted && test.studentResult && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="text-green-800 font-medium text-lg">
                  {test.studentResult.score}/{test.studentResult.totalPoints}
                </div>
                <div className="text-green-600 text-sm">ქულა</div>
              </div>
            )}
          </div>
        </div>

        {/* Test Content */}
        {!testStarted && !isCompleted ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <div className="text-gray-400 text-6xl mb-4">📝</div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">ტესტის დაწყება</h2>
            <p className="text-gray-600 mb-6">
              ტესტი შეიცავს {test.questions.length} კითხვას
              {test.duration && ` და გაგრძელდება ${test.duration} წუთი`}
            </p>
            <button
              onClick={startTest}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              ტესტის დაწყება
            </button>
          </div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-6">
            {test.questions.map((testQuestion, index) => (
              <div key={testQuestion.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
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

                {testQuestion.question.type === 'CLOSED_ENDED' && testQuestion.question.options ? (
                  <div className="space-y-2">
                    {testQuestion.question.options.map((option, optionIndex) => (
                      <label key={optionIndex} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name={`question-${testQuestion.question.id}`}
                          value={option}
                          checked={answers[testQuestion.question.id] === option}
                          onChange={(e) => handleAnswerChange(testQuestion.question.id, e.target.value)}
                          disabled={isCompleted}
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <span className="text-gray-700">
                          {String.fromCharCode(65 + optionIndex)}. {option}
                        </span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <textarea
                    value={answers[testQuestion.question.id] || ''}
                    onChange={(e) => handleAnswerChange(testQuestion.question.id, e.target.value)}
                    disabled={isCompleted}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                    placeholder="შეიყვანეთ თქვენი პასუხი..."
                  />
                )}
              </div>
            ))}

            {!isCompleted && (
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {submitting ? 'იგზავნება...' : 'ტესტის დასრულება'}
                </button>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  )
}
