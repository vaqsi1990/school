'use client'

import { useAuth } from '@/hooks/useAuth'
import { AdminOnly } from '@/components/auth/ProtectedRoute'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'

interface StudentAnswer {
  id: string
  studentId: string
  studentName: string
  studentLastname: string
  olympiadName: string
  subject: string
  grade: number
  round: number
  totalScore: number | null
  maxScore: number | null
  status: 'COMPLETED' | 'IN_PROGRESS' | 'DISQUALIFIED'
  submittedAt: string
  endTime?: string
  participationId: string
}

interface OlympiadSummary {
  id: string
  name: string
  subject: string
  grade: number
  totalParticipants: number
  completedParticipants: number
  averageScore: number
}

function AdminAnswersContent() {
  const { user } = useAuth()
  const [answers, setAnswers] = useState<StudentAnswer[]>([])
  const [olympiadSummaries, setOlympiadSummaries] = useState<OlympiadSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'COMPLETED' | 'IN_PROGRESS' | 'DISQUALIFIED'>('all')
  const [selectedOlympiad, setSelectedOlympiad] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [itemsPerPage] = useState(20)

  useEffect(() => {
    fetchAnswers()
    fetchOlympiadSummaries()
  }, [filter, selectedOlympiad, currentPage])

  const fetchAnswers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        ...(filter !== 'all' && { status: filter }),
        ...(selectedOlympiad !== 'all' && { olympiadId: selectedOlympiad }),
        ...(searchTerm && { search: searchTerm })
      })

      const response = await fetch(`/api/admin/student-answers?${params}`)
      console.log('API Response status:', response.status)
      console.log('API URL:', `/api/admin/student-answers?${params}`)
      
      if (response.ok) {
        const data = await response.json()
        console.log('API Response data:', data)
        setAnswers(data.answers)
        setTotalPages(data.pagination?.totalPages || 1)
      } else {
        const errorData = await response.json()
        console.error('API Error:', errorData)
        toast.error('პასუხების ჩატვირთვისას შეცდომა მოხდა')
      }
    } catch (error) {
      console.error('Error fetching answers:', error)
      toast.error('პასუხების ჩატვირთვისას შეცდომა მოხდა')
    } finally {
      setLoading(false)
    }
  }

  const fetchOlympiadSummaries = async () => {
    try {
      const response = await fetch('/api/admin/olympiads')
      if (response.ok) {
        const data = await response.json()
        setOlympiadSummaries(data.olympiads || [])
      }
    } catch (error) {
      console.error('Error fetching olympiad summaries:', error)
    }
  }

  const handleSearch = () => {
    setCurrentPage(1)
    fetchAnswers()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800'
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800'
      case 'DISQUALIFIED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'დასრულებული'
      case 'IN_PROGRESS':
        return 'მიმდინარე'
      case 'DISQUALIFIED':
        return 'დისკვალიფიცირებული'
      default:
        return status
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ka-GE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const filteredAnswers = answers.filter(answer => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      return (
        answer.studentName.toLowerCase().includes(searchLower) ||
        answer.studentLastname.toLowerCase().includes(searchLower) ||
        answer.olympiadName.toLowerCase().includes(searchLower)
      )
    }
    return true
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-black md:text-[25px] text-[20px]">
                სტუდენტების პასუხები
              </h1>
              <p className="text-black md:text-[18px] text-[16px]">
                ნახეთ და მართეთ სტუდენტების პასუხები ოლიმპიადებში
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ოლიმპიადა
              </label>
              <select
                value={selectedOlympiad}
                onChange={(e) => setSelectedOlympiad(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">ყველა ოლიმპიადა</option>
                {olympiadSummaries.map((olympiad) => (
                  <option key={olympiad.id} value={olympiad.id}>
                    {olympiad.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                სტატუსი
              </label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">ყველა სტატუსი</option>
                <option value="COMPLETED">დასრულებული</option>
                <option value="IN_PROGRESS">მიმდინარე</option>
                <option value="DISQUALIFIED">დისკვალიფიცირებული</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ძებნა
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="სტუდენტის სახელი ან ოლიმპიადა"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleSearch}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium"
              >
                ძებნა
              </button>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                    <span className="text-white font-bold">📊</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      სულ პასუხები
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {answers.length}
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
                  <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                    <span className="text-white font-bold">✅</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      დასრულებული
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {answers.filter(a => a.status === 'COMPLETED').length}
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
                  <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                    <span className="text-white font-bold">⏳</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      მიმდინარე
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {answers.filter(a => a.status === 'IN_PROGRESS').length}
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
                  <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                    <span className="text-white font-bold">❌</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      დისკვალიფიცირებული
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {answers.filter(a => a.status === 'DISQUALIFIED').length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Answers Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              სტუდენტების პასუხები
            </h3>
          </div>
          
          {loading ? (
            <div className="p-6 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <p className="mt-2 text-gray-500">ჩატვირთვა...</p>
            </div>
          ) : filteredAnswers.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-gray-500">პასუხები ვერ მოიძებნა</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      სტუდენტი
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ოლიმპიადა
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      სტატუსი
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      წარდგენის თარიღი
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      მოქმედებები
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAnswers.map((answer) => (
                    <tr key={answer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {answer.studentName} {answer.studentLastname}
                        </div>
                        <div className="text-sm text-gray-500">
                          კლასი: {answer.grade}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {answer.olympiadName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {answer.subject} - რაუნდი {answer.round}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(answer.status)}`}>
                          {getStatusText(answer.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(answer.submittedAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link
                          href={`/admin/olympiads/answers/${answer.participationId}`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          დეტალები
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  გვერდი {currentPage} {totalPages}-დან
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    წინა
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    შემდეგი
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function AdminAnswersPage() {
  return (
    <AdminOnly>
      <AdminAnswersContent />
    </AdminOnly>
  )
}
