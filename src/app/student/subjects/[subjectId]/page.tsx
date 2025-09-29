'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

interface Question {
  id: string
  question: string
  type: string
  options?: string[]
  correctAnswer: string
  explanation?: string
}


interface Subject {
  id: string
  name: string
}

interface OlympiadResult {
  id: string
  olympiadId: string
  olympiadTitle: string
  score: number
  maxScore: number
  percentage: number
  totalQuestions: number
  completedAt: string
  status: string
}

interface Olympiad {
  id: string
  title: string
  description: string
  startDate: string
  endDate: string
  registrationStartDate: string
  registrationDeadline: string
  subjects: string[]
  grades: number[]
  status: 'upcoming' | 'active' | 'completed'
  isRegistered: boolean
  registrationStatus?: 'REGISTERED' | 'IN_PROGRESS' | 'COMPLETED' | 'DISQUALIFIED'
  isRegistrationOpen: boolean
}

const StudentSubjectPage = ({ params }: { params: Promise<{ subjectId: string }> }) => {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
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
  const [olympiadResults, setOlympiadResults] = useState<OlympiadResult[]>([])
  const [loadingResults, setLoadingResults] = useState(true)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [olympiads, setOlympiads] = useState<Olympiad[]>([])
  const [loadingOlympiads, setLoadingOlympiads] = useState(true)
  const [registrationStatus, setRegistrationStatus] = useState<{[key: string]: 'idle' | 'loading' | 'success' | 'error'}>({})
  const [showAppealForm, setShowAppealForm] = useState(false)
  const [selectedResultForAppeal, setSelectedResultForAppeal] = useState<OlympiadResult | null>(null)
  const [appealReason, setAppealReason] = useState('')
  const [appealDescription, setAppealDescription] = useState('')
  const [submittingAppeal, setSubmittingAppeal] = useState(false)

  const initializePage = React.useCallback(async () => {
    const resolvedParams = await params
    setSubjectId(resolvedParams.subjectId)
    
    // Get student's grade from user
    if (user?.student?.grade) {
      setStudentGrade(user.student.grade)
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
      setError('საგნის მონაცემების ჩატვირთვა ვერ მოხერხდა')
    }
    
    // Fetch olympiad results for this subject (will be called after subjectName is set)
  }, [params, user])

  const fetchOlympiadResults = React.useCallback(async (subjectName: string) => {
    try {
      setLoadingResults(true)
      setError('')
      
      // Fetch olympiad results for this specific subject
      const response = await fetch(`/api/student/olympiad-results-by-subject?subjectName=${encodeURIComponent(subjectName)}`)
      
      if (response.ok) {
        const data = await response.json()
        setOlympiadResults(data.results || [])
      } else {
        const errorData = await response.json()
        console.error('Error fetching olympiad results:', errorData.error)
        setOlympiadResults([])
      }
    } catch (error) {
      console.error('Error fetching olympiad results:', error)
      setOlympiadResults([])
    } finally {
      setLoadingResults(false)
    }
  }, [])

  const fetchOlympiadsForSubject = React.useCallback(async (subjectId: string) => {
    try {
      setLoadingOlympiads(true)
      setError('')
      
      const response = await fetch('/api/student/olympiads')
      
      if (response.ok) {
        const data = await response.json()
        console.log('All olympiads:', data.olympiads)
        console.log('Current subject name:', subjectName)
        console.log('Student grade:', studentGrade)
        
        // Filter olympiads that include this subject and student's grade, and exclude completed ones
        const subjectOlympiads = data.olympiads.filter((olympiad: Olympiad) => {
          const hasSubject = olympiad.subjects.includes(subjectName)
          const hasGrade = olympiad.grades.includes(studentGrade || 0)
          const isNotCompleted = olympiad.status !== 'completed'
          console.log(`Olympiad ${olympiad.title}:`, {
            subjects: olympiad.subjects,
            grades: olympiad.grades,
            status: olympiad.status,
            hasSubject,
            hasGrade,
            isNotCompleted,
            matches: hasSubject && hasGrade && isNotCompleted
          })
          return hasSubject && hasGrade && isNotCompleted
        })
        
        console.log('Filtered olympiads:', subjectOlympiads)
        setOlympiads(subjectOlympiads)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'ოლიმპიადების ჩატვირთვა ვერ მოხერხდა')
        setOlympiads([])
      }
    } catch (error) {
      console.error('Error fetching olympiads:', error)
      setError('ოლიმპიადების ჩატვირთვა ვერ მოხერხდა')
      setOlympiads([])
    } finally {
      setLoadingOlympiads(false)
    }
  }, [subjectName, studentGrade])

  useEffect(() => {
    if (isAuthenticated && user?.userType === 'STUDENT') {
      initializePage()
    }
  }, [isAuthenticated, user, params, initializePage])

  // Fetch olympiads and results when subject name and student grade are available
  useEffect(() => {
    if (subjectName && studentGrade && subjectId) {
      fetchOlympiadsForSubject(subjectId)
      fetchOlympiadResults(subjectName)
    }
  }, [subjectName, studentGrade, subjectId, fetchOlympiadsForSubject, fetchOlympiadResults])

  const startTest = async () => {
    if (!studentGrade) {
      setError('თქვენი კლასი ვერ მოიძებნა. გთხოვთ, განაახლეთ პროფილი.')
      return
    }

    try {
      setIsLoading(true)
      setError('')
      setSuccessMessage('')
      
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
          setSuccessMessage('ტესტი წარმატებით დაიწყო!')
        } else {
          setError('ამ საგნისა და კლასისთვის კითხვები ჯერ არ არის დამატებული')
        }
      } else {
        const errorData = await response.json()
        setError(`ტესტის ჩატვირთვა ვერ მოხერხდა: ${errorData.error || 'უცნობი შეცდომა'}`)
      }
    } catch (error) {
      console.error('Error starting test:', error)
      setError('ტესტის ჩატვირთვა ვერ მოხერხდა')
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

  const handleOlympiadRegistration = async (olympiadId: string) => {
    try {
      console.log('Starting registration for olympiad:', olympiadId)
      setRegistrationStatus(prev => ({ ...prev, [olympiadId]: 'loading' }))
      setError('')
      setSuccessMessage('')

      const response = await fetch('/api/student/olympiads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ olympiadId }),
      })

      console.log('Registration response status:', response.status)
      const result = await response.json()
      console.log('Registration response data:', result)

      if (response.ok) {
        setRegistrationStatus(prev => ({ ...prev, [olympiadId]: 'success' }))
        setSuccessMessage(result.message)
        
        // Refresh olympiads list
        setTimeout(() => {
          fetchOlympiadsForSubject(subjectId)
        }, 2000)
      } else {
        setRegistrationStatus(prev => ({ ...prev, [olympiadId]: 'error' }))
        setError(result.error || 'რეგისტრაცია ვერ მოხერხდა')
      }
    } catch (err) {
      console.error('Error registering for olympiad:', err)
      setRegistrationStatus(prev => ({ ...prev, [olympiadId]: 'error' }))
      setError('რეგისტრაცია ვერ მოხერხდა')
    }
  }

  const handleStartOlympiad = async (olympiadId: string) => {
    try {
      setError('')
      setSuccessMessage('')

      // Redirect to olympiad page
      router.push(`/student/olympiads/${olympiadId}`)
      
    } catch (err) {
      console.error('Error starting olympiad:', err)
      setError('ოლიმპიადის დაწყება ვერ მოხერხდა')
    }
  }

  const handleAppealClick = (result: OlympiadResult) => {
    setSelectedResultForAppeal(result)
    setShowAppealForm(true)
    setAppealReason('')
    setAppealDescription('')
  }

  const handleAppealSubmit = async () => {
    if (!selectedResultForAppeal || !appealReason || !appealDescription.trim()) {
      setError('გთხოვთ, შეავსოთ ყველა ველი')
      return
    }

    try {
      setSubmittingAppeal(true)
      setError('')
      setSuccessMessage('')

      const response = await fetch('/api/student/appeal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resultId: selectedResultForAppeal.id,
          reason: appealReason,
          description: appealDescription,
          subjectId: subjectId
        }),
      })

      const result = await response.json()

      if (response.ok) {
        setSuccessMessage('გასაჩივრება წარმატებით გაიგზავნა!')
        setShowAppealForm(false)
        setSelectedResultForAppeal(null)
        setAppealReason('')
        setAppealDescription('')
      } else {
        setError(result.error || 'გასაჩივრების გაგზავნა ვერ მოხერხდა')
      }
    } catch (err) {
      console.error('Error submitting appeal:', err)
      setError('გასაჩივრების გაგზავნა ვერ მოხერხდა')
    } finally {
      setSubmittingAppeal(false)
    }
  }

  const handleAppealCancel = () => {
    setShowAppealForm(false)
    setSelectedResultForAppeal(null)
    setAppealReason('')
    setAppealDescription('')
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
                <span className="text-gray-900 md:text-[18px] text-[16px]">{option}</span>
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
              <span className="text-gray-900 md:text-[18px] text-[16px]">მართალი</span>
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
              <span className="text-gray-900 md:text-[18px] text-[16px]">მცდარი</span>
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
              className="w-full p-3 border border-gray-300 rounded-md text-gray-900 md:text-[18px] text-[16px]"
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'completed':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'მალე'
      case 'active':
        return 'აქტიური'
      case 'completed':
        return 'დასრულებული'
      default:
        return 'უცნობი'
    }
  }

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) {
      return 'თარიღი არ არის მითითებული'
    }
    const date = new Date(dateString)
    if (isNaN(date.getTime())) {
      return 'არასწორი თარიღი'
    }
    return date.toLocaleDateString('ka-GE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'Asia/Tbilisi'
    })
  }

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#034e64] mx-auto"></div>
            <p className="mt-4 text-gray-600 md:text-[18px] text-[16px]">ავტორიზაცია მოწმდება...</p>
          </div>
        </div>
      </div>
    )
  }

  // Show error if not authenticated or not a student
  if (!isAuthenticated || user?.userType !== 'STUDENT') {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600">წვდომა აკრძალულია</h2>
            <p className="mt-2 text-gray-600">თქვენ არ გაქვთ ამ გვერდზე წვდომის ნებართვა</p>
            <p className="mt-1 text-sm text-gray-500">მომხმარებელი: {user?.email || 'უცნობი'}</p>
            <p className="mt-1 text-sm text-gray-500">ტიპი: {user?.userType || 'უცნობი'}</p>
            <button
              onClick={() => router.push('/auth/signin')}
              className="mt-4 inline-block bg-[#034e64] text-white px-4 py-2 rounded-md hover:bg-[#023a4d]"
            >
              შესვლა
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!subjectId || !studentGrade) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#034e64] mx-auto"></div>
            <p className="mt-4 text-gray-600 md:text-[18px] text-[16px]">მონაცემების ჩატვირთვა...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 md:text-[18px] text-[16px]">
                {subjectName}
              </h1>
              <p className="mt-2 text-gray-600 md:text-[18px] text-[16px]">
                კლასი: {studentGrade}
              </p>
            </div>
            <button
              onClick={() => router.back()}
              className="bg-[#034e64] cursor-pointer text-white px-4 py-2 rounded-md md:text-[20px] text-[16px] font-bold transition-colors hover:bg-[#023a4d]"
            >
              უკან დაბრუნება
            </button>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-800">{successMessage}</p>
              </div>
            </div>
          </div>
        )}

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


        {!testStarted ? (
          <div className="space-y-8">
            {/* Olympiads Section */}
            <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200 hover:shadow-lg transition-shadow duration-200">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 md:text-[18px] text-[16px]">ოლიმპიადები</h2>
                {loadingOlympiads ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#034e64] mx-auto mb-4"></div>
                    <p className="text-gray-600 md:text-[18px] text-[16px]">ოლიმპიადების ჩატვირთვა...</p>
                  </div>
                ) : olympiads.length === 0 ? (
                  <div className="text-center py-8">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900 md:text-[18px] text-[16px]">
                      ოლიმპიადები არ არის
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 md:text-[18px] text-[16px]">
                      ამ საგნისთვის ხელმისაწვდომი ოლიმპიადები არ არის
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {olympiads.map((olympiad) => (
                      <div key={olympiad.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(olympiad.status)}`}>
                            {getStatusText(olympiad.status)}
                          </span>
                        </div>

                        <h3 className="text-lg font-semibold text-gray-900 mb-2 md:text-[18px] text-[16px]">
                          {olympiad.title}
                        </h3>

                        <p className="text-gray-600 mb-4 md:text-[18px] text-[16px]">
                          {olympiad.description}
                        </p>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center text-sm text-gray-500">
                            <svg className="flex-shrink-0 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>დაწყება: {formatDate(olympiad.startDate)}</span>
                          </div>
                          
                          <div className="flex items-center text-sm text-gray-500">
                            <svg className="flex-shrink-0 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>რეგისტრაციის გახსნა: {formatDate(olympiad.registrationStartDate)}</span>
                          </div>
                          
                          <div className="flex items-center text-sm text-gray-500">
                            <svg className="flex-shrink-0 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>რეგისტრაციის დასრულება: {formatDate(olympiad.registrationDeadline)}</span>
                          </div>

                          <div className="flex items-center text-sm text-gray-500">
                            <svg className="flex-shrink-0 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                            <span>კლასები: {olympiad.grades.join(', ')}</span>
                          </div>
                        </div>

                        <div className="flex space-x-3">
                          <button
                            className="flex-1 cursor-pointer bg-[#034e64] cursor-pointer text-white px-4 py-2 rounded-md md:text-[20px] text-[16px] font-bold transition-colors hover:bg-[#023a4d]"
                          >
                            დეტალები
                          </button>
                      


                          {olympiad.isRegistered && olympiad.registrationStatus !== 'COMPLETED' && olympiad.registrationStatus !== 'DISQUALIFIED' ? (
                            <button
                              onClick={() => handleStartOlympiad(olympiad.id)}
                              className="flex-1 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md md:text-[20px] text-[16px] font-bold transition-colors text-center"
                            >
                              დაწყება
                            </button>
                          ) : olympiad.isRegistered && (olympiad.registrationStatus === 'COMPLETED' || olympiad.registrationStatus === 'DISQUALIFIED') ? (
                            <button
                              disabled
                              className="flex-1 cursor-pointer bg-gray-400 text-white px-4 py-2 rounded-md md:text-[20px] text-[16px] font-bold cursor-not-allowed"
                            >
                              {olympiad.registrationStatus === 'COMPLETED' ? 'დასრულებულია' : 'დისკვალიფიცირებული'}
                            </button>
                          ) : olympiad.isRegistrationOpen ? (
                            <button
                              onClick={() => handleOlympiadRegistration(olympiad.id)}
                              disabled={registrationStatus[olympiad.id] === 'loading' || registrationStatus[olympiad.id] === 'success'}
                              className={`flex-1 cursor-pointer px-4 py-2 rounded-md md:text-[20px] text-[16px] font-bold transition-colors ${
                                registrationStatus[olympiad.id] === 'success'
                                  ? 'bg-green-700 text-white cursor-not-allowed'
                                  : registrationStatus[olympiad.id] === 'loading'
                                  ? 'bg-gray-400 text-white cursor-not-allowed'
                                  : 'bg-green-600 hover:bg-green-700 text-white'
                              }`}
                            >
                              {registrationStatus[olympiad.id] === 'loading'
                                ? 'იტვირთება...'
                                : registrationStatus[olympiad.id] === 'success'
                                ? 'დარეგისტრირებული'
                                : 'რეგისტრაცია'}
                            </button>
                          ) : (
                            <button
                              disabled
                              className="flex-1 cursor-pointer bg-gray-400 text-white px-4 py-2 rounded-md md:text-[20px] text-[16px] font-bold cursor-not-allowed"
                            >
                              რეგისტრაცია დასრულდა
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Start Test Section */}
            <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200 hover:shadow-lg transition-shadow duration-200">
              <div className="p-6 text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 md:text-[18px] text-[16px]">ტესტის დაწყება</h2>
                <p className="text-gray-600 mb-6 md:text-[18px] text-[16px]">
                  დაიწყეთ ტესტი {subjectName} საგანში თქვენი კლასისთვის ({studentGrade} კლასი)
                </p>
                <button
                  onClick={startTest}
                  disabled={isLoading}
                  className="bg-[#034e64] text-white px-8 py-3 rounded-md md:text-[20px] text-[16px] font-bold transition-colors hover:bg-[#023a4d] disabled:opacity-50"
                >
                  {isLoading ? 'ტესტის ჩატვირთვა...' : 'ტესტის დაწყება'}
                </button>
              </div>
            </div>

            {/* Olympiad Results Section */}
            <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200 hover:shadow-lg transition-shadow duration-200">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 md:text-[18px] text-[16px]">ოლიმპიადის შედეგები</h2>
                {loadingResults ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#034e64] mx-auto mb-4"></div>
                    <p className="text-gray-600 md:text-[18px] text-[16px]">შედეგების ჩატვირთვა...</p>
                  </div>
                ) : olympiadResults.length === 0 ? (
                  <div className="text-center py-8">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900 md:text-[18px] text-[16px]">
                      ოლიმპიადის შედეგები არ არის
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 md:text-[18px] text-[16px]">
                      ჯერ არ გაქვთ გავლილი ოლიმპიადები
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {olympiadResults.map((result) => {
                      const getPerformanceColor = (percentage: number) => {
                        if (percentage >= 90) return 'text-green-600'
                        if (percentage >= 80) return 'text-blue-600'
                        if (percentage >= 70) return 'text-yellow-600'
                        if (percentage >= 60) return 'text-orange-600'
                        return 'text-red-600'
                      }
                      const getPerformanceText = (percentage: number) => {
                        if (percentage >= 90) return 'შესანიშნავი'
                        if (percentage >= 80) return 'კარგი'
                        if (percentage >= 70) return 'საშუალო'
                        if (percentage >= 60) return 'საშუალოზე დაბალი'
                        return 'ცუდი'
                      }
                      const getStatusColor = (status: string) => {
                        switch (status) {
                          case 'COMPLETED':
                            return 'bg-green-100 text-green-800'
                          case 'DISQUALIFIED':
                            return 'bg-red-100 text-red-800'
                          default:
                            return 'bg-gray-100 text-gray-800'
                        }
                      }
                      const getStatusText = (status: string) => {
                        switch (status) {
                          case 'COMPLETED':
                            return 'დასრულებულია'
                          case 'DISQUALIFIED':
                            return 'დისკვალიფიცირებული'
                          default:
                            return status
                        }
                      }
                      
                      return (
                        <motion.div 
                          key={result.id} 
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-900 md:text-[18px] text-[16px]">
                                {result.olympiadTitle}
                              </h3>
                              <p className="text-gray-600 text-sm">
                                {new Date(result.completedAt).toLocaleDateString('ka-GE', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  timeZone: 'Asia/Tbilisi'
                                })}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className={`text-2xl font-bold ${getPerformanceColor(result.percentage)}`}>
                                {result.percentage}%
                              </div>
                              <div className="text-sm text-gray-600">
                                {getPerformanceText(result.percentage)}
                              </div>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(result.status)}`}>
                                {getStatusText(result.status)}
                              </span>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 mb-3">
                            <div className="bg-gray-50 rounded-lg p-3 text-center">
                              <div className="text-lg font-semibold text-gray-900">
                                {result.score}/{result.maxScore}
                              </div>
                              <div className="text-sm text-gray-600">მიღებული ქულა</div>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3 text-center">
                              <div className="text-lg font-semibold text-gray-900">
                                {result.totalQuestions}
                              </div>
                              <div className="text-sm text-gray-600">კითხვების რაოდენობა</div>
                            </div>
                          </div>
                          
                          {/* Progress Bar */}
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-500 ${
                                result.percentage >= 90 ? 'bg-green-500' :
                                result.percentage >= 80 ? 'bg-blue-500' :
                                result.percentage >= 70 ? 'bg-yellow-500' :
                                result.percentage >= 60 ? 'bg-orange-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${result.percentage}%` }}
                            ></div>
                          </div>
                          
                          {/* View Details Button */}
                          <div className="mt-4 pt-4 border-t mx-auto border-gray-200">
                            <button
                              onClick={() => router.push(`/student/olympiads/${result.olympiadId}/results`)}
                              className="bg-[#034e64] mx-auto block text-white px-8 py-3 rounded-md md:text-[20px] text-[16px] font-bold transition-colors hover:bg-[#023a4d] disabled:opacity-50"
                            >
                              დეტალური შედეგები
                            </button>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Test Interface */
          <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200 hover:shadow-lg transition-shadow duration-200">
            <div className="p-6">
              {!showResults ? (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900 md:text-[18px] text-[16px]">
                      კითხვა {currentQuestionIndex + 1} / {totalQuestions}
                    </h2>
                    <div className="text-sm text-gray-600">
                      პროგრესი: {Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100)}%
                    </div>
                  </div>

                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 md:text-[18px] text-[16px]">
                      {questions[currentQuestionIndex]?.question}
                    </h3>
                    {questions[currentQuestionIndex] && renderQuestion(questions[currentQuestionIndex])}
                  </div>

                  <div className="flex justify-between">
                    <button
                      onClick={previousQuestion}
                      disabled={currentQuestionIndex === 0}
                      className="bg-gray-500 text-white px-4 py-2 rounded-md md:text-[20px] text-[16px] font-bold transition-colors hover:bg-gray-600 disabled:opacity-50"
                    >
                      წინა
                    </button>
                    
                    {currentQuestionIndex === questions.length - 1 ? (
                      <button
                        onClick={finishTest}
                        className="bg-[#034e64] text-white px-6 py-2 rounded-md md:text-[20px] text-[16px] font-bold transition-colors hover:bg-[#023a4d]"
                      >
                        დასრულება
                      </button>
                    ) : (
                      <button
                        onClick={nextQuestion}
                        className="bg-[#034e64] text-white px-4 py-2 rounded-md md:text-[20px] text-[16px] font-bold transition-colors hover:bg-[#023a4d]"
                      >
                        შემდეგი
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                /* Results */
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 md:text-[18px] text-[16px]">ტესტის შედეგები</h2>
                  
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
                        <span className="text-2xl font-bold text-gray-900">
                          {Math.round((score / totalQuestions) * 100)}%
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-xl font-semibold text-gray-900 mb-2 md:text-[18px] text-[16px]">
                      {score} / {totalQuestions} სწორი პასუხი
                    </p>
                    <p className="text-gray-600 mb-6 md:text-[18px] text-[16px]">
                      {getResultMessage(score, totalQuestions)}
                    </p>
                  </div>

                  <div className="space-x-4">
                    <button
                      onClick={resetTest}
                      className="bg-[#034e64] text-white px-6 py-2 rounded-md md:text-[20px] text-[16px] font-bold transition-colors hover:bg-[#023a4d]"
                    >
                      ხელახლა ცდა
                    </button>
                    <button
                      onClick={() => router.back()}
                      className="bg-gray-500 text-white px-6 py-2 rounded-md md:text-[20px] text-[16px] font-bold transition-colors hover:bg-gray-600"
                    >
                      დაბრუნება
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Appeal Form Modal */}
        {showAppealForm && selectedResultForAppeal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  ქულის გასაჩივრება
                </h3>
                
                <div className="mb-4 p-3 bg-gray-50 rounded-md">
                  <p className="text-[16px] text-black">
                    <strong>ოლიმპიადა:</strong> {selectedResultForAppeal.olympiadTitle}
                  </p>
                  <p className="text-[16px] text-black">
                    <strong>ქულა:</strong> {selectedResultForAppeal.score}/{selectedResultForAppeal.maxScore}
                  </p>
                  <p className="text-[16px] text-black">
                    <strong>თარიღი:</strong> {new Date(selectedResultForAppeal.completedAt).toLocaleDateString('ka-GE')}
                  </p>
                </div>

                <div className="mb-4">
                  <label className="block text-[16px] font-medium text-black mb-2">
                    გასაჩივრების მიზეზი *
                  </label>
                  <select
                    value={appealReason}
                    onChange={(e) => setAppealReason(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#034e64] focus:border-transparent"
                  >
                    <option value="">აირჩიეთ მიზეზი</option>
                    <option value="WRONG_ANSWER">პასუხი არასწორად არის შეფასებული</option>
                    <option value="TECHNICAL_ISSUE">ტექნიკური პრობლემა</option>
                    <option value="QUESTION_ERROR">კითხვაში შეცდომა</option>
                    <option value="OTHER">სხვა</option>
                  </select>
                </div>

                <div className="mb-6">
                  <label className="block text-[16px] font-medium text-black mb-2">
                    აღწერა *
                  </label>
                  <textarea
                    value={appealDescription}
                    onChange={(e) => setAppealDescription(e.target.value)}
                    rows={4}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#034e64] focus:border-transparent"
                    placeholder="დეტალურად აღწერეთ თქვენი გასაჩივრება..."
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={handleAppealCancel}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-[16px] -font-medium transition-colors"
                  >
                    გაუქმება
                  </button>
                  <button
                    onClick={handleAppealSubmit}
                    disabled={submittingAppeal || !appealReason || !appealDescription.trim()}
                    className="flex-1 bg-[#034e64] hover:bg-[#023a4d] text-white px-4 py-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submittingAppeal ? 'იგზავნება...' : 'გაგზავნა'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default StudentSubjectPage
