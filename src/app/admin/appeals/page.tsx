'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { AdminOnly } from '@/components/auth/ProtectedRoute'
import { useRouter } from 'next/navigation'

interface Appeal {
  id: string
  reason: string
  description: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  submittedAt: string
  studentOlympiadEvent: {
    id: string
    student: {
      id: string
      name: string
      lastname: string
      grade: number
      school: string
    }
    olympiadEvent: {
      id: string
      name: string
      description: string
    }
    totalScore: number
  }
}

const AdminAppealsPage = () => {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [appeals, setAppeals] = useState<Appeal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'PENDING' | 'APPROVED' | 'REJECTED'>('all')
  const [selectedAppeal, setSelectedAppeal] = useState<Appeal | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [decision, setDecision] = useState<'APPROVED' | 'REJECTED'>('APPROVED')
  const [adminComment, setAdminComment] = useState('')

  useEffect(() => {
    if (!isAuthenticated || user?.userType !== 'ADMIN') {
      router.push('/auth/signin')
      return
    }
    fetchAppeals()
  }, [isAuthenticated, user, router])

  const fetchAppeals = async () => {
    try {
      setLoading(true)
      setError('')
      
      const response = await fetch('/api/admin/appeals', {
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

  const handleAppealClick = (appeal: Appeal) => {
    setSelectedAppeal(appeal)
    setShowModal(true)
    setAdminComment('')
  }

  const handleDecision = async () => {
    if (!selectedAppeal) return

    try {
      setProcessing(true)
      
      const response = await fetch('/api/admin/appeals/decision', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          appealId: selectedAppeal.id,
          decision,
          adminComment
        })
      })

      if (response.ok) {
        // Refresh appeals list
        await fetchAppeals()
        setShowModal(false)
        setSelectedAppeal(null)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'გადაწყვეტილების შენახვა ვერ მოხერხდა')
      }
    } catch (error) {
      console.error('Error processing appeal:', error)
      setError('გადაწყვეტილების შენახვა ვერ მოხერხდა')
    } finally {
      setProcessing(false)
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
    return date.toLocaleDateString('ka-GE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const filteredAppeals = appeals.filter(appeal => 
    filterStatus === 'all' || appeal.status === filterStatus
  )

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
console.log(appeals);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">გასაჩივრებების მართვა</h1>
              <p className="mt-2 text-gray-600">მართეთ მოსწავლეთა გასაჩივრებები</p>
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

        {/* Filter Tabs */}
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
                ყველა ({appeals.length})
              </button>
              <button
                onClick={() => setFilterStatus('PENDING')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  filterStatus === 'PENDING'
                    ? 'border-[#034e64] text-[#034e64]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                მოლოდინში ({appeals.filter(a => a.status === 'PENDING').length})
              </button>
              <button
                onClick={() => setFilterStatus('APPROVED')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  filterStatus === 'APPROVED'
                    ? 'border-[#034e64] text-[#034e64]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                დამტკიცებული ({appeals.filter(a => a.status === 'APPROVED').length})
              </button>
              <button
                onClick={() => setFilterStatus('REJECTED')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  filterStatus === 'REJECTED'
                    ? 'border-[#034e64] text-[#034e64]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                უარყოფილი ({appeals.filter(a => a.status === 'REJECTED').length})
              </button>
            </nav>
          </div>
        </div>

        {/* Appeals List */}
        <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              გასაჩივრებების სია ({filteredAppeals.length})
            </h2>
            
            {filteredAppeals.length === 0 ? (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  გასაჩივრებები არ არის
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  ამ სტატუსის გასაჩივრებები ჯერ არ არის
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAppeals.map((appeal) => (
                  <div key={appeal.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {appeal.studentOlympiadEvent.student.name} {appeal.studentOlympiadEvent.student.lastname}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          {appeal.studentOlympiadEvent.olympiadEvent.name}
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
                          <span className="font-medium">კლასი:</span> {appeal.studentOlympiadEvent.student.grade}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">სკოლა:</span> {appeal.studentOlympiadEvent.student.school}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">ქულა:</span> {appeal.studentOlympiadEvent.totalScore}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">აღწერა:</span> {appeal.description}
                        </p>
                      </div>
                    </div>

                    {appeal.status === 'PENDING' && (
                      <div className="pt-3 border-t border-gray-200">
                        <button
                          onClick={() => handleAppealClick(appeal)}
                          className="bg-[#034e64] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#023a4d] transition-colors"
                        >
                          გადაწყვეტილების მიღება
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Decision Modal */}
        {showModal && selectedAppeal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    გასაჩივრების გადაწყვეტილება
                  </h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="mb-4 p-3 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-800">
                    <strong>მოსწავლე:</strong> {selectedAppeal.studentOlympiadEvent.student.name} {selectedAppeal.studentOlympiadEvent.student.lastname}
                  </p>
                  <p className="text-sm text-gray-800">
                    <strong>ოლიმპიადა:</strong> {selectedAppeal.studentOlympiadEvent.olympiadEvent.name}
                  </p>
                  <p className="text-sm text-gray-800">
                    <strong>ქულა:</strong> {selectedAppeal.studentOlympiadEvent.totalScore}
                  </p>
                  <p className="text-sm text-gray-800">
                    <strong>მიზეზი:</strong> {getReasonText(selectedAppeal.reason)}
                  </p>
                  <p className="text-sm text-gray-800">
                    <strong>აღწერა:</strong> {selectedAppeal.description}
                  </p>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    გადაწყვეტილება
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="APPROVED"
                        checked={decision === 'APPROVED'}
                        onChange={(e) => setDecision(e.target.value as 'APPROVED' | 'REJECTED')}
                        className="mr-2"
                      />
                      <span className="text-green-600 font-medium">დამტკიცება</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="REJECTED"
                        checked={decision === 'REJECTED'}
                        onChange={(e) => setDecision(e.target.value as 'APPROVED' | 'REJECTED')}
                        className="mr-2"
                      />
                      <span className="text-red-600 font-medium">უარყოფა</span>
                    </label>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ადმინის კომენტარი
                  </label>
                  <textarea
                    value={adminComment}
                    onChange={(e) => setAdminComment(e.target.value)}
                    rows={4}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#034e64] focus:border-transparent"
                    placeholder="შეიყვანეთ კომენტარი..."
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md font-medium transition-colors"
                  >
                    გაუქმება
                  </button>
                  <button
                    onClick={handleDecision}
                    disabled={processing}
                    className="flex-1 bg-[#034e64] hover:bg-[#023a4d] text-white px-4 py-2 rounded-md font-medium transition-colors disabled:opacity-50"
                  >
                    {processing ? 'მუშავდება...' : 'შენახვა'}
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

export default function AdminAppealsPageWrapper() {
  return (
    <AdminOnly>
      <AdminAppealsPage />
    </AdminOnly>
  )
}
