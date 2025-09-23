'use client'

import React, { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import TestModal from '@/components/TestModal'

interface Question {
  id: string
  text: string
  type: string
  options: string[]
  correctAnswer?: string
  points: number
  image: string[]
  content?: string
  matchingPairs?: Record<string, string>
  leftSide?: string[]
  rightSide?: string[]
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
  const [showTestModal, setShowTestModal] = useState(false)
  const [shuffledOptions, setShuffledOptions] = useState<Record<string, string[]>>({})

  const grades = [7, 8, 9, 10, 11, 12]

  // Map subject IDs to names
  const subjectMapping: Record<string, string> = {
    'math': 'მათემატიკა',
    'physics': 'ფიზიკა',
    'chemistry': 'ქიმია',
    'biology': 'ბიოლოგია',
    'history': 'ისტორია',
    'geography': 'გეოგრაფია',
    'georgian': 'ქართული ენა',
    'english': 'ინგლისური ენა',
    'eeg': 'ერთიანი ეროვნული გამოცდები'
  }

  const subjectName = subjectMapping[subjectId]

  // Function to shuffle array
  const shuffleArray = (array: string[]) => {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  // Function to create shuffled options for all questions
  const createShuffledOptions = (questions: Question[]) => {
    const shuffled: Record<string, string[]> = {}
    
    questions.forEach(question => {
      // Shuffle options for CLOSED_ENDED questions
      if (question.type === 'CLOSED_ENDED' && question.options) {
        shuffled[question.id] = shuffleArray(question.options)
      }
      
      // Shuffle image options for CLOSED_ENDED questions
      if (question.type === 'CLOSED_ENDED' && question.imageOptions) {
        const filteredImageOptions = question.imageOptions.filter(img => img && img.trim() !== '')
        if (filteredImageOptions.length > 0) {
          shuffled[`${question.id}_images`] = shuffleArray(filteredImageOptions)
        }
      }
    })
    
    return shuffled
  }

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
        
        if (!data.questions || data.questions.length === 0) {
          alert('ამ საგნისა და კლასისთვის კითხვები ჯერ არ არის დამატებული')
          return
        }
        
        setQuestions(data.questions || [])
        setTotalQuestions(data.totalQuestions || 0)
        
        // Create shuffled options for questions
        const shuffled = createShuffledOptions(data.questions || [])
        setShuffledOptions(shuffled)
        
        setTestStarted(true)
        setCurrentQuestionIndex(0)
        setUserAnswers({})
        setShowResults(false)
        setShowTestModal(true) // Show test in modal
      } else {
        const errorData = await response.json()
        console.error('API Error:', errorData)
        alert(`ტესტის ჩატვირთვა ვერ მოხერხდა: ${errorData.error || 'უცნობი შეცდომა'}`)
      }
    } catch (error) {
      console.error('Error starting test:', error)
      alert('ტესტის ჩატვირთვა ვერ მოხერხდა')
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
    setShowResults(true) // Show results in modal
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
    setShuffledOptions({})
    setShowTestModal(false) // Close modal when resetting
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
              {isLoading ? 'ტესტის ჩატვირთვა...' : 'ტესტის დაწყება'}
            </button>
          </div>
        </div>
      </div>

      {/* Test Modal */}
      <TestModal
        isOpen={showTestModal}
        onClose={() => setShowTestModal(false)}
        questions={questions}
        currentQuestionIndex={currentQuestionIndex}
        userAnswers={userAnswers}
        onAnswerChange={handleAnswerChange}
        onNextQuestion={nextQuestion}
        onPreviousQuestion={previousQuestion}
        onFinishTest={finishTest}
        isLoading={isLoading}
        showResults={showResults}
        score={score}
        totalQuestions={totalQuestions}
        onResetTest={resetTest}
        shuffledOptions={shuffledOptions}
      />
    </div>
  )
}

export default TestSubjectPage
