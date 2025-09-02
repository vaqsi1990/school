'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { StudentOnly } from '@/components/auth/ProtectedRoute'

interface Question {
  id: string
  text: string
  type: 'CLOSED_ENDED' | 'MATCHING' | 'TEXT_ANALYSIS' | 'MAP_ANALYSIS' | 'OPEN_ENDED'
  options: string[]
  imageOptions?: string[]
  correctAnswer?: string
  points: number
  image?: string
  subjectId: string
  grade: number
  round: number
}

function StudentTestContent() {
  const { user } = useAuth()
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    fetchQuestions()
  }, [])

  const fetchQuestions = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/test/questions')
      if (response.ok) {
        const data = await response.json()
        setQuestions(data.questions)
      }
    } catch (error) {
      console.error('Error fetching questions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }))
  }

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    }
  }

  const handleSubmit = async () => {
    try {
      const response = await fetch('/api/student/submit-answers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answers,
          studentId: user?.student?.id
        }),
      })

      if (response.ok) {
        setSubmitted(true)
        alert('პასუხები წარმატებით გაიგზავნა!')
      }
    } catch (error) {
      console.error('Error submitting answers:', error)
      alert('შეცდომა მოხდა პასუხების გაგზავნისას')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">კითხვები იტვირთება...</p>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">გმადლობთ!</h2>
          <p className="text-gray-600">თქვენი პასუხები წარმატებით გაიგზავნა</p>
        </div>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">კითხვები არ არის ხელმისაწვდომი</p>
        </div>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]
  const currentAnswer = answers[currentQuestion.id] || ''

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              კითხვა {currentQuestionIndex + 1} / {questions.length}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {currentQuestion.text}
            </h2>
            
            {currentQuestion.image && (
              <div className="mb-4">
                <img 
                  src={currentQuestion.image} 
                  alt="Question" 
                  className="w-full max-w-md h-auto rounded-lg border border-gray-300"
                />
              </div>
            )}
          </div>

          {/* Answer Options */}
          {currentQuestion.type === 'CLOSED_ENDED' && (
            <div className="space-y-3">
              {currentQuestion.imageOptions && currentQuestion.imageOptions.length > 0 ? (
                // Image-based options
                <div className="grid grid-cols-2 gap-4">
                  {currentQuestion.imageOptions.map((imageOption, index) => (
                    imageOption && (
                      <button
                        key={index}
                        onClick={() => handleAnswer(currentQuestion.id, imageOption)}
                        className={`p-4 border-2 rounded-lg transition-all duration-200 ${
                          currentAnswer === imageOption
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <img 
                          src={imageOption} 
                          alt={`Option ${index + 1}`} 
                          className="w-full h-auto rounded"
                        />
                        <div className="mt-2 text-center">
                          <span className="text-sm font-medium text-gray-700">
                            სურათი {index + 1}
                          </span>
                        </div>
                      </button>
                    )
                  ))}
                </div>
              ) : (
                // Text-based options
                <div className="space-y-3">
                  {currentQuestion.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswer(currentQuestion.id, option)}
                      className={`w-full p-4 text-left border-2 rounded-lg transition-all duration-200 ${
                        currentAnswer === option
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <span className="font-medium text-gray-900">
                        {String.fromCharCode(65 + index)}. {option}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {currentQuestion.type === 'OPEN_ENDED' && (
            <div>
              <textarea
                value={currentAnswer}
                onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                placeholder="შეიყვანეთ თქვენი პასუხი..."
                className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
              />
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-gray-700"
          >
            წინა
          </button>

          {currentQuestionIndex === questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              დასრულება
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              შემდეგი
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function StudentTestPage() {
  return (
    <StudentOnly>
      <StudentTestContent />
    </StudentOnly>
  )
}
