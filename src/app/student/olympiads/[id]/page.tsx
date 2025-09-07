'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ImageModal from '@/components/ImageModal'

interface Question {
  id: string
  question: string
  type: string
  options?: string[]
  correctAnswer?: string
  points: number
  image?: string[]
  imageOptions?: string[]
  subQuestions?: Array<{
    id: string
    text: string
    type: 'CLOSED_ENDED' | 'OPEN_ENDED'
    options?: string[]
    correctAnswer?: string
    answerTemplate?: string
    points: number
    maxPoints?: number
    isAutoScored: boolean
    image?: string
  }>
}

interface OlympiadEvent {
  id: string
  name: string
  description: string
  startDate: string
  endDate: string
  registrationDeadline: string
  maxParticipants: number
  isActive: boolean
  rounds: number
  subjects: string[]
  grades: number[]
  questionTypes: string[]
  questionTypeQuantities?: Record<string, number> | null
  minimumPointsThreshold?: number | null
  packages: Array<{
    id: string
    name: string
    questions: Question[]
  }>
  _count: {
    participations: number
  }
}

export default function OlympiadPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const resolvedParams = use(params)
  const [olympiad, setOlympiad] = useState<OlympiadEvent | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [isStarted, setIsStarted] = useState(false)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [shuffledOptions, setShuffledOptions] = useState<Record<string, string[]>>({})

  useEffect(() => {
    fetchOlympiad()
    checkOlympiadStatus()
    
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
  }, [resolvedParams.id])

  const checkOlympiadStatus = () => {
    const olympiadData = localStorage.getItem(`olympiad_${resolvedParams.id}`)
    if (olympiadData) {
      const data = JSON.parse(olympiadData)
      if (data.isStarted && data.startTime) {
        const startTime = new Date(data.startTime)
        const now = new Date()
        const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000)
        const totalTime = 60 * 60 // 1 hour in seconds
        
        if (elapsed < totalTime) {
          setIsStarted(true)
          setStartTime(startTime)
          setQuestions(data.questions || [])
          setAnswers(data.answers || {})
          setCurrentQuestionIndex(data.currentQuestionIndex || 0)
          
          // Load shuffled options or create new ones if not exist
          if (data.shuffledOptions) {
            setShuffledOptions(data.shuffledOptions)
          } else if (data.questions) {
            const shuffled = createShuffledOptions(data.questions)
            setShuffledOptions(shuffled)
          }
        } else {
          // Time expired, submit answers
          localStorage.removeItem(`olympiad_${resolvedParams.id}`)
        }
      }
    }
  }

  useEffect(() => {
    if (isStarted && startTime) {
      const timer = setInterval(() => {
        const now = new Date()
        const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000)
        const totalTime = 60 * 60 // 1 hour in seconds
        const remaining = Math.max(0, totalTime - elapsed)
        setTimeLeft(remaining)

        if (remaining === 0) {
          handleSubmitAnswers()
        }
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [isStarted, startTime])

  const fetchOlympiad = async () => {
    try {
      const response = await fetch(`/api/student/olympiads/${resolvedParams.id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch olympiad')
      }
      const data = await response.json()
      setOlympiad(data.olympiad)
    } catch (err) {
      setError('ოლიმპიადის ჩატვირთვისას შეცდომა მოხდა')
      console.error('Error fetching olympiad:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStartOlympiad = async () => {
    try {
      const response = await fetch(`/api/student/olympiads/${resolvedParams.id}/start`, {
        method: 'POST',
      })

      if (!response.ok) {
        const errorText = await response.text()
        let errorMessage = 'Failed to start olympiad'
        try {
          const errorData = JSON.parse(errorText)
          errorMessage = errorData.error || errorMessage
        } catch {
          errorMessage = errorText || errorMessage
        }
        throw new Error(errorMessage)
      }

      const data = await response.json()
      
      if (data.resumed) {
        // Olympiad was resumed, use existing start time
        setQuestions(data.questions)
        
        // Create shuffled options for all questions
        const shuffled = createShuffledOptions(data.questions)
        setShuffledOptions(shuffled)
        
        setIsStarted(true)
        // We need to get the actual start time from the database
        // For now, we'll use current time minus elapsed time
        const now = new Date()
        setStartTime(now) // This will be corrected by the timer
      } else {
        // New olympiad start
        const startTime = new Date()
        setQuestions(data.questions)
        
        // Create shuffled options for all questions
        const shuffled = createShuffledOptions(data.questions)
        setShuffledOptions(shuffled)
        
        setIsStarted(true)
        setStartTime(startTime)
        
        // Save to localStorage
        const olympiadData = {
          isStarted: true,
          startTime: startTime.toISOString(),
          questions: data.questions,
          shuffledOptions: shuffled,
          answers: {},
          currentQuestionIndex: 0
        }
        localStorage.setItem(`olympiad_${resolvedParams.id}`, JSON.stringify(olympiadData))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'სისტემური შეცდომა მოხდა')
      console.error('Error starting olympiad:', err)
    }
  }

  const handleAnswerChange = (questionId: string, answer: string | string[]) => {
    const newAnswers = {
      ...answers,
      [questionId]: answer
    }
    setAnswers(newAnswers)
    
    // Update localStorage
    const olympiadData = localStorage.getItem(`olympiad_${resolvedParams.id}`)
    if (olympiadData) {
      const data = JSON.parse(olympiadData)
      data.answers = newAnswers
      data.shuffledOptions = shuffledOptions
      localStorage.setItem(`olympiad_${resolvedParams.id}`, JSON.stringify(data))
    }
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      const newIndex = currentQuestionIndex + 1
      setCurrentQuestionIndex(newIndex)
      
      // Update localStorage
      const olympiadData = localStorage.getItem(`olympiad_${resolvedParams.id}`)
      if (olympiadData) {
        const data = JSON.parse(olympiadData)
        data.currentQuestionIndex = newIndex
        localStorage.setItem(`olympiad_${resolvedParams.id}`, JSON.stringify(data))
      }
    }
  }

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      const newIndex = currentQuestionIndex - 1
      setCurrentQuestionIndex(newIndex)
      
      // Update localStorage
      const olympiadData = localStorage.getItem(`olympiad_${resolvedParams.id}`)
      if (olympiadData) {
        const data = JSON.parse(olympiadData)
        data.currentQuestionIndex = newIndex
        localStorage.setItem(`olympiad_${resolvedParams.id}`, JSON.stringify(data))
      }
    }
  }

  const handleSubmitAnswers = async () => {
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/student/olympiads/${resolvedParams.id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answers }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        let errorMessage = 'Failed to submit answers'
        try {
          const errorData = JSON.parse(errorText)
          errorMessage = errorData.error || errorMessage
        } catch {
          errorMessage = errorText || errorMessage
        }
        throw new Error(errorMessage)
      }

      const result = await response.json()
      
      // Clear localStorage
      localStorage.removeItem(`olympiad_${resolvedParams.id}`)
      
      router.push(`/student/olympiads/${resolvedParams.id}/results?score=${result.score}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'სისტემური შეცდომა მოხდა')
      console.error('Error submitting answers:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ka-GE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'Asia/Tbilisi'
    })
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    const months = [
      'იანვარი', 'თებერვალი', 'მარტი', 'აპრილი', 'მაისი', 'ივნისი',
      'ივლისი', 'აგვისტო', 'სექტემბერი', 'ოქტომბერი', 'ნოემბერი', 'დეკემბერი'
    ]
    
    const day = date.getDate()
    const month = months[date.getMonth()]
    const year = date.getFullYear()
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    
    return `${day} ${month} ${year} ${hours}:${minutes}`
  }

  const getQuestionTypeLabel = (type: string) => {
    const typeLabels: Record<string, string> = {
      'MATCHING': 'შესაბამისობა',
      'TEXT_ANALYSIS': 'ტექსტის ანალიზი',
      'MAP_ANALYSIS': 'რუკის ანალიზი',
      'OPEN_ENDED': 'ღია კითხვა',
      'CLOSED_ENDED': 'დახურული კითხვა'
    }
    return typeLabels[type] || type
  }

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
      // Shuffle options for MULTIPLE_CHOICE and CLOSED_ENDED questions
      if ((question.type === 'MULTIPLE_CHOICE' || question.type === 'CLOSED_ENDED') && question.options) {
        shuffled[question.id] = shuffleArray(question.options)
      }
      
      // Shuffle image options for CLOSED_ENDED questions
      if (question.type === 'CLOSED_ENDED' && question.imageOptions) {
        const filteredImageOptions = question.imageOptions.filter(img => img && img.trim() !== '')
        if (filteredImageOptions.length > 0) {
          shuffled[`${question.id}_images`] = shuffleArray(filteredImageOptions)
        }
      }
      
      // Shuffle TRUE_FALSE options (სწორი/არასწორი)
      if (question.type === 'TRUE_FALSE') {
        shuffled[question.id] = shuffleArray(['true', 'false'])
      }

      // Handle sub-questions for TEXT_ANALYSIS and MAP_ANALYSIS
      if (question.subQuestions) {
        question.subQuestions.forEach(subQuestion => {
          if (subQuestion.type === 'CLOSED_ENDED' && subQuestion.options) {
            shuffled[`${question.id}_${subQuestion.id}`] = shuffleArray(subQuestion.options)
          }
        })
      }
    })
    
    return shuffled
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#034e64] mx-auto mb-4"></div>
              <p className="text-black md:text-[20px] text-[18px]">იტვირთება...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!olympiad) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">ოლიმპიადა ვერ მოიძებნა</h1>
            <Link
              href="/student/olympiads"
              className="bg-[#034e64] text-white px-4 py-2 rounded-md"
            >
              უკან დაბრუნება
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const now = new Date()
  const startDate = new Date(olympiad.startDate)
  const endDate = new Date(olympiad.endDate)
  const canStart = now >= startDate && now <= endDate

  if (!isStarted) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-black md:text-[24px] text-[20px] font-bold">
                {olympiad.name}
              </h1>
              <Link
                href="/student/olympiads"
                className="bg-gray-500 text-white px-4 py-2 rounded-md md:text-[20px] text-[16px] font-bold transition-colors hover:bg-gray-600"
              >
                უკან დაბრუნება
              </Link>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Olympiad Info */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">ოლიმპიადის ინფორმაცია</h2>
                <div className="space-y-2">
                  <p><strong>აღწერა:</strong> {olympiad.description}</p>
                  <p><strong>დაწყება:</strong> {formatDateTime(olympiad.startDate)}</p>
                  <p><strong>დასრულება:</strong> {formatDateTime(olympiad.endDate)}</p>
                  <p><strong>საგნები:</strong> {olympiad.subjects.join(', ')}</p>
                  <p><strong>კლასები:</strong> {olympiad.grades.join(', ')}</p>
                  <p><strong>რაუნდები:</strong> {olympiad.rounds}</p>
                  <p><strong>მონაწილეები:</strong> {olympiad._count.participations}/{olympiad.maxParticipants}</p>
                </div>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">კითხვების ინფორმაცია</h2>
                <div className="space-y-2">
                  <p><strong>პაკეტების რაოდენობა:</strong> {olympiad.packages.length}</p>
                  <p><strong>კითხვების ტიპები:</strong></p>
                  <ul className="list-disc list-inside ml-4">
                    {olympiad.questionTypes.map((type, index) => (
                      <li key={index}>{getQuestionTypeLabel(type)}</li>
                    ))}
                  </ul>
                  {olympiad.minimumPointsThreshold && (
                    <p><strong>მინიმალური ქულის ზღვარი:</strong> {olympiad.minimumPointsThreshold}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Start Button */}
          <div className="text-center">
            {canStart ? (
              <button
                onClick={handleStartOlympiad}
                className="bg-[#034e64] text-white px-8 py-3 rounded-md md:text-[24px] text-[20px] font-bold transition-colors hover:bg-[#023a4d]"
              >
                ოლიმპიადის დაწყება
              </button>
            ) : (
              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  {now < startDate 
                    ? `ოლიმპიადა დაიწყება ${formatDateTime(olympiad.startDate)}-ზე`
                    : `ოლიმპიადა დასრულდა ${formatDateTime(olympiad.endDate)}-ზე`
                  }
                </p>
                <button
                  disabled
                  className="bg-gray-400 text-white px-8 py-3 rounded-md md:text-[24px] text-[20px] font-bold cursor-not-allowed"
                >
                  {now < startDate ? 'ოლიმპიადა ჯერ არ დაწყებულა' : 'ოლიმპიადა დასრულდა'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Olympiad in progress
  const currentQuestion = questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100

  return (
    <div className="min-h-screen bg-gray-50 p-6 select-none" style={{ userSelect: 'none', WebkitUserSelect: 'none', MozUserSelect: 'none', msUserSelect: 'none' }}>
      <div className="max-w-4xl mx-auto">
        {/* Header with Timer */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-black md:text-[24px] text-[20px] font-bold">
                {olympiad.name}
              </h1>
              <p className="text-gray-600">კითხვა {currentQuestionIndex + 1} / {questions.length}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-red-600">
                {formatTime(timeLeft)}
              </div>
              <p className="text-sm text-gray-600">დარჩენილი დრო</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-[#034e64] h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Question */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              კითხვა {currentQuestionIndex + 1}
            </h2>
            
            {(currentQuestion.type === 'TEXT_ANALYSIS' || currentQuestion.type === 'MAP_ANALYSIS') ? (
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-black md:text-[18px] text-[16px] mb-4">
                  {currentQuestion.type === 'TEXT_ANALYSIS' ? 'ტექსტი ანალიზისთვის:' : 'რუკის აღწერა ანალიზისთვის:'}
                </h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                    {currentQuestion.question}
                  </p>
                </div>
                {currentQuestion.image && currentQuestion.image.length > 0 && (
                  <div className={`mb-4 flex gap-2 ${currentQuestion.image.length === 2 ? 'flex-row' : 'flex-col'}`}>
                    {currentQuestion.image.map((img, index) => (
                      <ImageModal 
                        key={index}
                        src={img} 
                        alt={`კითხვის სურათი ${index + 1}`} 
                        className={`object-contain rounded-lg border shadow-sm ${currentQuestion.image?.length === 2 ? 'flex-1 max-h-96' : 'max-w-full h-auto max-h-96'}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-700 mb-4">{currentQuestion.question}</p>
            )}
            
            <p className="text-sm text-gray-500">ქულები: {currentQuestion.points}</p>
          </div>

          {/* Answer Options */}
          <div className="space-y-3">
            {(currentQuestion.type === 'MULTIPLE_CHOICE' || currentQuestion.type === 'CLOSED_ENDED') && (
              <>
                {currentQuestion.imageOptions && currentQuestion.imageOptions.filter(img => img && img.trim() !== '').length > 0 ? (
                  // Image-based options
                  <div className="grid grid-cols-2 gap-4">
                    {(shuffledOptions[`${currentQuestion.id}_images`] || currentQuestion.imageOptions.filter(img => img && img.trim() !== '')).map((imageOption, index) => (
                      <button
                        key={index}
                        onClick={() => handleAnswerChange(currentQuestion.id, imageOption)}
                        className={`p-4 border-2 rounded-lg transition-all duration-200 ${
                          answers[currentQuestion.id] === imageOption
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
                ) : currentQuestion.options && (
                  // Text-based options
                  <div className="space-y-2">
                    {(shuffledOptions[currentQuestion.id] || currentQuestion.options).map((option, index) => (
                      <label key={index} className="flex items-center">
                        <input
                          type="radio"
                          name={`question-${currentQuestion.id}`}
                          value={option}
                          checked={answers[currentQuestion.id] === option}
                          onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                          className="h-4 w-4 text-[#034e64] focus:ring-[#034e64] border-gray-300"
                        />
                        <span className="ml-2 text-gray-900">{option}</span>
                      </label>
                    ))}
                  </div>
                )}
              </>
            )}

            {currentQuestion.type === 'TRUE_FALSE' && (
              <div className="space-y-2">
                {(shuffledOptions[currentQuestion.id] || ['true', 'false']).map((value, index) => (
                  <label key={index} className="flex items-center">
                    <input
                      type="radio"
                      name={`question-${currentQuestion.id}`}
                      value={value}
                      checked={answers[currentQuestion.id] === value}
                      onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                      className="h-4 w-4 text-[#034e64] focus:ring-[#034e64] border-gray-300"
                    />
                    <span className="ml-2 text-gray-900">{value === 'true' ? 'სწორი' : 'არასწორი'}</span>
                  </label>
                ))}
              </div>
            )}

            {currentQuestion.type === 'OPEN_ENDED' && (
              <textarea
                value={answers[currentQuestion.id] as string || ''}
                onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#034e64]"
                rows={4}
                placeholder="შეიყვანეთ თქვენი პასუხი..."
              />
            )}

            {(currentQuestion.type === 'TEXT_ANALYSIS' || currentQuestion.type === 'MAP_ANALYSIS') && currentQuestion.subQuestions && (
              <div className="space-y-4">
                {/* Main Analysis Input */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-green-800 mb-2">
                    {currentQuestion.type === 'TEXT_ANALYSIS' ? 'ტექსტის ანალიზი:' : 'რუკის ანალიზი:'}
                  </h4>
                  <p className="text-sm text-green-700 mb-3">
                    {currentQuestion.type === 'TEXT_ANALYSIS' 
                      ? 'შეიყვანეთ თქვენი ანალიზი ზემოთ მოცემული ტექსტის საფუძველზე:'
                      : 'შეიყვანეთ თქვენი ანალიზი ზემოთ მოცემული რუკის საფუძველზე:'
                    }
                  </p>
                  <textarea
                    value={answers[`${currentQuestion.id}_analysis`] as string || ''}
                    onChange={(e) => handleAnswerChange(`${currentQuestion.id}_analysis`, e.target.value)}
                    className="w-full px-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    rows={6}
                    placeholder={currentQuestion.type === 'TEXT_ANALYSIS' 
                      ? 'შეიყვანეთ ტექსტის ანალიზი...'
                      : 'შეიყვანეთ რუკის ანალიზი...'
                    }
                  />
                </div>

                {/* Sub-questions */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-purple-800 mb-2">
                    {currentQuestion.type === 'TEXT_ANALYSIS' ? 'ქვეკითხვები ტექსტის ანალიზისთვის:' : 'ქვეკითხვები რუკის ანალიზისთვის:'}
                  </h4>
                  <p className="text-sm text-purple-700">
                    ქვემოთ მოცემული ქვეკითხვებისთვის პასუხი გაეცით ზემოთ მოცემული ტექსტის/რუკის საფუძველზე
                  </p>
                </div>

                {currentQuestion.subQuestions.map((subQuestion, subIndex) => (
                  <div key={subQuestion.id} className="border border-gray-200 rounded-lg p-4 bg-white">
                    <h4 className="font-medium text-gray-900 mb-3">
                      {subIndex + 1}. {subQuestion.text}
                    </h4>
                    
                    {subQuestion.image && (
                      <div className="mb-3">
                        <img 
                          src={subQuestion.image} 
                          alt="Sub-question image" 
                          className="max-w-full h-auto rounded-lg"
                        />
                      </div>
                    )}

                    {subQuestion.type === 'CLOSED_ENDED' && subQuestion.options && subQuestion.options.filter(opt => opt.trim() !== '').length > 0 ? (
                      <div className="space-y-2">
                        {(shuffledOptions[`${currentQuestion.id}_${subQuestion.id}`] || subQuestion.options.filter(opt => opt.trim() !== '')).map((option, optionIndex) => (
                          <label key={optionIndex} className="flex items-center">
                            <input
                              type="radio"
                              name={`subquestion-${currentQuestion.id}-${subQuestion.id}`}
                              value={option}
                              checked={answers[`${currentQuestion.id}_${subQuestion.id}`] === option}
                              onChange={(e) => handleAnswerChange(`${currentQuestion.id}_${subQuestion.id}`, e.target.value)}
                              className="h-4 w-4 text-[#034e64] focus:ring-[#034e64] border-gray-300"
                            />
                            <span className="ml-2 text-gray-900">{option}</span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <textarea
                        value={answers[`${currentQuestion.id}_${subQuestion.id}`] as string || ''}
                        onChange={(e) => handleAnswerChange(`${currentQuestion.id}_${subQuestion.id}`, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#034e64]"
                        rows={3}
                        placeholder="შეიყვანეთ თქვენი პასუხი..."
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0}
            className="bg-gray-500 text-white px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
          >
            წინა
          </button>

          <div className="flex space-x-4">
            {currentQuestionIndex === questions.length - 1 ? (
              <button
                onClick={handleSubmitAnswers}
                disabled={isSubmitting}
                className="bg-green-600 text-white px-6 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-700 transition-colors"
              >
                {isSubmitting ? 'შენახვა...' : 'პასუხების გაგზავნა'}
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="bg-[#034e64] text-white px-4 py-2 rounded-md hover:bg-[#023a4d] transition-colors"
              >
                შემდეგი
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
