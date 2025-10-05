'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'


interface OlympiadResult {
  id: string
  olympiadId: string
  olympiadTitle: string
  olympiadDescription: string
  subjects: string[]
  grades: number[]
  startDate: string
  endDate: string
  status: 'REGISTERED' | 'IN_PROGRESS' | 'COMPLETED' | 'DISQUALIFIED'
  startTime?: string
  endTime?: string
  score?: number
  totalQuestions?: number
  percentage?: number
  rank?: number
  totalParticipants?: number
  completedAt?: string
  minimumPointsThreshold?: number
  currentRound?: number
  totalRounds?: number
  hasAdvancedToNextStage?: boolean
}

const StudentResultsPage = () => {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const [results, setResults] = useState<OlympiadResult[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'disqualified'>('all')
  const [showAppealForm, setShowAppealForm] = useState(false)
  const [selectedResultForAppeal, setSelectedResultForAppeal] = useState<OlympiadResult | null>(null)
  const [appealReason, setAppealReason] = useState('')
  const [appealDescription, setAppealDescription] = useState('')
  const [submittingAppeal, setSubmittingAppeal] = useState(false)

  useEffect(() => {
    if (isAuthenticated && user?.userType === 'STUDENT') {
      fetchOlympiadResults()
    }
  }, [isAuthenticated, user])

  const fetchOlympiadResults = async () => {
    try {
      setLoading(true)
      setError('')
      
      // Get all subjects first to fetch results for each
      const subjectsResponse = await fetch('/api/subjects')
      if (!subjectsResponse.ok) {
        throw new Error('Failed to fetch subjects')
      }
      
      const subjectsData = await subjectsResponse.json()
      const allResults: OlympiadResult[] = []
      
      // Fetch results for each subject
      for (const subject of subjectsData.subjects) {
        try {
          const response = await fetch(`/api/student/olympiad-results-by-subject?subjectName=${encodeURIComponent(subject.name)}`)
          
          if (response.ok) {
            const data = await response.json()
            if (data.results && data.results.length > 0) {
              // Transform the results to match our interface
              const transformedResults = data.results.map((result: {
                id: string;
                olympiadId: string;
                olympiadTitle: string;
                olympiadDescription: string;
                subjects: string[];
                grades: number[];
                score: number;
                maxScore: number;
                percentage: number;
                totalQuestions: number;
                completedAt: string;
                status: string;
                startDate?: string;
                endDate?: string;
                minimumPointsThreshold?: number;
                currentRound?: number;
                totalRounds?: number;
                hasAdvancedToNextStage?: boolean;
              }) => ({
                id: result.id,
                olympiadId: result.olympiadId,
                olympiadTitle: result.olympiadTitle,
                olympiadDescription: result.olympiadDescription,
                subjects: result.subjects,
                grades: result.grades,
                startDate: result.startDate,
                endDate: result.endDate,
                status: result.status,
                score: result.score,
                totalQuestions: result.totalQuestions,
                percentage: result.percentage,
                completedAt: result.completedAt,
                minimumPointsThreshold: result.minimumPointsThreshold,
                currentRound: result.currentRound,
                totalRounds: result.totalRounds,
                hasAdvancedToNextStage: result.hasAdvancedToNextStage
              }))
              
              allResults.push(...transformedResults)
            }
          }
        } catch (subjectError) {
          console.error(`Error fetching results for subject ${subject.name}:`, subjectError)
        }
      }
      
      // Remove duplicates based on olympiadId
      const uniqueResults = allResults.filter((result, index, self) => 
        index === self.findIndex(r => r.olympiadId === result.olympiadId)
      )
      
      setResults(uniqueResults)
    } catch (error) {
      console.error('Error fetching olympiad results:', error)
      setError('შედეგების ჩატვირთვა ვერ მოხერხდა')
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'DISQUALIFIED':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'დასრულებული'
      case 'DISQUALIFIED':
        return 'დისკვალიფიცირებული'
      default:
        return 'უცნობი'
    }
  }

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

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) {
      return 'თარიღი არ არის მითითებული'
    }
    const date = new Date(dateString)
    if (isNaN(date.getTime())) {
      return 'არასწორი თარიღი'
    }
    
    const georgianMonths = [
      'იანვარი', 'თებერვალი', 'მარტი', 'აპრილი', 'მაისი', 'ივნისი',
      'ივლისი', 'აგვისტო', 'სექტემბერი', 'ოქტომბერი', 'ნოემბერი', 'დეკემბერი'
    ]
    
    const day = date.getDate()
    const month = georgianMonths[date.getMonth()]
    const year = date.getFullYear()
    
    return `${day} ${month}, ${year}`
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
          subjectId: selectedResultForAppeal.subjects[0] // Use first subject
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

  const filteredResults = results.filter(result => {
    if (filterStatus === 'all') return true
    if (filterStatus === 'completed') return result.status === 'COMPLETED'
    if (filterStatus === 'disqualified') return result.status === 'DISQUALIFIED'
    return true
  })

  const completedResults = results.filter(r => r.status === 'COMPLETED')
  const averageScore = completedResults.length > 0 
    ? Math.round(completedResults.reduce((sum, r) => sum + (r.percentage || 0), 0) / completedResults.length)
    : 0

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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 md:text-[18px] text-[16px]">
                ოლიმპიადების შედეგები
              </h1>
              <p className="mt-2 text-gray-600 md:text-[18px] text-[16px]">
                თქვენი ოლიმპიადების შედეგების სია
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

        {/* Statistics Cards */}
        {!loading && results.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <motion.div 
              className="bg-white rounded-lg shadow-md p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">სულ ოლიმპიადი</p>
                  <p className="text-2xl font-semibold text-gray-900">{results.length}</p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="bg-white rounded-lg shadow-md p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">დასრულებული</p>
                  <p className="text-2xl font-semibold text-gray-900">{completedResults.length}</p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="bg-white rounded-lg shadow-md p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">საშუალო ქულა</p>
                  <p className="text-2xl font-semibold text-gray-900">{averageScore}%</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Filter Tabs */}
        {!loading && results.length > 0 && (
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setFilterStatus('all')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    filterStatus === 'all'
                      ? 'border-[#034e64] text-[#034e64]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  ყველა ({results.length})
                </button>
                <button
                  onClick={() => setFilterStatus('completed')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    filterStatus === 'completed'
                      ? 'border-[#034e64] text-[#034e64]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  დასრულებული ({completedResults.length})
                </button>
                <button
                  onClick={() => setFilterStatus('disqualified')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    filterStatus === 'disqualified'
                      ? 'border-[#034e64] text-[#034e64]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  დისკვალიფიცირებული ({results.filter(r => r.status === 'DISQUALIFIED').length})
                </button>
              </nav>
            </div>
          </div>
        )}

        {/* Results List */}
        <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 md:text-[18px] text-[16px]">
              შედეგების სია ({filteredResults.length})
            </h2>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#034e64] mx-auto mb-4"></div>
                <p className="text-gray-600 md:text-[18px] text-[16px]">შედეგების ჩატვირთვა...</p>
              </div>
            ) : filteredResults.length === 0 ? (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900 md:text-[18px] text-[16px]">
                  შედეგები არ არის
                </h3>
                <p className="mt-1 text-sm text-gray-500 md:text-[18px] text-[16px]">
                  ჯერ არ გაქვთ დასრულებული ოლიმპიადები
                </p>
                <button
                  onClick={() => router.push('/student/olympiads')}
                  className="mt-4 inline-block bg-[#034e64] text-white px-4 py-2 rounded-md hover:bg-[#023a4d]"
                >
                  ოლიმპიადების ნახვა
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredResults.map((result, index) => (
                  <motion.div 
                    key={`${result.olympiadId}-${result.subjects.join('-')}-${index}`} 
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow duration-200"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2 md:text-[18px] text-[16px]">
                          {result.olympiadTitle}
                        </h3>
                        <p className="text-gray-600 mb-3 md:text-[18px] text-[16px]">
                          {result.olympiadDescription}
                        </p>
                      </div>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(result.status)}`}>
                        {getStatusText(result.status)}
                      </span>
                    </div>

                    {/* Results Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                      {result.status === 'COMPLETED' && (
                        <>
                          <div className="bg-gray-50 rounded-lg p-4 text-center">
                            <div className={`text-2xl font-bold ${getPerformanceColor(result.percentage || 0)}`}>
                              {result.percentage}%
                            </div>
                            <div className="text-sm text-gray-600">ქულა</div>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-gray-900">
                              {result.score}/{result.totalQuestions}
                            </div>
                            <div className="text-sm text-gray-600">მიღებული ქულა</div>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-gray-900">
                              {result.totalQuestions}
                            </div>
                            <div className="text-sm text-gray-600">კითხვების რაოდენობა</div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Performance Text */}
                    {result.status === 'COMPLETED' && (
                      <div className="mb-4">
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPerformanceColor(result.percentage || 0)} bg-opacity-10`}>
                          {getPerformanceText(result.percentage || 0)}
                        </div>
                      </div>
                    )}

                    {/* Stage Progression Information */}
                    {result.status === 'COMPLETED' && result.minimumPointsThreshold && result.currentRound && result.totalRounds && (
                      <div className="mb-4">
                        {result.score && result.score >= result.minimumPointsThreshold ? (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                            <div className="flex items-center">
                        
                              <div>
                                <div className="text-sm font-semibold text-green-800">
                                გილოცავთ! თქვენ გადახვედით შემდეგ ტურში! 
                                </div>
                                <div className="text-xs text-green-700">
                                  მიღებული ქულა: {result.score} / მინიმალური ზღვარი: {result.minimumPointsThreshold}
                                  {result.currentRound < result.totalRounds ? (
                                    <span> • ახლა ხართ {result.currentRound + 1} ეტაპზე</span>
                                  ) : (
                                    <span> • ყველა ეტაპი დასრულებულია</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                            <div className="flex items-center">
                              <div className="text-yellow-500 text-lg mr-2">⚠️</div>
                              <div>
                                <div className="text-sm font-semibold text-yellow-800">
                                შემდეგ ტურში გადასასვლელად საჭიროა მეტი ქულა
                                </div>
                                <div className="text-xs text-yellow-700">
                                  მიღებული ქულა: {result.score} / საჭირო: {result.minimumPointsThreshold}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500 mb-4">
                      <div className="flex items-center">
                        <svg className="flex-shrink-0 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>დაწყება: {formatDate(result.startDate)}</span>
                      </div>
                      <div className="flex items-center">
                        <svg className="flex-shrink-0 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>დასრულება: {formatDate(result.completedAt)}</span>
                      </div>
                      <div className="flex items-center">
                        <svg className="flex-shrink-0 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <span>საგნები: {result.subjects.join(', ')}</span>
                      </div>
                      <div className="flex items-center">
                        <svg className="flex-shrink-0 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <span>კლასები: {result.grades.join(', ')}</span>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    {result.status === 'COMPLETED' && (
                      <div className="pt-4 justify-center items-center border-t border-gray-200 flex space-x-3">
                        <button
                          onClick={() => router.push(`/student/olympiads/${result.olympiadId}/results`)}
                          className="bg-[#034e64]  cursor-pointer text-white px-6 py-2 rounded-md md:text-[16px] text-[14px] font-bold transition-colors hover:bg-[#023a4d]"
                        >
                          დეტალური შედეგები
                        </button>
                        <button
                          onClick={() => handleAppealClick(result)}
                          className="bg-orange-600   cursor-pointer text-white px-6 py-2 rounded-md md:text-[16px] text-[14px] font-bold transition-colors hover:bg-orange-700"
                        >
                          გასაჩივრება
                        </button>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

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
                    <strong>ქულა:</strong> {selectedResultForAppeal.score}/{selectedResultForAppeal.totalQuestions}
                  </p>
                  <p className="text-[16px] text-black">
                    <strong>თარიღი:</strong> {formatDate(selectedResultForAppeal.completedAt)}
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
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-[16px] font-medium transition-colors"
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

export default StudentResultsPage
