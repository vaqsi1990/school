'use client'

import { AdminOnly } from '@/components/auth/ProtectedRoute'
import Link from 'next/link'
import { useState, useEffect } from 'react'

interface Teacher {
  id: string
  name: string
  lastname: string
  email: string
  subject: string
  school: string
  phone: string
  isVerified: boolean
  canCreateQuestions: boolean
  canReviewAnswers: boolean
  createdAt: string
  updatedAt: string
}

function AdminTeachersContent() {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingPermissions, setUpdatingPermissions] = useState<string | null>(null)
  const [updatingVerification, setUpdatingVerification] = useState<string | null>(null)
  const [updatingQuestionPermission, setUpdatingQuestionPermission] = useState<string | null>(null)

  useEffect(() => {
    fetchTeachers()
  }, [])

  const fetchTeachers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/teachers')
      if (response.ok) {
        const data = await response.json()
        setTeachers(data.teachers)
      } else {
        setError('მასწავლებლების ჩატვირთვა ვერ მოხერხდა')
      }
    } catch (error) {
      console.error('Error fetching teachers:', error)
      setError('დაფიქსირდა შეცდომა')
    } finally {
      setLoading(false)
    }
  }

  const toggleReviewPermission = async (teacherId: string, currentPermission: boolean) => {
    try {
      setUpdatingPermissions(teacherId)
      const response = await fetch('/api/admin/teachers/permissions', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teacherId,
          canReviewAnswers: !currentPermission
        })
      })

      if (response.ok) {
        // Update the local state
        setTeachers(prevTeachers => 
          prevTeachers.map(teacher => 
            teacher.id === teacherId 
              ? { ...teacher, canReviewAnswers: !currentPermission }
              : teacher
          )
        )
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'უფლებების განახლება ვერ მოხერხდა')
      }
    } catch (error) {
      console.error('Error updating permissions:', error)
      setError('დაფიქსირდა შეცდომა')
    } finally {
      setUpdatingPermissions(null)
    }
  }

  const toggleVerification = async (teacherId: string, currentVerification: boolean) => {
    try {
      setUpdatingVerification(teacherId)
      const response = await fetch('/api/admin/teachers/verify', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teacherId,
          isVerified: !currentVerification,
          canCreateQuestions: teachers.find(t => t.id === teacherId)?.canCreateQuestions
        })
      })

      if (response.ok) {
        // Update the local state
        setTeachers(prevTeachers => 
          prevTeachers.map(teacher => 
            teacher.id === teacherId 
              ? { ...teacher, isVerified: !currentVerification }
              : teacher
          )
        )
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'ვერიფიკაციის განახლება ვერ მოხერხდა')
      }
    } catch (error) {
      console.error('Error updating verification:', error)
      setError('დაფიქსირდა შეცდომა')
    } finally {
      setUpdatingVerification(null)
    }
  }

  const toggleQuestionPermission = async (teacherId: string, currentPermission: boolean) => {
    try {
      setUpdatingQuestionPermission(teacherId)
      const response = await fetch('/api/admin/teachers/verify', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teacherId,
          isVerified: true, // Keep current verification status
          canCreateQuestions: !currentPermission
        })
      })

      if (response.ok) {
        // Update the local state
        setTeachers(prevTeachers => 
          prevTeachers.map(teacher => 
            teacher.id === teacherId 
              ? { ...teacher, canCreateQuestions: !currentPermission }
              : teacher
          )
        )
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'კითხვის დასმის უფლების განახლება ვერ მოხერხდა')
      }
    } catch (error) {
      console.error('Error updating question permission:', error)
      setError('დაფიქსირდა შეცდომა')
    } finally {
      setUpdatingQuestionPermission(null)
    }
  }
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className=" mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-[25px] font-bold text-black ">
            მასწავლებლების მართვა
          </h1>
          <p className="mt-2 text-black md:text-[18px] text-[16px]">
            მასწავლებლების სიის ნახვა და მართვა
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900 md:text-[20px] text-[18px]">
              მასწავლებლების სია
            </h2>
            <button className="bg-[#034e64] cursor-pointer text-white px-4 py-2 rounded-md md:text-[20px] text-[16px] font-bold transition-colors hover:bg-[#023a4d]">
              ახალი მასწავლებელი
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600 md:text-[18px] text-[16px]">{error}</p>
              <button 
                onClick={fetchTeachers}
                className="mt-4 bg-[#034e64] cursor-pointer text-white px-4 py-2 rounded-md md:text-[20px] text-[16px] font-bold transition-colors hover:bg-[#023a4d]"
              >
                ხელახლა ცდა
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left md:text-[16px] text-[14px] text-black uppercase tracking-wider">
                      სახელი
                    </th>
                    <th className="px-6 py-3 text-left md:text-[16px] text-[14px] text-black uppercase tracking-wider">
                      გვარი
                    </th>
                    <th className="px-6 py-3 text-left md:text-[16px] text-[14px] text-black uppercase tracking-wider">
                      ელ-ფოსტა
                    </th>
                    <th className="px-6 py-3 text-left md:text-[16px] text-[14px] text-black uppercase tracking-wider">
                      საგანი
                    </th>
                    <th className="px-6 py-3 text-left md:text-[16px] text-[14px] text-black uppercase tracking-wider">
                      სკოლა
                    </th>
                    <th className="px-6 py-3 text-left md:text-[16px] text-[14px] text-black uppercase tracking-wider">
                      ვერიფიკაცია
                    </th>
                    <th className="px-6 py-3 text-left md:text-[16px] text-[14px] text-black uppercase tracking-wider">
                      კითხვის დასმა
                    </th>
                    <th className="px-6 py-3 text-left md:text-[16px] text-[14px] text-black uppercase tracking-wider">
                      პასუხების შემოწმება
                    </th>
                   
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {teachers.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-6 py-4 text-center text-gray-500 md:text-[18px] text-[16px]">
                        მასწავლებლები არ არის
                      </td>
                    </tr>
                  ) : (
                    teachers.map((teacher) => (
                      <tr key={teacher.id}>
                        <td className="px-6 py-4 whitespace-nowrap  text-black text-[14px] ">
                          {teacher.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap  text-black text-[14px] ">
                          {teacher.lastname}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap  text-black text-[14px] ">
                          {teacher.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap  text-black text-[14px] ">
                          {teacher.subject}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap  text-black text-[14px] ">
                          {teacher.school}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap  text-black text-[14px] ">
                          <button
                            onClick={() => toggleVerification(teacher.id, teacher.isVerified)}
                            disabled={updatingVerification === teacher.id}
                            className={`mt-4 w-full cursor-pointer  text-white px-4 py-2 rounded-md  text-[16px] font-bold ${
                              teacher.isVerified 
                                ? 'bg-green-600 text-white' 
                                : 'bg-[#f06905] text-white '
                            } ${updatingVerification === teacher.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                          >
                            {updatingVerification === teacher.id ? (
                              <span className="flex items-center">
                                <div className="animate-spin rounded-full h-3 w-3 border-b border-current mr-1"></div>
                                მიმდინარეობს...
                              </span>
                            ) : (
                              teacher.isVerified ? 'ვერიფიცირებულია' : 'არ არის ვერიფ'
                            )}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap  text-black text-[14px] ">
                          <button
                            onClick={() => toggleQuestionPermission(teacher.id, teacher.canCreateQuestions)}
                            disabled={updatingQuestionPermission === teacher.id}
                            className={`mt-4 w-full cursor-pointer  text-white px-4 py-2 rounded-md  text-[16px] font-bold ${
                              teacher.canCreateQuestions 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-gray-400 text-white'
                            } ${updatingQuestionPermission === teacher.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                          >
                            {updatingQuestionPermission === teacher.id ? (
                              <span className="flex items-center">
                                <div className="animate-spin rounded-full h-3 w-3 border-b border-current mr-1"></div>
                                მიმდინარეობს...
                              </span>
                            ) : (
                              teacher.canCreateQuestions ? 'აქ უფლებაა' : 'არ აქ'
                            )}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900  text-[16px]">
                          <button
                            onClick={() => toggleReviewPermission(teacher.id, teacher.canReviewAnswers)}
                            disabled={updatingPermissions === teacher.id}
                            className={`mt-4 w-full cursor-pointer  text-black px-4 py-2 rounded-md  text-[16px] font-bold ${
                              teacher.canReviewAnswers
                                ? 'bg-red-600  text-white hover:bg-red-700'
                                : 'bg-gray-100 text-black hover:bg-gray-200'
                            } ${updatingPermissions === teacher.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                          >
                            {updatingPermissions === teacher.id ? (
                              <span className="flex items-center">
                                <div className="animate-spin rounded-full h-3 w-3 border-b border-current mr-1"></div>
                                მიმდინარეობს...
                              </span>
                            ) : (
                              teacher.canReviewAnswers ? 'აქტიური' : 'არააქტიური'
                            )}
                          </button>
                        </td>
                       
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-between items-center">
          <Link 
            href="/admin/dashboard"
            className="bg-[#034e64] cursor-pointer text-white px-4 py-2 rounded-md md:text-[20px] text-[16px] font-bold transition-colors hover:bg-[#023a4d]"
          >
            დაბრუნება დაშბორდზე
          </Link>
          
          <div className="flex space-x-2">
            <button className="bg-[#034e64] cursor-pointer text-white px-4 py-2 rounded-md md:text-[20px] text-[16px] font-bold transition-colors hover:bg-[#023a4d]">
              ექსპორტი
            </button>
            <button className="bg-[#034e64] cursor-pointer text-white px-4 py-2 rounded-md md:text-[20px] text-[16px] font-bold transition-colors hover:bg-[#023a4d]">
              იმპორტი
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AdminTeachersPage() {
  return (
    <AdminOnly>
      <AdminTeachersContent />
    </AdminOnly>
  )
}
