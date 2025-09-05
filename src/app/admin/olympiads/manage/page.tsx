'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface QuestionPackage {
  id: string
  name: string
  description: string
}

interface CreatedByUser {
  name: string
  lastname: string
  user: {
    email: string
  }
}

interface OlympiadEvent {
  id: string
  name: string
  description: string
  startDate: string
  endDate: string
  registrationDeadline: string
  maxParticipants: number
  isActive: boolean
  rounds: number
  subjects: string[]
  grades: number[]
  questionTypes: string[]
  questionTypeQuantities?: Record<string, number> | null
  minimumPointsThreshold?: number | null
  packages: QuestionPackage[]
  createdByUser: CreatedByUser
  _count: {
    participations: number
  }
  createdAt: string
}

interface PaginationInfo {
  page: number
  limit: number
  total: number
  pages: number
}

export default function ManageOlympiadsPage() {
  const [olympiads, setOlympiads] = useState<OlympiadEvent[]>([])
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [isActiveFilter, setIsActiveFilter] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchOlympiads()
  }, [pagination.page, searchTerm, isActiveFilter])

  const fetchOlympiads = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString()
      })

      if (searchTerm.trim()) {
        params.append('search', searchTerm)
      }

      if (isActiveFilter !== 'all') {
        params.append('isActive', isActiveFilter)
      }

      const response = await fetch(`/api/admin/olympiads?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch olympiads')
      }

      const data = await response.json()
      setOlympiads(data.olympiads)
      setPagination(data.pagination)
    } catch (err) {
      setError('ოლიმპიადების ჩატვირთვისას შეცდომა მოხდა')
      console.error('Error fetching olympiads:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }))
  }

  const handleStatusToggle = async (olympiadId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/olympiads/${olympiadId}/toggle-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      })

      if (response.ok) {
        // Refresh the olympiads list
        fetchOlympiads()
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'სტატუსის ცვლილებისას შეცდომა მოხდა')
      }
    } catch (err) {
      setError('სისტემური შეცდომა მოხდა')
      console.error('Error toggling status:', err)
    }
  }

  const handleDeleteOlympiad = async (olympiadId: string, olympiadName: string) => {
    if (!confirm(`ნამდვილად გსურთ "${olympiadName}" ოლიმპიადის წაშლა? ეს მოქმედება შეუქცევადია.`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/olympiads/${olympiadId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // Refresh the olympiads list
        fetchOlympiads()
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'ოლიმპიადის წაშლისას შეცდომა მოხდა')
      }
    } catch (err) {
      setError('სისტემური შეცდომა მოხდა')
      console.error('Error deleting olympiad:', err)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ka-GE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'Asia/Tbilisi'
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('ka-GE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Tbilisi'
    })
  }

  const getQuestionTypeLabel = (type: string) => {
    const typeLabels: Record<string, string> = {
      'MULTIPLE_CHOICE': 'მრავალარჩევანიანი',
      'TRUE_FALSE': 'სწორი/არასწორი',
      'MATCHING': 'შესაბამისობა',
      'TEXT_ANALYSIS': 'ტექსტის ანალიზი',
      'MAP_ANALYSIS': 'რუკის ანალიზი',
      'OPEN_ENDED': 'ღია კითხვა',
      'CLOSED_ENDED': 'დახურული კითხვა'
    }
    return typeLabels[type] || type
  }

  if (isLoading && olympiads.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#034e64] mx-auto mb-4"></div>
              <p className="text-black md:text-[20px] text-[18px]">იტვირთება...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-black md:text-[20px] text-[18px] font-bold">
              ოლიმპიადების მართვა
            </h1>
            <Link
              href="/admin/olympiads/create"
              className="bg-[#034e64] cursor-pointer text-white px-4 py-2 rounded-md md:text-[20px] text-[16px] font-bold transition-colors hover:bg-[#023a4d]"
            >
              ახალი ოლიმპიადა
            </Link>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="ძიება ოლიმპიადის სახელით ან აღწერით..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#034e64] text-black md:text-[18px] text-[16px]"
                />
              </div>
              <div className="flex gap-4">
                <select
                  value={isActiveFilter}
                  onChange={(e) => setIsActiveFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#034e64] text-black md:text-[18px] text-[16px]"
                >
                  <option value="all">ყველა სტატუსი</option>
                  <option value="true">აქტიური</option>
                  <option value="false">არააქტიური</option>
                </select>
                <button
                  type="submit"
                  className="bg-[#034e64] cursor-pointer text-white px-4 py-2 rounded-md md:text-[20px] text-[16px] font-bold transition-colors hover:bg-[#023a4d]"
                >
                  ძიება
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Olympiads List */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {olympiads.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-black md:text-[20px] text-[18px] text-gray-500">
                {searchTerm || isActiveFilter !== 'all' 
                  ? 'ძიების შედეგები ვერ მოიძებნა' 
                  : 'ოლიმპიადები ვერ მოიძებნა'
                }
              </p>
              {searchTerm || isActiveFilter !== 'all' ? (
                <button
                  onClick={() => {
                    setSearchTerm('')
                    setIsActiveFilter('all')
                    setPagination(prev => ({ ...prev, page: 1 }))
                  }}
                  className="mt-4 bg-[#034e64] cursor-pointer text-white px-4 py-2 rounded-md md:text-[20px] text-[16px] font-bold transition-colors hover:bg-[#023a4d]"
                >
                  ყველა ოლიმპიადის ნახვა
                </button>
              ) : (
                <Link
                  href="/admin/olympiads/create"
                  className="mt-4 inline-block bg-[#034e64] cursor-pointer text-white px-4 py-2 rounded-md md:text-[20px] text-[16px] font-bold transition-colors hover:bg-[#023a4d]"
                >
                  პირველი ოლიმპიადის შექმნა
                </Link>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ოლიმპიადა
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        თარიღები
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        დეტალები
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
                    {olympiads.map((olympiad) => (
                      <tr key={olympiad.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-black md:text-[20px] text-[18px] font-medium">
                              {olympiad.name}
                            </div>
                            <div className="text-gray-500 md:text-[16px] text-[14px] mt-1">
                              {olympiad.description.length > 100 
                                ? `${olympiad.description.substring(0, 100)}...` 
                                : olympiad.description
                              }
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-black md:text-[16px] text-[14px]">
                            <div><strong>დაწყება:</strong> {formatDateTime(olympiad.startDate)}</div>
                            <div><strong>დასრულება:</strong> {formatDateTime(olympiad.endDate)}</div>
                            <div><strong>რეგისტრაცია:</strong> {formatDate(olympiad.registrationDeadline)}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-black md:text-[16px] text-[14px]">
                            <div><strong>საგნები:</strong> {olympiad.subjects.join(', ')}</div>
                            <div><strong>კლასები:</strong> {olympiad.grades.join(', ')}</div>
                                                                                      <div><strong>კითხვების ტიპები:</strong> {olympiad.questionTypes.map((type, index) => `${index + 1}. ${getQuestionTypeLabel(type)}`).join(', ')}</div>
                              {olympiad.questionTypeQuantities && (
                                <div><strong>კითხვების რაოდენობა:</strong> {Object.entries(olympiad.questionTypeQuantities).map(([type, qty]) => `${getQuestionTypeLabel(type)}: ${qty}`).join(', ')}</div>
                              )}
                            <div><strong>რაუნდები:</strong> {olympiad.rounds}</div>
                            <div><strong>პაკეტები:</strong> {olympiad.packages.length}</div>
                            <div><strong>მონაწილეები:</strong> {olympiad._count.participations}/{olympiad.maxParticipants}</div>
                            {olympiad.minimumPointsThreshold && (
                              <div><strong>მინ. ქულის ზღვარი:</strong> {olympiad.minimumPointsThreshold} ქულა</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            olympiad.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {olympiad.isActive ? 'აქტიური' : 'არააქტიური'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleStatusToggle(olympiad.id, olympiad.isActive)}
                              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                                olympiad.isActive
                                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                  : 'bg-green-100 text-green-700 hover:bg-green-200'
                              }`}
                            >
                              {olympiad.isActive ? 'გათიშვა' : 'ჩართვა'}
                            </button>
                            <Link
                              href={`/admin/olympiads/${olympiad.id}/edit`}
                              className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1 rounded-md text-xs font-medium transition-colors"
                            >
                              რედაქტირება
                            </Link>
                            <button
                              onClick={() => handleDeleteOlympiad(olympiad.id, olympiad.name)}
                              disabled={olympiad._count.participations > 0}
                              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                                olympiad._count.participations > 0
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                  : 'bg-red-100 text-red-700 hover:bg-red-200'
                              }`}
                              title={olympiad._count.participations > 0 ? 'წაშლა შეუძლებელია - არის მონაწილეები' : 'ოლიმპიადის წაშლა'}
                            >
                              წაშლა
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
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
                      disabled={pagination.page === pagination.pages}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      შემდეგი
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        ნაჩვენებია <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> 
                        {' '}-{' '}
                        <span className="font-medium">
                          {Math.min(pagination.page * pagination.limit, pagination.total)}
                        </span> 
                        {' '}ყველა <span className="font-medium">{pagination.total}</span> ჩანაწერიდან
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                        <button
                          onClick={() => handlePageChange(pagination.page - 1)}
                          disabled={pagination.page === 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span className="sr-only">წინა</span>
                          ←
                        </button>
                        
                        {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                          let pageNum
                          if (pagination.pages <= 5) {
                            pageNum = i + 1
                          } else if (pagination.page <= 3) {
                            pageNum = i + 1
                          } else if (pagination.page >= pagination.pages - 2) {
                            pageNum = pagination.pages - 4 + i
                          } else {
                            pageNum = pagination.page - 2 + i
                          }
                          
                          return (
                            <button
                              key={pageNum}
                              onClick={() => handlePageChange(pageNum)}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                pageNum === pagination.page
                                  ? 'z-10 bg-[#034e64] border-[#034e64] text-white'
                                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                              }`}
                            >
                              {pageNum}
                            </button>
                          )
                        })}
                        
                        <button
                          onClick={() => handlePageChange(pagination.page + 1)}
                          disabled={pagination.page === pagination.pages}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span className="sr-only">შემდეგი</span>
                          →
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
