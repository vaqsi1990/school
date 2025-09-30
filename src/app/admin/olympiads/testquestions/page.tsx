'use client'

import { useAuth } from '@/hooks/useAuth'
import { AdminOnly } from '@/components/auth/ProtectedRoute'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import ImageModal from '@/components/ImageModal'
import { convertStudentAnswerToDisplayFormat } from '@/utils/matchingUtils'
import { numberToGeorgianLetter, numberToGeorgianQuestionNumber, numberToGeorgianOptionLabel } from '@/utils/georgianLetters'

interface Question {
  id: string
  text: string
  type: string
  options: string[]
  correctAnswer: string | null
  explanation: string | null
  points: number
  matchingPairs: Array<{left: string, right: string}> | null
  leftSide: Array<{left: string}> | null
  rightSide: Array<{right: string}> | null
  image: string[] | null
  imageOptions: string[]
  subject: {
    name: string
  }
  grade: number
  createdByTeacher?: {
    name: string
    lastname: string
  }
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

interface QuestionPackage {
  id: string
  name: string
  description: string
  questions: {
    question: Question
    order: number
  }[]
  createdByAdmin?: {
    name: string
    lastname: string
  }
  createdByTeacher?: {
    name: string
    lastname: string
  }
}

function TestQuestionsContent() {
  const { user } = useAuth()
  const [allQuestions, setAllQuestions] = useState<Question[]>([])
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([])
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({})
  const [showResults, setShowResults] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedSubject, setSelectedSubject] = useState<string>('')
  const [selectedGrade, setSelectedGrade] = useState<number | ''>('')
  const [selectedQuestionType, setSelectedQuestionType] = useState<string>('')
  const [shuffledOptions, setShuffledOptions] = useState<Record<string, string[]>>({})
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<string>>(new Set())

  // Fetch all questions
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/admin/questions')
        if (response.ok) {
          const data = await response.json()
          setAllQuestions(data.questions || [])
          setFilteredQuestions(data.questions || [])
        }
      } catch (error) {
        console.error('Error fetching questions:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      fetchQuestions()
    }
    
  }, [user])

  // Filter questions based on selected criteria
  useEffect(() => {
    let filtered = allQuestions

    if (selectedSubject) {
      filtered = filtered.filter(q => q.subject.name === selectedSubject)
    }

    if (selectedGrade) {
      filtered = filtered.filter(q => q.grade === selectedGrade)
    }

    if (selectedQuestionType) {
      filtered = filtered.filter(q => q.type === selectedQuestionType)
    }

    setFilteredQuestions(filtered)
  }, [allQuestions, selectedSubject, selectedGrade, selectedQuestionType])

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
      
      // Shuffle TRUE_FALSE options
      if (question.type === 'TRUE_FALSE') {
        shuffled[question.id] = shuffleArray(['true', 'false'])
      }

      // Keep MATCHING pairs right side in original order (no shuffling)
      if (question.type === 'MATCHING' && (question.matchingPairs || question.rightSide)) {
        const rightItems = question.rightSide || question.matchingPairs!
        // Keep original order - no shuffling
        shuffled[`${question.id}_matching`] = rightItems.map((_, index) => index.toString())
      }
    })
    
    return shuffled
  }

  const handleQuestionSelect = (questions: Question[]) => {
    setSelectedQuestions(questions)
    setCurrentQuestionIndex(0)
    setUserAnswers({})
    setShowResults(false)
    setAnsweredQuestions(new Set())
    
    // Create shuffled options for selected questions
    const shuffled = createShuffledOptions(questions)
    setShuffledOptions(shuffled)
  }

  const handleSelectAllFiltered = () => {
    handleQuestionSelect(filteredQuestions)
  }

  const handleSelectRandom = (count: number) => {
    const shuffled = [...filteredQuestions].sort(() => 0.5 - Math.random())
    const selected = shuffled.slice(0, Math.min(count, filteredQuestions.length))
    handleQuestionSelect(selected)
  }

  const handleAnswerChange = (questionId: string, answer: string) => {
    // Allow changes to any question - no locking based on answeredQuestions
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }))
  }

  const nextQuestion = () => {
    if (currentQuestionIndex < selectedQuestions.length - 1) {
      // Only mark current question as answered if it has an answer
      const currentQuestionId = selectedQuestions[currentQuestionIndex].id
      const hasAnswer = userAnswers[currentQuestionId] && userAnswers[currentQuestionId].trim() !== ''
      
      if (hasAnswer) {
        setAnsweredQuestions(prev => new Set([...prev, currentQuestionId]))
      }
      
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const finishTest = () => {
    setShowResults(true)
  }

  const resetTest = () => {
    setSelectedQuestions([])
    setCurrentQuestionIndex(0)
    setUserAnswers({})
    setShowResults(false)
    setAnsweredQuestions(new Set())
  }

  const getAvailableSubjects = () => {
    return [...new Set(allQuestions.map(q => q.subject.name))].sort()
  }

  const getAvailableGrades = () => {
    return [...new Set(allQuestions.map(q => q.grade))].sort((a, b) => a - b)
  }

  const getAvailableQuestionTypes = () => {
    return [...new Set(allQuestions.map(q => q.type))].sort()
  }

  const calculateScore = () => {
    let correct = 0
    const total = selectedQuestions.length
    
    selectedQuestions.forEach(question => {
      if (question.type === 'MATCHING') {
        // For MATCHING questions, convert user answers to string format and compare with correctAnswer
        const leftItems = question.leftSide || question.matchingPairs
        if (leftItems && leftItems.length > 0) {
          const pairs: string[] = []
          leftItems.forEach((leftItem, pairIndex) => {
            const userAnswerKey = `${question.id}_${pairIndex}`
            const userAnswerValue = userAnswers[userAnswerKey]
            if (userAnswerValue && leftItem.left) {
              // Convert the number to actual text content from right side
              const rightIndex = parseInt(userAnswerValue) - 1
              const rightItem = question.rightSide?.[rightIndex]
              const rightText = rightItem?.right || userAnswerValue
              pairs.push(`${leftItem.left}:${rightText}`)
            }
          })
          const userAnswerString = pairs.join(',')
          
          if (question.correctAnswer && userAnswerString === question.correctAnswer) {
            correct++
          }
        }
      } else {
        // For other question types
        const userAnswer = userAnswers[question.id]
        if (question.correctAnswer && userAnswer === question.correctAnswer) {
          correct++
        }
      }
    })
    
    return { correct, total, percentage: Math.round((correct / total) * 100) }
  }

  const getQuestionTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      'MATCHING': 'შესაბამისობა',
      'TEXT_ANALYSIS': 'ტექსტის ანალიზი',
      'MAP_ANALYSIS': 'რუკის ანალიზი',
      'OPEN_ENDED': 'ღია კითხვა',
      'CLOSED_ENDED': 'დახურული კითხვა'
    }
    return types[type] || type
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#034e64] mx-auto"></div>
          <p className="text-black md:text-[18px] text-[16px] mt-4">კითხვების ჩატვირთვა...</p>
        </div>
      </div>
    )
  }


  return (
    <div className="min-h-screen bg-gray-50" >
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-black md:text-[25px] text-[20px]">
                ტესტის კითხვების გადახედვა
              </h1>
              <p className="text-black md:text-[18px] text-[16px]">
                გადახედეთ და გატესტეთ კითხვები სტუდენტების ნახვამდე
              </p>
            </div>
            <Link
              href="/admin/olympiads"
              className="bg-[#034e64] cursor-pointer text-white px-4 py-2 rounded-md md:text-[20px] text-[16px] font-bold transition-colors hover:bg-[#023a4d]"
            >
              უკან დაბრუნება
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedQuestions.length === 0 ? (
          // Question Selection
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-black md:text-[22px] text-[18px]">
                კითხვების არჩევა
              </h2>
            </div>
            
            <div className="p-6">
              {allQuestions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-black md:text-[18px] text-[16px]">კითხვები ვერ მოიძებნა</p>
                  <Link
                    href="/admin/olympiads/questions"
                    className="inline-block mt-4 bg-[#034e64] text-white px-4 py-2 rounded-md hover:bg-[#023a4d]"
                  >
                    კითხვების მართვა
                  </Link>
                </div>
              ) : (
                <>
                  {/* Filters */}
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-lg font-semibold text-black mb-4">ფილტრები</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[16px] font-medium text-black mb-2">საგანი</label>
                        <select
                          value={selectedSubject}
                          onChange={(e) => setSelectedSubject(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#034e64] text-black placeholder:text-black"
                        >
                          <option className="text-black" value="">ყველა საგანი</option>
                          {getAvailableSubjects().map(subject => (
                            <option className="text-black" key={subject} value={subject}>{subject}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-[16px] font-medium text-black mb-2">კლასი</label>
                        <select
                          value={selectedGrade}
                          onChange={(e) => setSelectedGrade(e.target.value ? parseInt(e.target.value) || '' : '')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#034e64] text-black placeholder:text-black"
                        >
                          <option className="text-black" value="">ყველა კლასი</option>
                          {getAvailableGrades().map(grade => (
                            <option className="text-black" key={grade} value={grade}>{grade} კლასი</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-[16px] font-medium text-black mb-2">კითხვის ტიპი</label>
                        <select
                          value={selectedQuestionType}
                          onChange={(e) => setSelectedQuestionType(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#034e64] text-black placeholder:text-black"
                        >
                          <option className="text-black" value="">ყველა ტიპი</option>
                          {getAvailableQuestionTypes().map(type => (
                            <option className="text-black" key={type} value={type}>{getQuestionTypeLabel(type)}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    <div className="mt-4 text-[16px] text-black">
                      ნაპოვნია {filteredQuestions.length} კითხვა {allQuestions.length}-დან
                    </div>
                  </div>

                  {/* Selection Options */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-black mb-4">კითხვების არჩევა</h3>
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={handleSelectAllFiltered}
                        disabled={filteredQuestions.length === 0}
                        className="bg-[#034e64] text-white px-4 py-2 rounded-md hover:bg-[#023a4d] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                      >
                        ყველა კითხვა ({filteredQuestions.length})
                      </button>
                      <button
                        onClick={() => handleSelectRandom(10)}
                        disabled={filteredQuestions.length === 0}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                      >
                        შემთხვევითი 10
                      </button>
                      <button
                        onClick={() => handleSelectRandom(20)}
                        disabled={filteredQuestions.length === 0}
                        className="bg-white text-black px-4 py-2 rounded-md  disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                      >
                        შემთხვევითი 20
                      </button>
                      <button
                        onClick={() => handleSelectRandom(50)}
                        disabled={filteredQuestions.length === 0}
                        className="bg-white text-black px-4 py-2 rounded-md  disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                      >
                        შემთხვევითი 50
                      </button>
                    </div>
                  </div>

                  {/* Questions List */}
                  {filteredQuestions.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-black mb-4">კითხვების სია</h3>
                      <div className="max-h-96 overflow-y-auto space-y-2">
                        {filteredQuestions.map((question, index) => (
                          <div key={question.id} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className="text-[16px] font-medium text-black">#{index + 1}</span>
                                  <span className="text-xs bg-white text-black px-2 py-1 rounded">
                                    {getQuestionTypeLabel(question.type)}
                                  </span>
                                  <span className="text-xs bg-white text-black px-2 py-1 rounded">
                                    {question.subject.name}
                                  </span>
                                  <span className="text-xs bg-white text-black px-2 py-1 rounded">
                                    {question.grade} კლასი
                                  </span>
                                </div>
                                <p className="text-[16px] text-black line-clamp-2">{question.text}</p>
                                {question.image && question.image.length > 0 && (
                                  <div className="mt-2 flex gap-1 flex-wrap">
                                    {question.image.map((img, index) => (
                                      <ImageModal 
                                        key={index}
                                        src={img} 
                                        alt={`კითხვის სურათი ${index + 1}`} 
                                        className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 object-cover rounded border"
                                      />
                                    ))}
                                  </div>
                                )}
                              </div>
                              <button
                                onClick={() => handleQuestionSelect([question])}
                                className="ml-3 bg-[#034e64] text-white px-3 py-1 rounded text-[16px] hover:bg-[#023a4d] transition-colors"
                              >
                                ტესტი
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        ) : showResults ? (
          // Results View
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-black md:text-[22px] text-[18px]">
                ტესტის შედეგები
              </h2>
            </div>
            
            <div className="p-6">
              {/* Test Statistics */}
              {(() => {
                const totalQuestions = selectedQuestions.length
                const correctAnswers = selectedQuestions.filter(q => {
                  if (q.type === 'MATCHING') {
                    // For matching questions, construct the answer from individual parts
                    const leftItems = q.leftSide || q.matchingPairs
                    if (leftItems && leftItems.length > 0) {
                      const pairs: string[] = []
                      leftItems.forEach((leftItem, pairIndex) => {
                        const userAnswerKey = `${q.id}_${pairIndex}`
                        const userAnswerValue = userAnswers[userAnswerKey]
                        if (userAnswerValue && leftItem.left) {
                          // Convert the number to actual text content from right side
                          const rightIndex = parseInt(userAnswerValue) - 1
                          const rightItem = q.rightSide?.[rightIndex]
                          const rightText = rightItem?.right || userAnswerValue
                          pairs.push(`${leftItem.left}:${rightText}`)
                        }
                      })
                      const userAnswerString = pairs.join(',')
                      return !!(q.correctAnswer && userAnswerString === q.correctAnswer)
                    }
                    return false
                  } else {
                    // For other question types
                    const userAnswer = userAnswers[q.id]
                    return !!(q.correctAnswer && userAnswer === q.correctAnswer)
                  }
                }).length
                const totalScore = selectedQuestions.reduce((sum, q) => {
                  let isCorrect = false
                  if (q.type === 'MATCHING') {
                    // For matching questions, construct the answer from individual parts
                    const leftItems = q.leftSide || q.matchingPairs
                    if (leftItems && leftItems.length > 0) {
                      const pairs: string[] = []
                      leftItems.forEach((leftItem, pairIndex) => {
                        const userAnswerKey = `${q.id}_${pairIndex}`
                        const userAnswerValue = userAnswers[userAnswerKey]
                        if (userAnswerValue && leftItem.left) {
                          // Convert the number to actual text content from right side
                          const rightIndex = parseInt(userAnswerValue) - 1
                          const rightItem = q.rightSide?.[rightIndex]
                          const rightText = rightItem?.right || userAnswerValue
                          pairs.push(`${leftItem.left}:${rightText}`)
                        }
                      })
                      const userAnswerString = pairs.join(',')
                      isCorrect = !!(q.correctAnswer && userAnswerString === q.correctAnswer)
                    }
                  } else {
                    // For other question types
                    const userAnswer = userAnswers[q.id]
                    isCorrect = !!(q.correctAnswer && userAnswer === q.correctAnswer)
                  }
                  return sum + (isCorrect ? q.points : 0)
                }, 0)
                const maxScore = selectedQuestions.reduce((sum, q) => sum + q.points, 0)
                const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0
                
                return (
                  <div className="mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-black">{totalScore}</div>
                        <div className="text-[16px] text-black">მიღებული ქულა</div>
                        <div className="text-xs text-black">მაქსიმუმი: {maxScore}</div>
                      </div>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-black">{correctAnswers}</div>
                        <div className="text-[16px] text-black">სწორი პასუხი</div>
                        <div className="text-xs text-black">სულ: {totalQuestions}</div>
                      </div>
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-black">{percentage}%</div>
                        <div className="text-[16px] text-black">შედეგი</div>
                        <div className="text-xs text-black">პროცენტი</div>
                      </div>
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-black">{totalQuestions - correctAnswers}</div>
                        <div className="text-[16px] text-black">არასწორი</div>
                        <div className="text-xs text-black">პასუხი</div>
                      </div>
                    </div>
                    
                    <div className="text-center py-4">
                      <div className="inline-block bg-green-100 rounded-full p-6">
                        <div className="text-xl font-bold text-black mb-2">
                          {totalScore} / {maxScore} ქულა
                        </div>
                        <div className="text-[16px] text-black">
                          {correctAnswers} / {totalQuestions} სწორი პასუხი
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })()}
              
              {/* Questions Review */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-black mb-4">კითხვების გადახედვა</h3>
                <div className="space-y-4">
                  {selectedQuestions.map((question, index) => {
                    // For matching questions, we need to construct the answer from individual parts
                    let userAnswer = userAnswers[question.id]
                    let isCorrect = question.correctAnswer && userAnswer === question.correctAnswer
                    
                    if (question.type === 'MATCHING') {
                      // Construct the answer from individual answers
                      const leftItems = question.leftSide || question.matchingPairs
                      if (leftItems && leftItems.length > 0) {
                        const pairs: string[] = []
                        leftItems.forEach((leftItem, pairIndex) => {
                          const userAnswerKey = `${question.id}_${pairIndex}`
                          const userAnswerValue = userAnswers[userAnswerKey]
                          if (userAnswerValue && leftItem.left) {
                            // Convert the number to actual text content from right side
                            const rightIndex = parseInt(userAnswerValue) - 1
                            const rightItem = question.rightSide?.[rightIndex]
                            const rightText = rightItem?.right || userAnswerValue
                            pairs.push(`${leftItem.left}:${rightText}`)
                          }
                        })
                        userAnswer = pairs.join(',')
                        isCorrect = question.correctAnswer && userAnswer === question.correctAnswer
                      }
                    }
                    
                    return (
                      <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="text-lg font-medium text-black">
                            კითხვა {index + 1}: {question.text}
                          </h4>
                          <div className="flex items-center space-x-2">
                            {isCorrect ? (
                              <span className="text-black text-[16px] font-medium">✓ სწორი</span>
                            ) : (
                              <span className="text-black text-[16px] font-medium">✗ არასწორი</span>
                            )}
                            <span className="text-[16px] text-black">{question.points} ქულა</span>
                          </div>
                        </div>
                        
                        {question.type === 'CLOSED_ENDED' && question.options && (
                          <div className="mb-3">
                            <div className="text-[16px] font-medium text-black mb-2">პასუხის ვარიანტები:</div>
                            <div className="space-y-1">
                              {question.options.map((option, optIndex) => (
                                <div key={optIndex} className={`p-2 rounded ${
                                  option === question.correctAnswer 
                                    ? 'bg-green-100 text-black border border-green-300' 
                                    : option === userAnswer && option !== question.correctAnswer
                                      ? 'bg-red-100 text-black border border-red-300'
                                      : 'bg-gray-50 text-black'
                                }`}>
                                  {numberToGeorgianOptionLabel(optIndex)} {option}
                                  {option === question.correctAnswer && ' ✓ სწორი პასუხი'}
                                  {option === userAnswer && option !== question.correctAnswer && ' ✗ თქვენი პასუხი'}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {question.type === 'CLOSED_ENDED' && question.imageOptions && question.imageOptions.filter(img => img && img.trim() !== '').length > 0 && (
                          <div className="mb-3">
                            <div className="text-[16px] font-medium text-black mb-2">სურათის ვარიანტები:</div>
                            <div className="grid grid-cols-2 gap-4">
                              {question.imageOptions.filter(img => img && img.trim() !== '').map((imageUrl, imgIndex) => (
                                <div key={imgIndex} className={`p-2 rounded border-2 ${
                                  imageUrl === question.correctAnswer 
                                    ? 'bg-green-100 border-green-300' 
                                    : imageUrl === userAnswer && imageUrl !== question.correctAnswer
                                      ? 'bg-red-100 border-red-300'
                                      : 'bg-gray-50 border-gray-200'
                                }`}>
                                  <ImageModal
                                    src={imageUrl}
                                    alt={`ვარიანტი ${imgIndex + 1}`}
                                    className="w-full h-32 sm:h-36 md:h-40 object-cover rounded"
                                  />
                                  <div className="text-center mt-1">
                                    <span className="text-xs font-medium">
                                      {numberToGeorgianLetter(imgIndex)}
                                      {imageUrl === question.correctAnswer && ' ✓ სწორი'}
                                      {imageUrl === userAnswer && imageUrl !== question.correctAnswer && ' ✗ თქვენი'}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {question.type === 'MATCHING' && (question.matchingPairs || question.leftSide) && (
                          <div className="mb-3">
                            <div className="text-[16px] font-medium text-black mb-2">შესაბამისობა:</div>
                            <div className="text-[16px] text-black">
                              სწორი პასუხი: {question.correctAnswer ? question.correctAnswer.replace(/:/g, ' → ').replace(/,/g, ', ') : 'არ არის მითითებული'}
                            </div>
                            <div className="text-[16px] text-black">
                              თქვენი პასუხი: {userAnswer ? userAnswer.replace(/:/g, ' → ').replace(/,/g, ', ') : 'პასუხი არ მოცემულა'}
                            </div>
                          </div>
                        )}
                        
                        {question.type === 'OPEN_ENDED' && (
                          <div className="mb-3">
                            <div className="text-[16px] font-medium text-black mb-2">ღია კითხვა:</div>
                            <div className="text-[16px] text-black">
                              თქვენი პასუხი: {userAnswer || 'პასუხი არ მოცემულა'}
                            </div>
                          </div>
                        )}
                        
                        {question.type === 'TEXT_ANALYSIS' && (
                          <div className="mb-3">
                            <div className="text-[16px] text-black">
                              თქვენი პასუხი: {userAnswer || 'პასუხი არ მოცემულა'}
                            </div>
                          </div>
                        )}
                        
                        {question.type === 'MAP_ANALYSIS' && (
                          <div className="mb-3">
                            <div className="text-[16px] text-black">
                              თქვენი პასუხი: {userAnswer || 'პასუხი არ მოცემულა'}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
              
              <div className="mt-8 flex justify-center space-x-4">
                <button
                  onClick={resetTest}
                  className="bg-[#034e64] text-white px-6 py-2 rounded-md hover:bg-[#023a4d] transition-colors"
                >
                  ახალი ტესტი
                </button>
                <button
                  onClick={() => setShowResults(false)}
                  className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 transition-colors"
                >
                  კითხვების გადახედვა
                </button>
              </div>
            </div>
          </div>
        ) : (
          // Test View
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-black md:text-[22px] text-[18px]">
                  ტესტი
                </h2>
                <div className="text-[16px] text-black">
                  კითხვა {currentQuestionIndex + 1} 
                </div>
              </div>
            </div>
            
            <div className="p-6">
              {selectedQuestions.length > 0 && (
                <>
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[16px] text-black">
                       {currentQuestionIndex + 1}
                      </span>
                    
                    </div>
                    
                    {(selectedQuestions[currentQuestionIndex].type === 'TEXT_ANALYSIS' || selectedQuestions[currentQuestionIndex].type === 'MAP_ANALYSIS') ? (
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold text-black md:text-[18px] text-[16px] mb-4">
                          {selectedQuestions[currentQuestionIndex].type === 'TEXT_ANALYSIS' ? 'ტექსტი ანალიზისთვის:' : 'რუკის აღწერა ანალიზისთვის:'}
                        </h3>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                          <p className="text-black whitespace-pre-wrap leading-relaxed">
                            {selectedQuestions[currentQuestionIndex].text}
                          </p>
                        </div>
                        {selectedQuestions[currentQuestionIndex].image && selectedQuestions[currentQuestionIndex].image.length > 0 && (
                          <div className={`flex gap-2 ${
                            selectedQuestions[currentQuestionIndex].image.length === 1 
                              ? 'justify-center' 
                              : selectedQuestions[currentQuestionIndex].image.length === 2 
                                ? 'flex-row' 
                                : selectedQuestions[currentQuestionIndex].image.length === 4
                                  ? 'flex-wrap'
                                  : 'flex-wrap'
                          }`}>
                            {selectedQuestions[currentQuestionIndex].image.map((img, index) => (
                              <ImageModal 
                                key={index}
                                src={img} 
                                alt={`კითხვის სურათი ${index + 1}`} 
                                className={`object-contain rounded-lg border shadow-sm ${
                                  (selectedQuestions[currentQuestionIndex].image?.length ?? 0) === 1
                                    ? 'w-full max-w-full sm:max-w-4xl max-h-80 sm:max-h-96' 
                                    : (selectedQuestions[currentQuestionIndex].image?.length ?? 0) === 2 
                                      ? 'flex-1 max-h-80 sm:max-h-96' 
                                      : (selectedQuestions[currentQuestionIndex].image?.length ?? 0) === 4
                                        ? 'w-full sm:w-[calc(50%-4px)] max-h-80 sm:max-h-96'
                                        : (selectedQuestions[currentQuestionIndex].image?.length ?? 0) > 4
                                          ? 'w-full sm:w-[calc(50%-4px)] max-h-80 sm:max-h-96' 
                                          : 'w-full sm:w-[calc(50%-4px)] max-h-80 sm:max-h-96'
                                }`}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <>
                        <h3 className="text-lg font-semibold text-black md:text-[18px] text-[16px] mb-4">
                          {selectedQuestions[currentQuestionIndex].text}
                        </h3>
                        
                        {selectedQuestions[currentQuestionIndex].image && selectedQuestions[currentQuestionIndex].image.length > 0 && (
                          <div className={`flex gap-2 ${
                            selectedQuestions[currentQuestionIndex].image.length === 1 
                              ? 'justify-center' 
                              : selectedQuestions[currentQuestionIndex].image.length === 2 
                                ? 'flex-row' 
                                : selectedQuestions[currentQuestionIndex].image.length === 4
                                  ? 'flex-wrap'
                                  : 'flex-wrap'
                          }`}>
                            {selectedQuestions[currentQuestionIndex].image.map((img, index) => (
                              <ImageModal 
                                key={index}
                                src={img} 
                                alt={`კითხვის სურათი ${index + 1}`} 
                                className={`object-contain rounded-lg border shadow-sm ${
                                  (selectedQuestions[currentQuestionIndex].image?.length ?? 0) === 1
                                    ? 'w-full max-w-full sm:max-w-4xl max-h-80 sm:max-h-96' 
                                    : (selectedQuestions[currentQuestionIndex].image?.length ?? 0) === 2 
                                      ? 'flex-1 max-h-80 sm:max-h-96' 
                                      : (selectedQuestions[currentQuestionIndex].image?.length ?? 0) === 4
                                        ? 'w-full sm:w-[calc(50%-4px)] max-h-80 sm:max-h-96'
                                        : (selectedQuestions[currentQuestionIndex].image?.length ?? 0) > 4
                                          ? 'w-full sm:w-[calc(50%-4px)] max-h-80 sm:max-h-96' 
                                          : 'w-full sm:w-[calc(50%-4px)] max-h-80 sm:max-h-96'
                                }`}
                              />
                            ))}
                          </div>
                        )}
                      </>
                    )}
                    
                    <div className="space-y-2">
                      {selectedQuestions[currentQuestionIndex].type === 'MATCHING' ? (
                        // MATCHING Question
                        <div className="space-y-6">
                          <div className="text-[16px] text-black mb-4">
                            შეაერთეთ მარცხენა სვეტის ელემენტები მარჯვენა სვეტის შესაბამის ელემენტებთან
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Left Column */}
                            <div className="space-y-3">
                              <h3 className="font-semibold text-black mb-4">მარცხენა სვეტი</h3>
                              {(selectedQuestions[currentQuestionIndex].leftSide || selectedQuestions[currentQuestionIndex].matchingPairs)?.map((item, index) => (
                                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                  <span className="text-[16px] font-medium text-black min-w-[30px]">
                                  {currentQuestionIndex + 1}
                                  </span>
                                  <span className="text-black">
                                    {selectedQuestions[currentQuestionIndex].leftSide ? item.left : item.left}
                                  </span>
                                </div>
                              ))}
                            </div>

                            {/* Right Column */}
                            <div className="space-y-3">
                              <h3 className="font-semibold text-black mb-4">მარჯვენა სვეტი</h3>
                              {(selectedQuestions[currentQuestionIndex].rightSide || selectedQuestions[currentQuestionIndex].matchingPairs)?.map((item, index) => (
                                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                  <span className="text-[16px] font-medium text-black min-w-[30px]">
                                    {index + 1}:
                                  </span>
                                  <span className="text-black">
                                    {selectedQuestions[currentQuestionIndex].rightSide ? item.right : item.right}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Matching Interface */}
                          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                            <h4 className="font-medium text-black mb-2 text-[16px]">შესაბამისობა:</h4>
                            <div className="flex flex-wrap gap-2">
                              {(selectedQuestions[currentQuestionIndex].leftSide || selectedQuestions[currentQuestionIndex].matchingPairs)?.map((item, index) => (
                                <div key={index} className="flex flex-row items-center p-3 bg-white rounded-lg border-2 border-gray-200 hover:border-blue-300 transition-colors shadow-sm min-h-[60px] text-xs gap-3">
                                  
                                  <span className="text-black text-[16px] font-bold min-w-[30px] text-center">
                                    {numberToGeorgianQuestionNumber(index)}
                                  </span>
                                  
                                  <select
                                    value={userAnswers[`${selectedQuestions[currentQuestionIndex].id}_${index}`] || ''}
                                    onChange={(e) => handleAnswerChange(`${selectedQuestions[currentQuestionIndex].id}_${index}`, e.target.value)}
                                    disabled={answeredQuestions.has(selectedQuestions[currentQuestionIndex].id)}
                                    className={`px-3 text-[16px] py-2 border-2 border-gray-300 rounded-lg text-xs font-medium min-w-[80px] text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black placeholder:text-black ${
                                      answeredQuestions.has(selectedQuestions[currentQuestionIndex].id) 
                                        ? 'bg-gray-100 cursor-not-allowed opacity-60' 
                                        : 'bg-white hover:border-blue-400'
                                    }`}
                                  >
                                    <option className='text-black text-[16px]' value="">აირჩიეთ</option>
                                    {(selectedQuestions[currentQuestionIndex].rightSide || selectedQuestions[currentQuestionIndex].matchingPairs)?.map((rightItem, rightIndex) => (
                                      <option className='text-black text-[16px]' key={rightIndex} value={rightIndex + 1}>
                                        {rightIndex + 1}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : selectedQuestions[currentQuestionIndex].type === 'OPEN_ENDED' ? (
                        // OPEN_ENDED Question
                        <div className="p-4 bg-gray-100 rounded-lg">
                          <p className="text-black mb-2">ღია კითხვა - შეიყვანეთ პასუხი</p>
                          <textarea
                            placeholder="შეიყვანეთ თქვენი პასუხი..."
                            value={userAnswers[selectedQuestions[currentQuestionIndex].id] || ''}
                            onChange={(e) => handleAnswerChange(selectedQuestions[currentQuestionIndex].id, e.target.value)}
                            disabled={answeredQuestions.has(selectedQuestions[currentQuestionIndex].id)}
                            className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#034e64] text-black placeholder:text-black ${
                              answeredQuestions.has(selectedQuestions[currentQuestionIndex].id) 
                                ? 'bg-gray-100 cursor-not-allowed opacity-60' 
                                : ''
                            }`}
                            rows={4}
                          />
                        </div>
                      ) : selectedQuestions[currentQuestionIndex].type === 'CLOSED_ENDED' && selectedQuestions[currentQuestionIndex].imageOptions && selectedQuestions[currentQuestionIndex].imageOptions.filter(img => img && img.trim() !== '').length > 0 ? (
                        // CLOSED_ENDED Question with image options
                        <div className="grid grid-cols-2 gap-4">
                          {(shuffledOptions[`${selectedQuestions[currentQuestionIndex].id}_images`] || selectedQuestions[currentQuestionIndex].imageOptions.filter(img => img && img.trim() !== '')).map((imageUrl, index) => (
                            <label key={index} className={`flex flex-col items-center p-3 border border-gray-200 rounded-lg ${
                              answeredQuestions.has(selectedQuestions[currentQuestionIndex].id)
                                ? 'bg-gray-100 cursor-not-allowed opacity-60'
                                : 'hover:bg-gray-50 cursor-pointer'
                            }`}>
                              <input
                                type="radio"
                                name={`question_${selectedQuestions[currentQuestionIndex].id}`}
                                value={imageUrl}
                                checked={userAnswers[selectedQuestions[currentQuestionIndex].id] === imageUrl}
                                onChange={(e) => handleAnswerChange(selectedQuestions[currentQuestionIndex].id, e.target.value)}
                                disabled={answeredQuestions.has(selectedQuestions[currentQuestionIndex].id)}
                                className={`h-4 w-4 text-black focus:ring-[#034e64] border-gray-300 mb-2 ${
                                  answeredQuestions.has(selectedQuestions[currentQuestionIndex].id) 
                                    ? 'cursor-not-allowed opacity-60' 
                                    : ''
                                }`}
                              />
                              <ImageModal 
                                src={imageUrl} 
                                alt={`ვარიანტი ${index + 1}`}
                                className="w-full h-32 sm:h-36 md:h-40 object-cover rounded border"
                              />
                            </label>
                          ))}
                        </div>
                      ) : selectedQuestions[currentQuestionIndex].type === 'CLOSED_ENDED' && selectedQuestions[currentQuestionIndex].options && selectedQuestions[currentQuestionIndex].options.length > 0 ? (
                        // CLOSED_ENDED Question with text options
                        (shuffledOptions[selectedQuestions[currentQuestionIndex].id] || selectedQuestions[currentQuestionIndex].options).map((option, index) => (
                          <label key={index} className={`flex items-center p-3 border border-gray-200 rounded-lg ${
                            answeredQuestions.has(selectedQuestions[currentQuestionIndex].id)
                              ? 'bg-gray-100 cursor-not-allowed opacity-60'
                              : 'hover:bg-gray-50 cursor-pointer'
                          }`}>
                            <input
                              type="radio"
                              name={`question_${selectedQuestions[currentQuestionIndex].id}`}
                              value={option}
                              checked={userAnswers[selectedQuestions[currentQuestionIndex].id] === option}
                              onChange={(e) => handleAnswerChange(selectedQuestions[currentQuestionIndex].id, e.target.value)}
                              disabled={answeredQuestions.has(selectedQuestions[currentQuestionIndex].id)}
                              className={`h-4 w-4 text-[#034e64] focus:ring-[#034e64] border-gray-300 ${
                                answeredQuestions.has(selectedQuestions[currentQuestionIndex].id) 
                                  ? 'cursor-not-allowed opacity-60' 
                                  : ''
                              }`}
                            />
                            <span className="ml-3 text-black md:text-[16px] text-[14px]">{option}</span>
                          </label>
                        ))
                      ) : (selectedQuestions[currentQuestionIndex].type === 'TEXT_ANALYSIS' || selectedQuestions[currentQuestionIndex].type === 'MAP_ANALYSIS') ? (
                        // TEXT_ANALYSIS and MAP_ANALYSIS Questions
                        <div className="space-y-4">
                          {/* Main Analysis Input */}
                         

                          {selectedQuestions[currentQuestionIndex].subQuestions && selectedQuestions[currentQuestionIndex].subQuestions.length > 0 ? (
                            <>
                              {/* Sub-questions */}
                              <div className="bg-white border border-black rounded-lg p-4 mb-4">
                                <h4 className="font-semibold text-black mb-2">
                                  {selectedQuestions[currentQuestionIndex].type === 'TEXT_ANALYSIS' ? 'ქვეკითხვები ტექსტის ანალიზისთვის:' : 'ქვეკითხვები ანალიზისთვის:'}
                                </h4>
                                <p className="text-[16px] text-black">
                                  ქვემოთ მოცემული ქვეკითხვებისთვის პასუხი გაეცით ზემოთ მოცემული ტექსტის/რუკის საფუძველზე
                                </p>
                              </div>
                              {selectedQuestions[currentQuestionIndex].subQuestions.map((subQuestion, subIndex) => (
                            <div key={subQuestion.id} className="border border-black rounded-lg p-4 bg-white">
                              <h4 className="font-medium text-black mb-3">
                                {subIndex + 1}. {subQuestion.text}
                              </h4>
                              
                              {subQuestion.image && (
                                <div className="mb-3">
                                  <img 
                                    src={subQuestion.image} 
                                    alt="Sub-question image" 
                                    className="w-full max-w-full h-auto rounded-lg"
                                  />
                                </div>
                              )}

                              {subQuestion.type === 'CLOSED_ENDED' && subQuestion.options && subQuestion.options.filter(opt => opt.trim() !== '').length > 0 ? (
                                <div className="space-y-2 bg-white border border-black rounded-lg p-4">
                                  {subQuestion.options.filter(opt => opt.trim() !== '').map((option, optionIndex) => (
                                    <label key={optionIndex} className="flex items-center">
                                      <input
                                        type="radio"
                                        name={`subquestion-${selectedQuestions[currentQuestionIndex].id}-${subQuestion.id}`}
                                        value={option}
                                        checked={userAnswers[`${selectedQuestions[currentQuestionIndex].id}_${subQuestion.id}`] === option}
                                        onChange={(e) => handleAnswerChange(`${selectedQuestions[currentQuestionIndex].id}_${subQuestion.id}`, e.target.value)}
                                        disabled={answeredQuestions.has(selectedQuestions[currentQuestionIndex].id)}
                                        className={`h-4 w-4 text-[#034e64] focus:ring-[#034e64] border-gray-300 ${
                                          answeredQuestions.has(selectedQuestions[currentQuestionIndex].id) 
                                            ? 'cursor-not-allowed opacity-60' 
                                            : ''
                                        }`}
                                      />
                                      <span className="ml-2 text-black">{option}</span>
                                    </label>
                                  ))}
                                </div>
                              ) : (
                                <textarea
                                  value={userAnswers[`${selectedQuestions[currentQuestionIndex].id}_${subQuestion.id}`] || ''}
                                  onChange={(e) => handleAnswerChange(`${selectedQuestions[currentQuestionIndex].id}_${subQuestion.id}`, e.target.value)}
                                  disabled={answeredQuestions.has(selectedQuestions[currentQuestionIndex].id)}
                                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#034e64] text-black placeholder:text-black ${
                                    answeredQuestions.has(selectedQuestions[currentQuestionIndex].id) 
                                      ? 'bg-gray-100 cursor-not-allowed opacity-60' 
                                      : ''
                                  }`}
                                  rows={3}
                                  placeholder="შეიყვანეთ თქვენი პასუხი..."
                                />
                              )}
                            </div>
                              ))}
                            </>
                          ) : null}
                        </div>
                      ) : (
                        // Fallback for other question types
                        <div className="p-4 bg-gray-100 rounded-lg">
                          <p className="text-black">ამ კითხვის ტიპისთვის პასუხის ვარიანტები არ არის განსაზღვრული</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <button
                      onClick={previousQuestion}
                      disabled={currentQuestionIndex === 0}
                      className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      წინა
                    </button>
                    
                    <div className="flex space-x-2">
                      {selectedQuestions.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentQuestionIndex(index)}
                          className={`w-8 h-8 rounded-full text-[16px] font-medium transition-colors ${
                            index === currentQuestionIndex
                              ? 'bg-[#034e64] text-white'
                              : userAnswers[selectedQuestions[index].id]
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-200 text-black hover:bg-gray-300'
                          }`}
                        >
                         {index + 1}
                        </button>
                      ))}
                    </div>
                    
                    {currentQuestionIndex === selectedQuestions.length - 1 ? (
                      <button
                        onClick={finishTest}
                        className="bg-[#034e64] text-white px-4 py-2 rounded-md hover:bg-[#023a4d] transition-colors"
                      >
                        დასრულება
                      </button>
                    ) : (
                      <button
                        onClick={nextQuestion}
                        className="bg-[#034e64] text-white px-4 py-2 rounded-md hover:bg-[#023a4d] transition-colors"
                      >
                        შემდეგი
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function TestQuestionsPage() {
  return (
    <AdminOnly>
      <TestQuestionsContent />
    </AdminOnly>
  )
}
