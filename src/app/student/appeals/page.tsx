'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { StudentOnly } from '@/components/auth/ProtectedRoute'
import { useRouter } from 'next/navigation'

interface Appeal {
  id: string
  reason: string
  description: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  submittedAt: string
  adminComment?: string
  processedAt?: string
  studentOlympiadEvent: {
    id: string
    olympiadEvent: {
      id: string
      name: string
      description: string
    }
    totalScore: number
  }
}

const StudentAppealsPage = () => {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [appeals, setAppeals] = useState<Appeal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isAuthenticated || user?.userType !== 'STUDENT') {
      router.push('/auth/signin')
      return
    }
    fetchAppeals()
  }, [isAuthenticated, user, router])

  const fetchAppeals = async () => {
    try {
      setLoading(true)
      setError('')
      
      const response = await fetch('/api/student/appeals', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setAppeals(data.appeals || [])
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'გასაჩივრებების ჩატვირთვა ვერ მოხერხდა')
      }
    } catch (error) {
      console.error('Error fetching appeals:', error)
      setError('გასაჩივრებების ჩატვირთვა ვერ მოხერხდა')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'APPROVED':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'მოლოდინში'
      case 'APPROVED':
        return 'დამტკიცებული'
      case 'REJECTED':
        return 'უარყოფილი'
      default:
        return status
    }
  }

  const getReasonText = (reason: string) => {
    switch (reason) {
      case 'WRONG_ANSWER':
        return 'პასუხი არასწორად არის შეფასებული'
      case 'TECHNICAL_ISSUE':
        return 'ტექნიკური პრობლემა'
      case 'QUESTION_ERROR':
        return 'კითხვაში შეცდომა'
      case 'OTHER':
        return 'სხვა'
      default:
        return reason
    }
  }

  const formatDate = (dateString: string) => {
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
    
    return `${day} ${month}, ${year} - ${hours}:${minutes}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#034e64] mx-auto mb-4"></div>
          <p className="text-gray-600">გასაჩივრებების ჩატვირთვა...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">ჩემი გასაჩივრებები</h1>
              <p className="mt-2 text-gray-600">ნახეთ თქვენი გასაჩივრებების სტატუსი და ადმინის პასუხები</p>
            </div>
            <button
              onClick={() => router.back()}
              className="bg-[#034e64] text-white px-4 py-2 rounded-md hover:bg-[#023a4d] transition-colors"
            >
              უკან დაბრუნება
            </button>
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

        {/* Appeals List */}
        <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              გასაჩივრებების სია ({appeals.length})
            </h2>
            
            {appeals.length === 0 ? (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  გასაჩივრებები არ არის
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  თქვენ ჯერ არ გაქვთ გაგზავნილი გასაჩივრებები
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {appeals.map((appeal) => (
                  <div key={appeal.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {appeal.studentOlympiadEvent.olympiadEvent.name}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          ქულა: {appeal.studentOlympiadEvent.totalScore}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(appeal.status)}`}>
                          {getStatusText(appeal.status)}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(appeal.submittedAt)}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">მიზეზი:</span> {getReasonText(appeal.reason)}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">აღწერა:</span> {appeal.description}
                        </p>
                      </div>
                      <div>
                        {appeal.adminComment && (
                          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                            <p className="text-sm font-medium text-blue-800 mb-1">
                              ადმინის პასუხი:
                            </p>
                            <p className="text-sm text-blue-700">
                              {appeal.adminComment}
                            </p>
                            {appeal.processedAt && (
                              <p className="text-xs text-blue-600 mt-2">
                                გადაწყვეტილება მიღებულია: {formatDate(appeal.processedAt)}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function StudentAppealsPageWrapper() {
  return (
    <StudentOnly>
      <StudentAppealsPage />
    </StudentOnly>
  )
}
