'use client'

import { TeacherOnly } from '@/components/auth/ProtectedRoute'
import Link from 'next/link'
import { useState, useEffect } from 'react'

interface StudentAnswer {
  id: string
  studentId: string // Only for internal reference
  olympiadName: string
  subject: string
  score: number
  totalQuestions: number
  submittedAt: string
  status: 'pending' | 'reviewed' | 'approved'
}

function TeacherAnswersContent() {
  const [answers, setAnswers] = useState<StudentAnswer[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'reviewed' | 'approved'>('all')
  const [hasPermission, setHasPermission] = useState(false)
  const [permissionLoading, setPermissionLoading] = useState(true)

  useEffect(() => {
    checkPermission()
  }, [])

  const checkPermission = async () => {
    try {
      setPermissionLoading(true)
      const response = await fetch('/api/teacher/permissions')
      if (response.ok) {
        const data = await response.json()
        setHasPermission(data.canReviewAnswers)
      } else {
        setHasPermission(false)
      }
    } catch (error) {
      console.error('Error checking permissions:', error)
      setHasPermission(false)
    } finally {
      setPermissionLoading(false)
    }
  }

  useEffect(() => {
    if (hasPermission) {
      // Mock data - in real app this would fetch from API
      const mockAnswers: StudentAnswer[] = [
        {
          id: '1',
          studentId: 'student_001',
          olympiadName: 'მათემატიკის ოლიმპიადა 2024',
          subject: 'მათემატიკა',
          score: 85,
          totalQuestions: 20,
          submittedAt: '2024-01-15T10:30:00Z',
          status: 'pending'
        },
        {
          id: '2',
          studentId: 'student_002',
          olympiadName: 'ფიზიკის ოლიმპიადა 2024',
          subject: 'ფიზიკა',
          score: 92,
          totalQuestions: 25,
          submittedAt: '2024-01-14T15:45:00Z',
          status: 'reviewed'
        },
        {
          id: '3',
          studentId: 'student_003',
          olympiadName: 'ქიმიის ოლიმპიადა 2024',
          subject: 'ქიმია',
          score: 78,
          totalQuestions: 30,
          submittedAt: '2024-01-13T09:20:00Z',
          status: 'approved'
        }
      ]
      
      setTimeout(() => {
        setAnswers(mockAnswers)
        setLoading(false)
      }, 1000)
    }
  }, [hasPermission])

  const filteredAnswers = answers.filter(answer => {
    if (filter === 'all') return true
    return answer.status === filter
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'reviewed':
        return 'bg-blue-100 text-blue-800'
      case 'approved':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'მიმდინარეობს'
      case 'reviewed':
        return 'შემოწმებული'
      case 'approved':
        return 'დამტკიცებული'
      default:
        return 'უცნობი'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ka-GE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (permissionLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">უფლებები შემოწმება...</p>
        </div>
      </div>
    )
  }

  if (!hasPermission) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow">
          <div className=" mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-2xl font-bold text-black md:text-[25px] text-[20px]">
                  უფლება არ არის
                </h1>
                <p className="text-black md:text-[18px] text-[16px]">
                  თქვენ არ გაქვთ პასუხების შემოწმების უფლება
                </p>
              </div>
              <div className="flex gap-4">
                <Link href="/teacher/dashboard">
                  <button className="bg-[#034e64] cursor-pointer text-white px-4 py-2 rounded-md md:text-[20px] text-[16px] font-bold transition-colors hover:bg-[#023a4d]">
                    დეშბორდზე დაბრუნება
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className=" mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-black md:text-[18px] text-[16px] font-medium">
                  უფლება არ არის
                </h3>
                <p className="text-black md:text-[16px] text-[14px] mt-1">
                  პასუხების შემოწმების უფლება მხოლოდ ადმინისტრატორმა შეგიძლიათ მიანიჭოს. გთხოვთ დაუკავშირდეთ ადმინისტრატორს.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">პასუხები იტვირთება...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className=" mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
                         <div>
               <h1 className="text-2xl font-bold text-black md:text-[25px] text-[20px]">
                 პასუხების ანონიმური შემოწმება
               </h1>
               <p className="text-black md:text-[18px] text-[16px]">
                 შეამოწმეთ პასუხები პრივატულობის დაცვით
               </p>
             </div>
            <div className="flex gap-4">
              <Link href="/teacher/dashboard">
                <button className="bg-[#034e64] cursor-pointer text-white px-4 py-2 rounded-md md:text-[20px] text-[16px] font-bold transition-colors hover:bg-[#023a4d]">
                  დეშბორდზე დაბრუნება
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

             <div className=" mx-auto px-4 sm:px-6 lg:px-8 py-8">
         {/* Information Alert */}
         <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
           <div className="flex items-center">
             <div className="flex-shrink-0">
               <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
               </svg>
             </div>
             <div className="ml-3">
               <h3 className="text-black md:text-[18px] text-[16px] font-medium">
                 პრივატულობის დაცვა
               </h3>
               <p className="text-black md:text-[16px] text-[14px] mt-1">
                 სტუდენტების პირადი ინფორმაცია (სახელი, გვარი, ელ-ფოსტა) არ ჩანს პასუხების შემოწმებისას პრივატულობის დასაცავად.
               </p>
             </div>
           </div>
         </div>

         {/* Filter Section */}
         <div className="mb-8">
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                filter === 'all' 
                  ? 'bg-[#034e64] text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              ყველა ({answers.length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                filter === 'pending' 
                  ? 'bg-[#034e64] text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              მიმდინარეობს ({answers.filter(a => a.status === 'pending').length})
            </button>
            <button
              onClick={() => setFilter('reviewed')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                filter === 'reviewed' 
                  ? 'bg-[#034e64] text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              შემოწმებული ({answers.filter(a => a.status === 'reviewed').length})
            </button>
            <button
              onClick={() => setFilter('approved')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                filter === 'approved' 
                  ? 'bg-[#034e64] text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              დამტკიცებული ({answers.filter(a => a.status === 'approved').length})
            </button>
          </div>
        </div>

        {/* Answers List */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
                     <div className="px-6 py-4 border-b border-gray-200">
             <h2 className="text-black md:text-[20px] text-[18px] font-semibold">
               ანონიმური პასუხები
             </h2>
           </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                             <thead className="bg-gray-50">
                 <tr>
                   <th className="px-6 py-3 text-left md:text-[16px] text-[14px] text-black uppercase tracking-wider">
                     პასუხის ID
                   </th>
                   <th className="px-6 py-3 text-left md:text-[16px] text-[14px] text-black uppercase tracking-wider">
                     ოლიმპიადა
                   </th>
                   <th className="px-6 py-3 text-left md:text-[16px] text-[14px] text-black uppercase tracking-wider">
                     საგანი
                   </th>
                   <th className="px-6 py-3 text-left md:text-[16px] text-[14px] text-black uppercase tracking-wider">
                     ქულა
                   </th>
                   <th className="px-6 py-3 text-left md:text-[16px] text-[14px] text-black uppercase tracking-wider">
                     სტატუსი
                   </th>
                   <th className="px-6 py-3 text-left md:text-[16px] text-[14px] text-black uppercase tracking-wider">
                     თარიღი
                   </th>
                   <th className="px-6 py-3 text-left md:text-[16px] text-[14px] text-black uppercase tracking-wider">
                     მოქმედებები
                   </th>
                 </tr>
               </thead>
               <tbody className="bg-white divide-y divide-gray-200">
                 {filteredAnswers.map((answer) => (
                   <tr key={answer.id} className="hover:bg-gray-50">
                     <td className="px-6 py-4 whitespace-nowrap">
                       <div className="flex items-center">
                         <div className="flex-shrink-0 h-10 w-10">
                           <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                             <span className="text-sm font-medium text-gray-700">
                               #{answer.id}
                             </span>
                           </div>
                         </div>
                         <div className="ml-4">
                           <div className="md:text-[16px] text-[14px] text-black font-medium">
                             პასუხი #{answer.id}
                           </div>
                           <div className="md:text-[16px] text-[14px] text-gray-500">
                             ID: {answer.studentId}
                           </div>
                         </div>
                       </div>
                     </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="md:text-[16px] text-[14px] text-black">
                        {answer.olympiadName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="md:text-[16px] text-[14px] text-black">
                        {answer.subject}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="md:text-[16px] text-[14px] text-black font-medium">
                        {answer.score}/{answer.totalQuestions}
                      </div>
                      <div className="md:text-[14px] text-[12px] text-gray-500">
                        {Math.round((answer.score / answer.totalQuestions) * 100)}%
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
                      <div className="flex space-x-2">
                        <button className="bg-[#034e64] cursor-pointer text-white px-4 py-2 rounded-md md:text-[20px] text-[16px] font-bold transition-colors hover:bg-[#023a4d] mr-2">
                          დეტალურად
                        </button>
                        {answer.status === 'pending' && (
                          <button className="bg-green-600 cursor-pointer text-white px-4 py-2 rounded-md md:text-[20px] text-[16px] font-bold transition-colors hover:bg-green-700">
                            შემოწმება
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredAnswers.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-gray-500 text-lg">პასუხები ვერ მოიძებნა</p>
            </div>
          )}
        </div>

        {/* Statistics Section */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">სულ პასუხები</p>
                  <p className="text-2xl font-semibold text-gray-900">{answers.length}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">მიმდინარეობს</p>
                  <p className="text-2xl font-semibold text-gray-900">{answers.filter(a => a.status === 'pending').length}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">შემოწმებული</p>
                  <p className="text-2xl font-semibold text-gray-900">{answers.filter(a => a.status === 'reviewed').length}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">დამტკიცებული</p>
                  <p className="text-2xl font-semibold text-gray-900">{answers.filter(a => a.status === 'approved').length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function TeacherAnswersPage() {
  return (
    <TeacherOnly>
      <TeacherAnswersContent />
    </TeacherOnly>
  )
}
