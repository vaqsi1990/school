'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Olympiad {
  id: string
  title: string
  description: string
  startDate: string
  endDate: string
  registrationDeadline: string
  subjects: string[]
  grades: number[]
  status: 'upcoming' | 'active' | 'completed'
}

export default function StudentOlympiadsPage() {
  const [olympiads, setOlympiads] = useState<Olympiad[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [registrationStatus, setRegistrationStatus] = useState<{[key: string]: 'idle' | 'loading' | 'success' | 'error'}>({})
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    fetchOlympiads()
  }, [])

  const fetchOlympiads = async () => {
    try {
      setIsLoading(true)
      setError('')
      
      const response = await fetch('/api/student/olympiads')
      
      if (response.ok) {
        const data = await response.json()
        console.log('API Response:', data)
        setOlympiads(data.olympiads || [])
      } else {
        const errorData = await response.json()
        console.error('API Error:', errorData)
        setError(errorData.error || 'ოლიმპიადების ჩატვირთვა ვერ მოხერხდა')
        setOlympiads([])
      }
    } catch (err) {
      console.error('Error fetching olympiads:', err)
      setError('ოლიმპიადების ჩატვირთვა ვერ მოხერხდა')
      setOlympiads([])
    } finally {
      setIsLoading(false)
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ka-GE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const handleRegistration = async (olympiadId: string) => {
    try {
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

      const result = await response.json()

      if (response.ok) {
        setRegistrationStatus(prev => ({ ...prev, [olympiadId]: 'success' }))
        setSuccessMessage(result.message)
        
        // Refresh olympiads list
        setTimeout(() => {
          fetchOlympiads()
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#034e64] mx-auto"></div>
            <p className="mt-4 text-gray-600 md:text-[18px] text-[16px]">იტვირთება...</p>
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
                ოლიმპიადები
              </h1>
              <p className="mt-2 text-gray-600 md:text-[18px] text-[16px]">
                აირჩიეთ და დარეგისტრირდით ოლიმპიადებზე
              </p>
            </div>
            <Link
              href="/student/dashboard"
              className="bg-[#034e64] cursor-pointer text-white px-4 py-2 rounded-md md:text-[20px] text-[16px] font-bold transition-colors hover:bg-[#023a4d]"
            >
              უკან დაბრუნება
            </Link>
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

        {/* Olympiads Grid */}
        {olympiads.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 md:text-[18px] text-[16px]">
              ოლიმპიადები არ არის
            </h3>
            <p className="mt-1 text-sm text-gray-500 md:text-[18px] text-[16px]">
              ამ მომენტში არ არის ხელმისაწვდომი ოლიმპიადები
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {olympiads.map((olympiad) => (
              <div
                key={olympiad.id}
                className="bg-white overflow-hidden shadow rounded-lg border border-gray-200 hover:shadow-lg transition-shadow duration-200"
              >
                <div className="p-6">
                  {/* Status Badge */}
                  <div className="flex justify-between items-start mb-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(olympiad.status)}`}>
                      {getStatusText(olympiad.status)}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 md:text-[18px] text-[16px]">
                    {olympiad.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 mb-4 md:text-[18px] text-[16px]">
                    {olympiad.description}
                  </p>

                  {/* Details */}
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
                      <span>რეგისტრაცია: {formatDate(olympiad.registrationDeadline)}</span>
                    </div>

                    <div className="flex items-center text-sm text-gray-500">
                      <svg className="flex-shrink-0 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
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

                  {/* Action Buttons */}
                  <div className="flex space-x-3">
                    <button
                      className="flex-1 cursor-pointer bg-[#034e64] cursor-pointer text-white px-4 py-2 rounded-md md:text-[20px] text-[16px] font-bold transition-colors hover:bg-[#023a4d]"
                    >
                      დეტალები
                    </button>
                                         <button
                       onClick={() => handleRegistration(olympiad.id)}
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
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
