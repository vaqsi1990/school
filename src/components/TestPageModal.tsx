'use client'

import React, { useState, useEffect } from 'react'
import TestModal from './TestModal'

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

interface TestPageModalProps {
  isOpen: boolean
  onClose: () => void
  subjectId: string
}

const TestPageModal: React.FC<TestPageModalProps> = ({ isOpen, onClose, subjectId }) => {
  const [selectedGrade, setSelectedGrade] = useState('')
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({})
  const [showResults, setShowResults] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [testStarted, setTestStarted] = useState(false)
  const [score, setScore] = useState(0)
  const [totalQuestions, setTotalQuestions] = useState(0)
  const [showTestModal, setShowTestModal] = useState(false)

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

  const startTest = async () => {
    if (!selectedGrade) {
      alert('გთხოვთ აირჩიოთ კლასი')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/test/public-questions?subjectId=${subjectId}&grade=${selectedGrade}`)
      
      if (response.ok) {
        const data = await response.json()
        
        if (!data.questions || data.questions.length === 0) {
          alert('ამ საგნისა და კლასისთვის კითხვები ჯერ არ არის დამატებული')
          return
        }
        
        setQuestions(data.questions || [])
        setTotalQuestions(data.totalQuestions || 0)
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
    }
  }

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const finishTest = () => {
    let correctAnswers = 0
    
    questions.forEach(question => {
      const userAnswer = userAnswers[question.id]
      if (userAnswer && userAnswer === question.correctAnswer) {
        correctAnswers++
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
    setShowTestModal(false) // Close modal when resetting
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Transparent background overlay */}
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      
      {/* Modal content */}
      <div className="relative bg-white rounded-lg shadow-xl p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold z-10"
        >
          ×
        </button>
        
        {/* Modal content */}
        <div className="pr-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-black mb-4">
              {subjectName} 
            </h1>
            <p className="text-black text-[16px]">
              აირჩიე კლასი და დაიწყე ტესტი
            </p>
          </div>

          {/* Grade Selection */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-black mb-4">კლასის არჩევა:</h2>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
              {grades.map((grade) => (
                <button
                  key={grade}
                  onClick={() => setSelectedGrade(grade.toString())}
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    selectedGrade === grade.toString()
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400 text-gray-700'
                  }`}
                >
                  მე-{grade}
                </button>
              ))}
            </div>
          </div>

          {/* Start Test Button */}
          <div className="text-center">
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
      />
    </div>
  )
}

export default TestPageModal
