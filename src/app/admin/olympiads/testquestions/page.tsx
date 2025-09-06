'use client'

import { useAuth } from '@/hooks/useAuth'
import { AdminOnly } from '@/components/auth/ProtectedRoute'
import Link from 'next/link'
import { useState, useEffect } from 'react'

interface Question {
  id: string
  text: string
  type: string
  options: string[]
  correctAnswer: string | null
  explanation: string | null
  points: number
  matchingPairs: Array<{left: string, right: string}> | null
  subject: {
    name: string
  }
  grade: number
  createdByTeacher?: {
    name: string
    lastname: string
  }
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

  const handleQuestionSelect = (questions: Question[]) => {
    setSelectedQuestions(questions)
    setCurrentQuestionIndex(0)
    setUserAnswers({})
    setShowResults(false)
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
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }))
  }

  const nextQuestion = () => {
    if (currentQuestionIndex < selectedQuestions.length - 1) {
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
        // For MATCHING questions, check each pair
        if (question.matchingPairs && question.matchingPairs.length > 0) {
          let pairCorrect = 0
          question.matchingPairs.forEach((_, pairIndex) => {
            const userAnswerKey = `${question.id}_${pairIndex}`
            const userAnswerValue = userAnswers[userAnswerKey]
            const correctAnswerIndex = pairIndex // For matching, correct answer is usually the same index
            if (userAnswerValue === correctAnswerIndex.toString()) {
              pairCorrect++
            }
          })
          // Count as correct if all pairs are correct
          if (pairCorrect === question.matchingPairs.length) {
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
    <div className="min-h-screen bg-gray-50">
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
                  <p className="text-gray-500 md:text-[18px] text-[16px]">კითხვები ვერ მოიძებნა</p>
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">საგანი</label>
                        <select
                          value={selectedSubject}
                          onChange={(e) => setSelectedSubject(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#034e64]"
                        >
                          <option value="">ყველა საგანი</option>
                          {getAvailableSubjects().map(subject => (
                            <option key={subject} value={subject}>{subject}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">კლასი</label>
                        <select
                          value={selectedGrade}
                          onChange={(e) => setSelectedGrade(e.target.value ? parseInt(e.target.value) : '')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#034e64]"
                        >
                          <option value="">ყველა კლასი</option>
                          {getAvailableGrades().map(grade => (
                            <option key={grade} value={grade}>{grade} კლასი</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">კითხვის ტიპი</label>
                        <select
                          value={selectedQuestionType}
                          onChange={(e) => setSelectedQuestionType(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#034e64]"
                        >
                          <option value="">ყველა ტიპი</option>
                          {getAvailableQuestionTypes().map(type => (
                            <option key={type} value={type}>{getQuestionTypeLabel(type)}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    <div className="mt-4 text-sm text-gray-600">
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
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                      >
                        შემთხვევითი 20
                      </button>
                      <button
                        onClick={() => handleSelectRandom(50)}
                        disabled={filteredQuestions.length === 0}
                        className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
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
                                  <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                    {getQuestionTypeLabel(question.type)}
                                  </span>
                                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                    {question.subject.name}
                                  </span>
                                  <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                                    {question.grade} კლასი
                                  </span>
                                </div>
                                <p className="text-sm text-gray-700 line-clamp-2">{question.text}</p>
                              </div>
                              <button
                                onClick={() => handleQuestionSelect([question])}
                                className="ml-3 bg-[#034e64] text-white px-3 py-1 rounded text-sm hover:bg-[#023a4d] transition-colors"
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
              <div className="text-center mb-8">
                <div className="inline-block bg-blue-100 rounded-full p-6">
                  <div className="text-4xl font-bold text-blue-600">
                    {calculateScore().percentage}%
                  </div>
                  <div className="text-sm text-blue-600 mt-2">
                    {calculateScore().correct} / {calculateScore().total} სწორი პასუხი
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                {selectedQuestions.map((question, index) => {
                  const userAnswer = userAnswers[question.id]
                  let isCorrect = false
                  
                  if (question.type === 'MATCHING') {
                    // For MATCHING questions, check if all pairs are correct
                    if (question.matchingPairs && question.matchingPairs.length > 0) {
                      let pairCorrect = 0
                      question.matchingPairs.forEach((_, pairIndex) => {
                        const userAnswerKey = `${question.id}_${pairIndex}`
                        const userAnswerValue = userAnswers[userAnswerKey]
                        const correctAnswerIndex = pairIndex
                        if (userAnswerValue === correctAnswerIndex.toString()) {
                          pairCorrect++
                        }
                      })
                      isCorrect = pairCorrect === question.matchingPairs.length
                    }
                  } else {
                    // For other question types
                    isCorrect = question.correctAnswer ? userAnswer === question.correctAnswer : false
                  }
                  
                  return (
                    <div key={question.id} className={`border rounded-lg p-4 ${isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-black md:text-[16px] text-[14px]">
                          კითხვა {index + 1}
                        </h4>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${isCorrect ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                          {isCorrect ? 'სწორი' : 'არასწორი'}
                        </span>
                      </div>
                      
                      <p className="text-gray-700 mb-3">{question.text}</p>
                      
                      {question.type === 'MATCHING' ? (
                        // MATCHING Question Results
                        <div className="space-y-3">
                          {question.matchingPairs && question.matchingPairs.length > 0 ? (
                            question.matchingPairs.map((pair, pairIndex) => {
                              const userAnswerKey = `${question.id}_${pairIndex}`
                              const userAnswerValue = userAnswers[userAnswerKey]
                              const correctAnswerIndex = pairIndex // For matching, correct answer is usually the same index
                              const isCorrect = userAnswerValue === correctAnswerIndex.toString()
                              
                              return (
                                <div key={pairIndex} className={`p-3 rounded-lg ${isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                      <span className="text-sm font-medium text-gray-700">{pair.left}</span>
                                      <span className="text-gray-400">→</span>
                                      <span className="text-sm text-gray-600">{pair.right}</span>
                                    </div>
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${isCorrect ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                                      {isCorrect ? 'სწორი' : 'არასწორი'}
                                    </span>
                                  </div>
                                  {userAnswerValue && (
                                    <div className="mt-2 text-xs text-gray-600">
                                      თქვენი არჩევანი: {question.matchingPairs![parseInt(userAnswerValue)]?.right || 'უცნობი'}
                                    </div>
                                  )}
                                </div>
                              )
                            })
                          ) : (
                            <div className="p-3 bg-gray-100 rounded-lg">
                              <p className="text-gray-600">ამ შესაბამისობის კითხვას არ აქვს წყვილები</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        // Other Question Types Results
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <strong className="text-green-700">სწორი პასუხი:</strong>
                            <p className="text-green-600">{question.correctAnswer || 'პასუხი არ არის მითითებული'}</p>
                          </div>
                          <div>
                            <strong className="text-blue-700">თქვენი პასუხი:</strong>
                            <p className="text-blue-600">{userAnswer || 'პასუხი არ არის მოცემული'}</p>
                          </div>
                        </div>
                      )}
                      
                      {question.explanation && (
                        <div className="mt-3 p-3 bg-gray-100 rounded">
                          <strong className="text-gray-700">განმარტება:</strong>
                          <p className="text-gray-600 mt-1">{question.explanation}</p>
                        </div>
                      )}
                    </div>
                  )
                })}
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
                <div className="text-sm text-gray-500">
                  კითხვა {currentQuestionIndex + 1} / {selectedQuestions.length}
                </div>
              </div>
            </div>
            
            <div className="p-6">
              {selectedQuestions.length > 0 && (
                <>
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-500">
                        {getQuestionTypeLabel(selectedQuestions[currentQuestionIndex].type)}
                      </span>
                      <span className="text-sm text-gray-500">
                        {selectedQuestions[currentQuestionIndex].points} ქულა
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-black md:text-[18px] text-[16px] mb-4">
                      {selectedQuestions[currentQuestionIndex].text}
                    </h3>
                    
                    <div className="space-y-2">
                      {selectedQuestions[currentQuestionIndex].type === 'MATCHING' ? (
                        // MATCHING Question
                        <div className="space-y-4">
                          {selectedQuestions[currentQuestionIndex].matchingPairs && selectedQuestions[currentQuestionIndex].matchingPairs!.length > 0 ? (
                            selectedQuestions[currentQuestionIndex].matchingPairs!.map((pair, index) => (
                              <div key={index} className="flex items-center space-x-4 p-3 border border-gray-200 rounded-lg">
                                <div className="flex-1 text-sm font-medium text-gray-700">
                                  {pair.left}
                                </div>
                                <div className="text-gray-400">→</div>
                                <select
                                  value={userAnswers[`${selectedQuestions[currentQuestionIndex].id}_${index}`] || ''}
                                  onChange={(e) => handleAnswerChange(`${selectedQuestions[currentQuestionIndex].id}_${index}`, e.target.value)}
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#034e64]"
                                >
                                  <option value="">აირჩიეთ...</option>
                                  {selectedQuestions[currentQuestionIndex].matchingPairs!.map((_, rightIndex) => (
                                    <option key={rightIndex} value={rightIndex}>
                                      {selectedQuestions[currentQuestionIndex].matchingPairs![rightIndex].right}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            ))
                          ) : (
                            <div className="p-4 bg-gray-100 rounded-lg">
                              <p className="text-gray-600">ამ შესაბამისობის კითხვას არ აქვს წყვილები</p>
                            </div>
                          )}
                        </div>
                      ) : selectedQuestions[currentQuestionIndex].options && selectedQuestions[currentQuestionIndex].options.length > 0 ? (
                        // CLOSED_ENDED Question with options
                        selectedQuestions[currentQuestionIndex].options.map((option, index) => (
                          <label key={index} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                            <input
                              type="radio"
                              name={`question_${selectedQuestions[currentQuestionIndex].id}`}
                              value={option}
                              checked={userAnswers[selectedQuestions[currentQuestionIndex].id] === option}
                              onChange={(e) => handleAnswerChange(selectedQuestions[currentQuestionIndex].id, e.target.value)}
                              className="h-4 w-4 text-[#034e64] focus:ring-[#034e64] border-gray-300"
                            />
                            <span className="ml-3 text-black md:text-[16px] text-[14px]">{option}</span>
                          </label>
                        ))
                      ) : (
                        // OPEN_ENDED Question
                        <div className="p-4 bg-gray-100 rounded-lg">
                          <p className="text-gray-600">ღია კითხვა - შეიყვანეთ პასუხი</p>
                          <input
                            type="text"
                            placeholder="შეიყვანეთ პასუხი..."
                            value={userAnswers[selectedQuestions[currentQuestionIndex].id] || ''}
                            onChange={(e) => handleAnswerChange(selectedQuestions[currentQuestionIndex].id, e.target.value)}
                            className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#034e64]"
                          />
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
                          className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                            index === currentQuestionIndex
                              ? 'bg-[#034e64] text-white'
                              : userAnswers[selectedQuestions[index].id]
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
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
