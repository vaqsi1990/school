'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { StudentOnly } from '@/components/auth/ProtectedRoute'
import ImageModal from '@/components/ImageModal'

interface Question {
  id: string
  text: string
  type: 'CLOSED_ENDED' | 'MATCHING' | 'TEXT_ANALYSIS' | 'MAP_ANALYSIS' | 'OPEN_ENDED'
  options: string[]
  imageOptions?: string[]
  correctAnswer?: string
  points: number
  image?: string[]
  subjectId: string
  grade: number
  round: number
  matchingPairs?: Array<{ left: string, leftImage?: string, right: string, rightImage?: string }>
}

function StudentTestContent() {
  const { user } = useAuth()
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string | Record<string, string>>>({})
  const [loading, setLoading] = useState(true)
  const [submitted, setSubmitted] = useState(false)
  const [shuffledOptions, setShuffledOptions] = useState<Record<string, string[]>>({})

  // Function to shuffle array
  const shuffleArray = (array: string[]) => {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  // Function to shuffle matching pairs right side
  const shuffleMatchingPairs = (pairs: Array<{ left: string, leftImage?: string, right: string, rightImage?: string }>) => {
    const rightSide = pairs.map(pair => ({ right: pair.right, rightImage: pair.rightImage }))
    const shuffledRightSide = [...rightSide]
    for (let i = shuffledRightSide.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledRightSide[i], shuffledRightSide[j]] = [shuffledRightSide[j], shuffledRightSide[i]]
    }
    return shuffledRightSide
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

      // Shuffle matching pairs right side
      if (question.type === 'MATCHING' && question.matchingPairs) {
        const shuffledRightSide = shuffleMatchingPairs(question.matchingPairs)
        shuffled[`${question.id}_matching`] = shuffledRightSide.map((_, index) => index.toString())
      }
    })
    
    return shuffled
  }

  useEffect(() => {
    fetchQuestions()
    
    // Disable right-click context menu during test
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()
    }
    
    // Disable common keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Disable Ctrl+C, Ctrl+A, Ctrl+V, Ctrl+X, F12, Ctrl+Shift+I
      if (
        (e.ctrlKey && (e.key === 'c' || e.key === 'a' || e.key === 'v' || e.key === 'x')) ||
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && e.key === 'I')
      ) {
        e.preventDefault()
      }
    }
    
    document.addEventListener('contextmenu', handleContextMenu)
    document.addEventListener('keydown', handleKeyDown)
    
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const fetchQuestions = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/test/questions')
      if (response.ok) {
        const data = await response.json()
        setQuestions(data.questions)
        
        // Create shuffled options for all questions
        if (data.questions) {
          const shuffled = createShuffledOptions(data.questions)
          setShuffledOptions(shuffled)
        }
      }
    } catch (error) {
      console.error('Error fetching questions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAnswer = (questionId: string, answer: string | Record<string, string>) => {
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
  const currentAnswer = answers[currentQuestion.id] || (currentQuestion.type === 'MATCHING' ? {} : '')

  return (
    <div className="min-h-screen bg-gray-50 py-8 select-none" style={{ userSelect: 'none', WebkitUserSelect: 'none', MozUserSelect: 'none', msUserSelect: 'none' }}>
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
            
            {currentQuestion.image && currentQuestion.image.length > 0 && (
              <div className={`mb-4 flex gap-2 ${currentQuestion.image.length === 2 ? 'flex-row' : 'flex-wrap'}`}>
                {currentQuestion.image.map((img, index) => (
                  <ImageModal 
                    key={index}
                    src={img} 
                    alt={`Question ${index + 1}`} 
                    className={`rounded-lg border border-gray-300 object-contain ${
                      (currentQuestion.image?.length ?? 0) === 2 
                        ? 'flex-1 max-h-96' 
                        : (currentQuestion.image?.length ?? 0) <= 4 
                          ? 'w-[calc(33.333%-8px)] max-h-96' 
                          : 'w-[calc(25%-6px)] max-h-80'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Answer Options */}
          {currentQuestion.type === 'CLOSED_ENDED' && (
            <div className="space-y-3">
              {currentQuestion.imageOptions && currentQuestion.imageOptions.filter(img => img && img.trim() !== '').length > 0 ? (
                // Image-based options
                <div className="grid grid-cols-2 gap-4">
                  {(shuffledOptions[`${currentQuestion.id}_images`] || currentQuestion.imageOptions.filter(img => img && img.trim() !== '')).map((imageOption, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswer(currentQuestion.id, imageOption)}
                      className={`p-4 border-2 rounded-lg transition-all duration-200 ${
                        currentAnswer === imageOption
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <ImageModal 
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
                  ))}
                </div>
              ) : (
                // Text-based options
                <div className="space-y-3">
                  {(shuffledOptions[currentQuestion.id] || currentQuestion.options).map((option, index) => (
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

          {currentQuestion.type === 'MATCHING' && (
            <div className="space-y-6">
              <div className="text-sm text-gray-600 mb-4">
                შეაერთეთ მარცხენა სვეტის ელემენტები მარჯვენა სვეტის შესაბამის ელემენტებთან
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900 mb-4">მარცხენა სვეტი</h3>
                  {currentQuestion.matchingPairs?.map((pair, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-600 min-w-[30px]">
                        {String.fromCharCode(65 + index)}:
                      </span>
                      <span className="text-gray-900">{pair.left}</span>
                    </div>
                  ))}
                </div>

                {/* Right Column */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900 mb-4">მარჯვენა სვეტი</h3>
                  {currentQuestion.matchingPairs && (() => {
                    const shuffledIndices = shuffledOptions[`${currentQuestion.id}_matching`]
                    const pairs = currentQuestion.matchingPairs
                    
                    if (shuffledIndices) {
                      return shuffledIndices.map((shuffledIndex, displayIndex) => {
                        const actualIndex = parseInt(shuffledIndex)
                        const pair = pairs[actualIndex]
                        return (
                          <div key={displayIndex} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm font-medium text-gray-600 min-w-[30px]">
                              {displayIndex + 1}:
                            </span>
                            <span className="text-gray-900">{pair.right}</span>
                          </div>
                        )
                      })
                    } else {
                      return pairs.map((pair, index) => (
                        <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm font-medium text-gray-600 min-w-[30px]">
                            {index + 1}:
                          </span>
                          <span className="text-gray-900">{pair.right}</span>
                        </div>
                      ))
                    }
                  })()}
                </div>
              </div>

              {/* Matching Interface */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">შესაბამისობა:</h4>
                <div className="space-y-3">
                  {currentQuestion.matchingPairs?.map((pair, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <span className="text-sm font-medium text-gray-600 min-w-[30px]">
                        {String.fromCharCode(65 + index)}:
                      </span>
                      <select
                        value={(currentAnswer as Record<string, string>)[`${String.fromCharCode(65 + index)}`] || ''}
                        onChange={(e) => {
                          const newAnswer = { ...(currentAnswer as Record<string, string>) }
                          newAnswer[`${String.fromCharCode(65 + index)}`] = e.target.value
                          handleAnswer(currentQuestion.id, newAnswer)
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">აირჩიეთ...</option>
                        {(() => {
                          const shuffledIndices = shuffledOptions[`${currentQuestion.id}_matching`]
                          if (shuffledIndices) {
                            return shuffledIndices.map((_, displayIndex) => (
                              <option key={displayIndex} value={displayIndex + 1}>
                                {displayIndex + 1}
                              </option>
                            ))
                          } else {
                            return currentQuestion.matchingPairs?.map((_, rightIndex) => (
                              <option key={rightIndex} value={rightIndex + 1}>
                                {rightIndex + 1}
                              </option>
                            ))
                          }
                        })()}
                      </select>
                      <span className="text-gray-500">→</span>
                      <span className="text-sm text-gray-600">
                        {(currentAnswer as Record<string, string>)[`${String.fromCharCode(65 + index)}`] ? 
                          `${(currentAnswer as Record<string, string>)[`${String.fromCharCode(65 + index)}`]}` : 
                          'შეარჩიეთ'
                        }
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentQuestion.type === 'OPEN_ENDED' && (
            <div>
              <textarea
                value={currentAnswer as string}
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
