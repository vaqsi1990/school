'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

interface Question {
  id: string
  question: string
  type: string
  options?: string[]
  correctAnswer: string
  explanation?: string
}

interface TestResult {
  id: string
  score: number
  totalQuestions: number
  completedAt: string
  subject: string
}

interface Subject {
  id: string
  name: string
}

const StudentSubjectPage = ({ params }: { params: Promise<{ subjectId: string }> }) => {
  const router = useRouter()
  const { data: session } = useSession()
  const [subjectId, setSubjectId] = useState<string>('')
  const [subjectName, setSubjectName] = useState<string>('')
  const [studentGrade, setStudentGrade] = useState<number | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({})
  const [showResults, setShowResults] = useState(false)
  const [score, setScore] = useState(0)
  const [totalQuestions, setTotalQuestions] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [testStarted, setTestStarted] = useState(false)
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [loadingResults, setLoadingResults] = useState(true)

  useEffect(() => {
    const initializePage = async () => {
      const resolvedParams = await params
      setSubjectId(resolvedParams.subjectId)
      
      // Get student's grade from session
      if (session?.user?.student?.grade) {
        setStudentGrade(session.user.student.grade)
      }
      
      // Fetch subject name
      try {
        const response = await fetch('/api/subjects')
        if (response.ok) {
          const data = await response.json()
          const subject = data.subjects.find((s: Subject) => s.id === resolvedParams.subjectId)
          if (subject) {
            setSubjectName(subject.name)
          }
        }
      } catch (error) {
        console.error('Error fetching subject:', error)
      }
      
      // Fetch test results for this subject
      fetchTestResults(resolvedParams.subjectId)
    }
    
    initializePage()
  }, [params, session])

  const fetchTestResults = async (subjectId: string) => {
    try {
      setLoadingResults(true)
      // This would be an API call to get student's test results for this subject
      // For now, we'll simulate with empty results
      setTestResults([])
    } catch (error) {
      console.error('Error fetching test results:', error)
    } finally {
      setLoadingResults(false)
    }
  }

  const startTest = async () => {
    if (!studentGrade) {
      alert('თქვენი კლასი ვერ მოიძებნა. გთხოვთ, განაახლეთ პროფილი.')
      return
    }

    try {
      setIsLoading(true)
      const response = await fetch(`/api/test/public-questions?subjectId=${subjectId}&grade=${studentGrade}`)
      
      if (response.ok) {
        const data = await response.json()
        if (data.questions && data.questions.length > 0) {
          setQuestions(data.questions)
          setTotalQuestions(data.questions.length)
          setTestStarted(true)
          setCurrentQuestionIndex(0)
          setUserAnswers({})
          setShowResults(false)
        } else {
          alert('ამ საგნისა და კლასისთვის კითხვები ჯერ არ არის დამატებული')
        }
      } else {
        const errorData = await response.json()
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
      if (userAnswer === question.correctAnswer) {
        correctAnswers++
      }
    })
    
    setScore(correctAnswers)
    setShowResults(true)
  }

  const resetTest = () => {
    setTestStarted(false)
    setQuestions([])
    setCurrentQuestionIndex(0)
    setUserAnswers({})
    setShowResults(false)
    setScore(0)
    setTotalQuestions(0)
  }

  const renderQuestion = (question: Question) => {
    switch (question.type) {
      case 'MULTIPLE_CHOICE':
        return (
          <div className="space-y-3">
            {question.options?.map((option, index) => (
              <label key={index} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={option}
                  checked={userAnswers[question.id] === option}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  className="w-4 h-4 text-[#034e64]"
                />
                <span className="text-black text-[16px]">{option}</span>
              </label>
            ))}
          </div>
        )
      case 'TRUE_FALSE':
        return (
          <div className="space-y-3">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name={`question-${question.id}`}
                value="true"
                checked={userAnswers[question.id] === 'true'}
                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                className="w-4 h-4 text-[#034e64]"
              />
              <span className="text-black text-[16px]">მართალი</span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name={`question-${question.id}`}
                value="false"
                checked={userAnswers[question.id] === 'false'}
                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                className="w-4 h-4 text-[#034e64]"
              />
              <span className="text-black text-[16px]">მცდარი</span>
            </label>
          </div>
        )
      default:
        return (
          <div>
            <input
              type="text"
              value={userAnswers[question.id] || ''}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md text-black text-[16px]"
              placeholder="შეიყვანეთ პასუხი..."
            />
          </div>
        )
    }
  }

  const getResultMessage = (score: number, total: number) => {
    const percentage = (score / total) * 100
    if (percentage >= 90) return 'შესანიშნავი! ძალიან კარგი შედეგი!'
    if (percentage >= 80) return 'კარგი! კარგი შედეგი!'
    if (percentage >= 70) return 'საშუალო. კიდევ ცოტა ვარჯიში საჭიროა.'
    if (percentage >= 60) return 'საშუალოზე დაბალი. მეტი ვარჯიში საჭიროა.'
    return 'ცუდი შედეგი. უნდა უფრო მეტად ივარჯიშოთ.'
  }

  if (!subjectId || !studentGrade) {
    return (
      <div className="bg-gray-50 min-h-screen py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#034e64] mx-auto mb-4"></div>
          <p className="text-black text-[16px]">მონაცემების ჩატვირთვა...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Back Button */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <button
            onClick={() => router.back()}
            className="flex items-center text-[#034e64] hover:text-[#023a4d] transition-colors mb-6"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-[16px] font-bold">უკან დაბრუნება</span>
          </button>
        </motion.div>

        {/* Header */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h1 className="text-3xl font-bold text-black mb-4">{subjectName}</h1>
          <p className="text-black text-[16px]">კლასი: {studentGrade}</p>
        </motion.div>

        {!testStarted ? (
          <div className="space-y-8">
            {/* Start Test Section */}
            <motion.div
              className="bg-white rounded-lg shadow-lg p-8 text-center"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl font-bold text-black mb-4">ტესტის დაწყება</h2>
              <p className="text-black text-[16px] mb-6">
                დაიწყეთ ტესტი {subjectName} საგანში თქვენი კლასისთვის ({studentGrade} კლასი)
              </p>
              <button
                onClick={startTest}
                disabled={isLoading}
                className="bg-[#034e64] text-white px-8 py-3 rounded-md text-[16px] font-bold transition-colors hover:bg-[#023a4d] disabled:opacity-50"
              >
                {isLoading ? 'ტესტის ჩატვირთვა...' : 'ტესტის დაწყება'}
              </button>
            </motion.div>

            {/* Test Results Section */}
            <motion.div
              className="bg-white rounded-lg shadow-lg p-8"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl font-bold text-black mb-6">შედეგები</h2>
              {loadingResults ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#034e64] mx-auto mb-4"></div>
                  <p className="text-black text-[16px]">შედეგების ჩატვირთვა...</p>
                </div>
              ) : testResults.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-black text-[16px]">ჯერ არ გაქვთ გავლილი ტესტები</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {testResults.map((result) => (
                    <div key={result.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-black text-[16px] font-medium">{result.subject}</p>
                          <p className="text-gray-600 text-sm">
                            {new Date(result.completedAt).toLocaleDateString('ka-GE')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-black text-[16px] font-bold">
                            {result.score}/{result.totalQuestions}
                          </p>
                          <p className="text-gray-600 text-sm">
                            {Math.round((result.score / result.totalQuestions) * 100)}%
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        ) : (
          /* Test Interface */
          <div className="bg-white rounded-lg shadow-lg p-8">
            {!showResults ? (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-black">
                    კითხვა {currentQuestionIndex + 1} / {totalQuestions}
                  </h2>
                  <div className="text-sm text-gray-600">
                    პროგრესი: {Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100)}%
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-black mb-4">
                    {questions[currentQuestionIndex]?.question}
                  </h3>
                  {questions[currentQuestionIndex] && renderQuestion(questions[currentQuestionIndex])}
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={previousQuestion}
                    disabled={currentQuestionIndex === 0}
                    className="bg-gray-500 text-white px-4 py-2 rounded-md text-[16px] font-bold transition-colors hover:bg-gray-600 disabled:opacity-50"
                  >
                    წინა
                  </button>
                  
                  {currentQuestionIndex === questions.length - 1 ? (
                    <button
                      onClick={finishTest}
                      className="bg-[#034e64] text-white px-6 py-2 rounded-md text-[16px] font-bold transition-colors hover:bg-[#023a4d]"
                    >
                      დასრულება
                    </button>
                  ) : (
                    <button
                      onClick={nextQuestion}
                      className="bg-[#034e64] text-white px-4 py-2 rounded-md text-[16px] font-bold transition-colors hover:bg-[#023a4d]"
                    >
                      შემდეგი
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* Results */
              <div className="text-center">
                <h2 className="text-2xl font-bold text-black mb-6">ტესტის შედეგები</h2>
                
                <div className="mb-8">
                  <div className="relative w-32 h-32 mx-auto mb-4">
                    <svg className="w-32 h-32 transform -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="#e5e7eb"
                        strokeWidth="8"
                        fill="none"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="#034e64"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 56}`}
                        strokeDashoffset={`${2 * Math.PI * 56 * (1 - score / totalQuestions)}`}
                        className="transition-all duration-1000 ease-out"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold text-black">
                        {Math.round((score / totalQuestions) * 100)}%
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-xl font-semibold text-black mb-2">
                    {score} / {totalQuestions} სწორი პასუხი
                  </p>
                  <p className="text-black text-[16px] mb-6">
                    {getResultMessage(score, totalQuestions)}
                  </p>
                </div>

                <div className="space-x-4">
                  <button
                    onClick={resetTest}
                    className="bg-[#034e64] text-white px-6 py-2 rounded-md text-[16px] font-bold transition-colors hover:bg-[#023a4d]"
                  >
                    ხელახლა ცდა
                  </button>
                  <button
                    onClick={() => router.back()}
                    className="bg-gray-500 text-white px-6 py-2 rounded-md text-[16px] font-bold transition-colors hover:bg-gray-600"
                  >
                    დაბრუნება
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default StudentSubjectPage
