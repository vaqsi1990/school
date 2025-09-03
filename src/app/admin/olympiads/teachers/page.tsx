'use client'

import { useAuth } from '@/hooks/useAuth'
import { AdminOnly } from '@/components/auth/ProtectedRoute'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { toast } from 'react-hot-toast'

interface TeacherQuestion {
  id: string
  text: string
  type: string
  grade: number
  round: number
  status: 'PENDING' | 'ACTIVE' | 'REJECTED'
  createdAt: string
  subject: {
    name: string
  }
  createdByTeacher: {
    name: string
    lastname: string
    subject: string
    school: string
  }
}

interface TeacherQuestionsResponse {
  questions: TeacherQuestion[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  counts: {
    pending: number
    active: number
    rejected: number
  }
}

function AdminTeacherQuestionsContent() {
  const { user } = useAuth()
  const [questions, setQuestions] = useState<TeacherQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [currentStatus, setCurrentStatus] = useState<'PENDING' | 'ACTIVE' | 'REJECTED'>('PENDING')
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })
  const [counts, setCounts] = useState({
    pending: 0,
    active: 0,
    rejected: 0
  })

  const fetchQuestions = async (status: string = 'PENDING', page: number = 1) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/teacher-questions?status=${status}&page=${page}&limit=10`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch questions')
      }

      const data: TeacherQuestionsResponse = await response.json()
      setQuestions(data.questions)
      setPagination(data.pagination)
      setCounts(data.counts)
    } catch (error) {
      console.error('Error fetching questions:', error)
      toast.error('კითხვების ჩატვირთვისას შეცდომა მოხდა')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQuestions(currentStatus, 1)
  }, [currentStatus])

  const handleStatusChange = (status: 'PENDING' | 'ACTIVE' | 'REJECTED') => {
    setCurrentStatus(status)
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }))
    fetchQuestions(currentStatus, page)
  }

  const handleAction = async (questionId: string, action: 'approve' | 'reject') => {
    try {
      const response = await fetch('/api/admin/teacher-questions', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ questionId, action }),
      })

      if (!response.ok) {
        throw new Error('Failed to update question')
      }

      const data = await response.json()
      
      if (action === 'approve') {
        toast.success('კითხვა დადასტურებულია')
      } else {
        toast.success('კითხვა უარყოფილია')
      }

      // Refresh the current list
      fetchQuestions(currentStatus, pagination.page)
    } catch (error) {
      console.error('Error updating question:', error)
      toast.error('კითხვის განახლებისას შეცდომა მოხდა')
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { text: 'მიმდინარე', className: 'bg-yellow-100 text-yellow-800' },
      ACTIVE: { text: 'დადასტურებული', className: 'bg-green-100 text-green-800' },
      REJECTED: { text: 'უარყოფილი', className: 'bg-red-100 text-red-800' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig]
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.className}`}>
        {config.text}
      </span>
    )
  }

  const getQuestionTypeText = (type: string) => {
    const typeMap: { [key: string]: string } = {
      MULTIPLE_CHOICE: 'მრავალარჩევანიანი',
      TRUE_FALSE: 'სწორი/არასწორი',
      MATCHING: 'შესაბამისობა',
      TEXT_ANALYSIS: 'ტექსტის ანალიზი',
      MAP_ANALYSIS: 'რუკის ანალიზი',
      OPEN_ENDED: 'ღია კითხვა',
      CLOSED_ENDED: 'დახურული კითხვა'
    }
    return typeMap[type] || type
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-black md:text-[25px] text-[20px]">
                მასწავლებლის კითხვების მართვა
              </h1>
              <p className="text-black md:text-[18px] text-[16px]">
                მასწავლებლების მიერ დამატებული კითხვების დადასტურება და მართვა
              </p>
            </div>
            <Link
              href="/admin/olympiads"
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md md:text-[18px] text-[16px] font-bold"
            >
              დაბრუნება
            </Link>
          </div>
        </div>
      </div>

      <div className=" mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">{counts.pending}</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      მიმდინარე კითხვები
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {counts.pending}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">{counts.active}</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      დადასტურებული კითხვები
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {counts.active}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">{counts.rejected}</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      უარყოფილი კითხვები
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {counts.rejected}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => handleStatusChange('PENDING')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  currentStatus === 'PENDING'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                მიმდინარე ({counts.pending})
              </button>
              <button
                onClick={() => handleStatusChange('ACTIVE')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  currentStatus === 'ACTIVE'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                დადასტურებული ({counts.active})
              </button>
              <button
                onClick={() => handleStatusChange('REJECTED')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  currentStatus === 'REJECTED'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                უარყოფილი ({counts.rejected})
              </button>
            </nav>
          </div>
        </div>

        {/* Questions List */}
        <div className="bg-white shadow rounded-lg">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">კითხვები იტვირთება...</p>
            </div>
          ) : questions.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-600">ამ სტატუსის კითხვები არ არსებობს</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      კითხვა
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      მასწავლებელი
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      საგანი
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      კლასი
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ტიპი
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      თარიღი
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      სტატუსი
                    </th>
                                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        მოქმედებები
                      </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {questions.map((question) => (
                    <tr key={question.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-normal">
                        <div className="text-sm text-gray-900 max-w-xs">
                          {question.text.length > 100 
                            ? `${question.text.substring(0, 100)}...` 
                            : question.text
                          }
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {question.createdByTeacher.name} {question.createdByTeacher.lastname}
                        </div>
                        <div className="text-sm text-gray-500">
                          {question.createdByTeacher.school}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {question.subject.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {question.grade}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {getQuestionTypeText(question.type)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(question.createdAt).toLocaleDateString('ka-GE')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(question.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Link
                            href={`/admin/olympiads/teachers/edit/${question.id}`}
                            className="text-blue-600 hover:text-blue-900 bg-blue-100 hover:bg-blue-200 px-3 py-1 rounded-md text-sm"
                          >
                            რედაქტირება
                          </Link>
                          {currentStatus === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleAction(question.id, 'approve')}
                                className="text-green-600 hover:text-green-900 bg-green-100 hover:bg-green-200 px-3 py-1 rounded-md text-sm"
                              >
                                დადასტურება
                              </button>
                              <button
                                onClick={() => handleAction(question.id, 'reject')}
                                className="text-red-600 hover:text-red-900 bg-red-100 hover:bg-red-200 px-3 py-1 rounded-md text-sm"
                              >
                                უარყოფა
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-6 rounded-lg">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                წინა
              </button>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                შემდეგი
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  ნაჩვენებია <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> - <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> 
                  {pagination.total > 0 && ` ${pagination.total}-დან`}
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    წინა
                  </button>
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        page === pagination.page
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    შემდეგი
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function AdminTeacherQuestionsPage() {
  return (
    <AdminOnly>
      <AdminTeacherQuestionsContent />
    </AdminOnly>
  )
}