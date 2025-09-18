'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

interface Question {
  id: string
  text: string
  type: string
  options: string[]
  correctAnswer?: string
  points: number
  image: string[]
  content?: string
  matchingPairs?: any
  leftSide?: any
  rightSide?: any
  imageOptions?: string[]
  subject: string
  grade: number
}

const TestSubjectPage = () => {
  const params = useParams()
  const router = useRouter()
  const subjectId = params.subjectId as string
  
  const [selectedGrade, setSelectedGrade] = useState<string>('')
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({})
  const [showResults, setShowResults] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [testStarted, setTestStarted] = useState(false)
  const [score, setScore] = useState(0)
  const [totalQuestions, setTotalQuestions] = useState(0)

  const grades = [7, 8, 9, 10, 11, 12]

  // Map subject IDs to names
  const subjectMapping: Record<string, string> = {
    'history': 'ისტორია',
    'geography': 'გეოგრაფია',
    'georgian': 'ქართული ენა',
    'biology': 'ბიოლოგია'
  }

  const subjectName = subjectMapping[subjectId]

  const startTest = async () => {
    if (!selectedGrade) {
      alert('გთხოვთ აირჩიოთ კლასი')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(
        `/api/test/public-questions?subjectId=${subjectId}&grade=${selectedGrade}`
      )
      
      if (response.ok) {
        const data = await response.json()
        console.log('API Response:', data)
        setQuestions(data.questions || [])
        setTotalQuestions(data.totalQuestions || 0)
        setTestStarted(true)
        setCurrentQuestionIndex(0)
        setUserAnswers({})
        setShowResults(false)
      } else {
        const errorData = await response.json()
        console.error('API Error:', errorData)
        alert(`ტესტის ჩატვა ვერ მოხერხდა: ${errorData.error || 'უცნობი შეცდომა'}`)
      }
    } catch (error) {
      console.error('Error starting test:', error)
      alert('ტესტის ჩატვა ვერ მოხერხდა')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAnswerChange = (questionId: string, answer: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }))
  }

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      finishTest()
    }
  }

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const finishTest = async () => {
    // Calculate score
    let correctAnswers = 0
    questions.forEach(question => {
      const userAnswer = userAnswers[question.id]
      if (userAnswer) {
        if (question.type === 'CLOSED_ENDED' && question.correctAnswer) {
          // For closed-ended questions, compare with correct answer
          if (userAnswer === question.correctAnswer) {
            correctAnswers++
          }
        } else {
          // For other question types, count as correct if answered (since we can't auto-score them)
          correctAnswers++
        }
      }
    })

    const calculatedScore = Math.round((correctAnswers / questions.length) * 100)
    setScore(calculatedScore)
    setShowResults(true)
  }

  const resetTest = () => {
    setTestStarted(false)
    setSelectedGrade('')
    setQuestions([])
    setCurrentQuestionIndex(0)
    setUserAnswers({})
    setShowResults(false)
    setScore(0)
    setTotalQuestions(0)
  }

  const renderQuestion = (question: Question) => {
    const userAnswer = userAnswers[question.id] || ''

    switch (question.type) {
      case 'CLOSED_ENDED':
        return (
          <div className="space-y-4 text-black">
            <p className="text-lg font-medium">{question.text}</p>
            {question.options.map((option, index) => (
              <label key={index} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={option}
                  checked={userAnswer === option}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  className="w-4 h-4"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        )

      case 'MATCHING':
        return (
          <div className="space-y-4 text-black">
            <p className="text-lg font-medium">{question.text}</p>
            {question.leftSide && question.rightSide && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">მარცხენა მხარე:</h4>
                  {question.leftSide.map((item: any, index: number) => (
                    <div key={index} className="p-2 border rounded mb-2">
                      {item}
                    </div>
                  ))}
                </div>
                <div>
                  <h4 className="font-medium mb-2">მარჯვენა მხარე:</h4>
                  {question.rightSide.map((item: any, index: number) => (
                    <div key={index} className="p-2 border rounded mb-2">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )

      default:
        return (
          <div className="space-y-4 text-black">
            <p className="text-lg font-medium">{question.text}</p>
            <textarea
              value={userAnswer}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              className="w-full p-3 border rounded-lg"
              rows={4}
              placeholder="შეიყვანეთ თქვენი პასუხი..."
            />
          </div>
        )
    }
  }

  const getResultMessage = (score: number) => {
    if (score >= 80) {
      return "გილოცავ! ამ შედეგით შენ გაქვს შანსი გამარჯვების!"
    } else if (score >= 60) {
      return "კარგი შედეგია! კიდევ ცოტა ვარჯიში და უკეთესი შედეგი მიიღებ."
    } else if (score >= 40) {
      return "საშუალო შედეგია. რეკომენდებულია მეტი ვარჯიში."
    } else {
      return "შედეგი საშუალოზე დაბალია. რეკომენდებულია მეტი ვარჯიში და მომზადება."
    }
  }

  if (!subjectName) {
    return (
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <h1 className="text-2xl font-bold text-black mb-4">არასწორი საგანი</h1>
            <button
              onClick={() => router.push('/')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              მთავარ გვერდზე დაბრუნება
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (showResults) {
    return (
      <div className="bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-gray-50 rounded-lg shadow-lg p-8 text-center">
            <h1 className="text-3xl font-bold text-black mb-6">ტესტის შედეგები</h1>
            
            <div className="mb-8">
              <div className="text-6xl font-bold text-blue-600 mb-4">{score}%</div>
              <p className="text-xl text-black mb-4">
                სწორი პასუხები: {Math.round((score / 100) * totalQuestions)} / {totalQuestions}
              </p>
              <p className="text-lg text-black">{getResultMessage(score)}</p>
            </div>

            <div className="flex justify-center space-x-4">
              <button
                onClick={resetTest}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                ახალი ტესტი
              </button>
              <button
                onClick={() => router.push('/')}
                className="bg-gray-600 text-white px-8 py-3 rounded-lg hover:bg-gray-700 transition-colors"
              >
                მთავარ გვერდზე
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (testStarted && questions.length > 0) {
    const currentQuestion = questions[currentQuestionIndex]
    
    return (
      <div className="bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-gray-50 rounded-lg shadow-lg p-8">
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-black">
                  {currentQuestion.subject} - მე-{currentQuestion.grade} კლასი
                </h1>
                <span className="text-lg text-black">
                  კითხვა {currentQuestionIndex + 1} / {questions.length}
                </span>
              </div>
              <div className="w-full bg-white rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="mb-8">
              {renderQuestion(currentQuestion)}
            </div>

            <div className="flex justify-between">
              <button
                onClick={previousQuestion}
                disabled={currentQuestionIndex === 0}
                className="px-6 py-2 bg-black text-white rounded-lg disabled:cursor-not-allowed transition-colors"
              >
                წინა
              </button>
              
              <button
                onClick={nextQuestion}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {currentQuestionIndex === questions.length - 1 ? 'დასრულება' : 'შემდეგი'}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <button
            onClick={() => router.push('/')}
            className="text-blue-600 hover:text-blue-800 mb-4 text-left"
          >
            ← უკან საგნების არჩევაზე
          </button>
          <h1 className="text-4xl font-bold text-black mb-4">{subjectName}</h1>
          <p className="text-xl text-black">აირჩიე კლასი, რომ დაიწყო ტესტი</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="grid grid-cols-1 gap-4 max-w-md mx-auto">
            {grades.map((grade) => (
              <button
                key={grade}
                onClick={() => setSelectedGrade(grade.toString())}
                className={`w-full p-4 text-center rounded-lg border-2 transition-colors ${
                  selectedGrade === grade.toString()
                    ? 'border-black bg-gradient-to-r from-orange-500 to-orange-600 text-white'
                    : 'border-black bg-white hover:bg-gray-50'
                }`}
              >
                <span className="font-medium text-black">მე-{grade} კლასი</span>
              </button>
            ))}
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={startTest}
              disabled={!selectedGrade || isLoading}
              className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-medium disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
            >
              {isLoading ? 'ტესტის ჩატვა...' : 'ტესტის დაწყება'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TestSubjectPage
