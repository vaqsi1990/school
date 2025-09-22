'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

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

const StudentRegisteredPage = () => {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const [olympiads, setOlympiads] = useState<Olympiad[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    if (isAuthenticated && user?.userType === 'STUDENT') {
      fetchRegisteredOlympiads()
    }
  }, [isAuthenticated, user])

  const fetchRegisteredOlympiads = async () => {
    try {
      setLoading(true)
      setError('')
      
      const response = await fetch('/api/student/olympiads')
      
      if (response.ok) {
        const data = await response.json()
        // Filter only registered olympiads
        const registeredOlympiads = data.olympiads.filter((olympiad: Olympiad) => 
          olympiad.isRegistered
        )
        setOlympiads(registeredOlympiads)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'ოლიმპიადების ჩატვირთვა ვერ მოხერხდა')
        setOlympiads([])
      }
    } catch (error) {
      console.error('Error fetching registered olympiads:', error)
      setError('ოლიმპიადების ჩატვირთვა ვერ მოხერხდა')
      setOlympiads([])
    } finally {
      setLoading(false)
    }
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

  const getRegistrationStatusText = (status: string) => {
    switch (status) {
      case 'REGISTERED':
        return 'დარეგისტრირებული'
      case 'IN_PROGRESS':
        return 'მიმდინარე'
      case 'COMPLETED':
        return 'დასრულებული'
      case 'DISQUALIFIED':
        return 'დისკვალიფიცირებული'
      default:
        return 'დარეგისტრირებული'
    }
  }

  const getRegistrationStatusColor = (status: string) => {
    switch (status) {
      case 'REGISTERED':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'DISQUALIFIED':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200'
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

  const handleStartOlympiad = async (olympiadId: string) => {
    try {
      setError('')
      setSuccessMessage('')
      router.push(`/student/olympiads/${olympiadId}`)
    } catch (err) {
      console.error('Error starting olympiad:', err)
      setError('ოლიმპიადის დაწყება ვერ მოხერხდა')
    }
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
                ჩანიშნული ოლიმპიადები
              </h1>
              <p className="mt-2 text-gray-600 md:text-[18px] text-[16px]">
                თქვენი რეგისტრირებული ოლიმპიადების სია
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

        {/* Olympiads List */}
        <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 md:text-[18px] text-[16px]">
              რეგისტრირებული ოლიმპიადები ({olympiads.length})
            </h2>
            
            {loading ? (
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
                  რეგისტრირებული ოლიმპიადები არ არის
                </h3>
                <p className="mt-1 text-sm text-gray-500 md:text-[18px] text-[16px]">
                  ჯერ არ გაქვთ რეგისტრირებული ოლიმპიადები
                </p>
                <button
                  onClick={() => router.push('/student/olympiads')}
                  className="mt-4 inline-block bg-[#034e64] text-white px-4 py-2 rounded-md hover:bg-[#023a4d]"
                >
                  ოლიმპიადების ნახვა
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {olympiads.map((olympiad) => (
                  <motion.div 
                    key={olympiad.id} 
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow duration-200"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Status Badges */}
                    <div className="flex justify-between items-start mb-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(olympiad.status)}`}>
                        {getStatusText(olympiad.status)}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRegistrationStatusColor(olympiad.registrationStatus || 'REGISTERED')}`}>
                        {getRegistrationStatusText(olympiad.registrationStatus || 'REGISTERED')}
                      </span>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 mb-2 md:text-[18px] text-[16px]">
                      {olympiad.title}
                    </h3>

                    <p className="text-gray-600 mb-4 md:text-[18px] text-[16px] line-clamp-3">
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
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>დასრულება: {formatDate(olympiad.endDate)}</span>
                      </div>

                      <div className="flex items-center text-sm text-gray-500">
                        <svg className="flex-shrink-0 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <span>საგნები: {olympiad.subjects.join(', ')}</span>
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
                      {(olympiad.registrationStatus === 'REGISTERED' || olympiad.registrationStatus === 'IN_PROGRESS') && (
                        <button
                          onClick={() => handleStartOlympiad(olympiad.id)}
                          className="flex-1 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md md:text-[20px] text-[16px] font-bold transition-colors text-center"
                        >
                          {olympiad.registrationStatus === 'IN_PROGRESS' ? 'გაგრძელება' : 'დაწყება'}
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentRegisteredPage