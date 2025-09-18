'use client'

import { useAuth } from '@/hooks/useAuth'
import { TeacherOnly } from '@/components/auth/ProtectedRoute'
import Link from 'next/link'
import { useState, useEffect } from 'react'

interface TeacherProfile {
  id: string
  name: string
  lastname: string
  email: string
  subject: string
  school: string
  phone: string
  isVerified: boolean
  createdAt: string
  updatedAt: string
}

function TeacherDashboardContent() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<TeacherProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [canReviewAnswers, setCanReviewAnswers] = useState(false)
  const [permissionLoading, setPermissionLoading] = useState(true)
  
  useEffect(() => {
    fetchProfile()
    checkPermissions()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/teacher/profile')
      if (response.ok) {
        const data = await response.json()
        setProfile(data.profile)
      } else {
        console.error('Failed to fetch profile')
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkPermissions = async () => {
    try {
      setPermissionLoading(true)
      const response = await fetch('/api/teacher/permissions')
      if (response.ok) {
        const data = await response.json()
        setCanReviewAnswers(data.canReviewAnswers)
      } else {
        setCanReviewAnswers(false)
      }
    } catch (error) {
      console.error('Error checking permissions:', error)
      setCanReviewAnswers(false)
    } finally {
      setPermissionLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-black md:text-[25px] text-[20px]">
                მასწავლებლის პროფილი
              </h1>
              <p className="text-black md:text-[18px] text-[16px]">
                კეთილი იყოს თქვენი მობრძანება, {profile?.name || user?.teacher?.name || user?.email} {profile?.lastname || user?.teacher?.lastname || ''}
              </p>
              <p className="text-black md:text-[16px] text-[14px]">
                როლი: მასწავლებელი
              </p>
            </div>
           
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Enhanced Teacher Info Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">პროფილის ინფორმაცია</h3>
                </div>
              </div>
              <div className="mt-4 space-y-3">
                <div className="flex justify-between">
                  <span className="md:text-[16px] text-[14px] text-black">სახელი:</span>
                  <span className="md:text-[16px] text-[14px] font-medium text-black">
                    {loading ? 'იტვირთება...' : (profile?.name || user?.teacher?.name || 'არ არის მითითებული')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="md:text-[16px] text-[14px] text-black">გვარი:</span>
                  <span className="md:text-[16px] text-[14px] font-medium text-black">
                    {loading ? 'იტვირთება...' : (profile?.lastname || user?.teacher?.lastname || 'არ არის მითითებული')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="md:text-[16px] text-[14px] text-black">საგანი:</span>
                  <span className="md:text-[16px] text-[14px] font-medium text-black">
                    {loading ? 'იტვირთება...' : (profile?.subject || user?.teacher?.subject || 'არ არის მითითებული')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="md:text-[16px] text-[14px] text-black">სკოლა:</span>
                  <span className="md:text-[16px] text-[14px] font-medium text-black">
                    {loading ? 'იტვირთება...' : (profile?.school || user?.teacher?.school || 'არ არის მითითებული')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="md:text-[16px] text-[14px] text-black">ტელეფონი:</span>
                  <span className="md:text-[16px] text-[14px] font-medium text-black">
                    {loading ? 'იტვირთება...' : (profile?.phone || user?.teacher?.phone || 'არ არის მითითებული')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="md:text-[16px] text-[14px] text-black">სტატუსი:</span>
                  <span className={`md:text-[16px] text-[14px] font-medium ${profile?.isVerified || user?.teacher?.isVerified ? 'text-green-600' : 'text-yellow-600'}`}>
                    {loading ? 'იტვირთება...' : ((profile?.isVerified || user?.teacher?.isVerified) ? 'ვერიფიცირებული' : 'ვერიფიკაციის პროცესში')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="md:text-[16px] text-[14px] text-black">ელ-ფოსტა:</span>
                  <span className="md:text-[16px] text-[14px] font-medium text-black">
                    {loading ? 'იტვირთება...' : (profile?.email || user?.email || 'არ არის მითითებული')}
                  </span>
                </div>
              
              </div>
            </div>
          </div>



                     {/* View Olympiads Card */}
           <div className="bg-white overflow-hidden shadow rounded-lg">
             <div className="p-6">
               <div className="flex items-center">
                 <div className="flex-shrink-0">
                   <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                     <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                     </svg>
                   </div>
                 </div>
                 <div className="ml-4">
                   <h3 className="text-lg font-medium text-gray-900">კითხვების ნახვა</h3>
                 </div>
               </div>
               <div className="mt-4">
                   <p className="text-black md:text-[18px] text-[16px]">
                   ნახეთ არსებული კითხვები.
                 </p>
                 <button className="mt-4 w-full cursor-pointer bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md md:text-[18px] text-[16px] font-medium text-black">
                   <Link href="/teacher/questions" className="block w-full h-full text-white">
                    კითხვების ნახვა
                   </Link>
                 </button>
               </div>
             </div>
           </div>

           {/* Blog Management Card */}
           <div className="bg-white overflow-hidden shadow rounded-lg">
             <div className="p-6">
               <div className="flex items-center">
                 <div className="flex-shrink-0">
                   <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                     <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                     </svg>
                   </div>
                 </div>
                 <div className="ml-4">
                   <h3 className="text-lg font-medium text-gray-900">ბლოგის მართვა</h3>
                 </div>
               </div>
               <div className="mt-4">
                 <p className="text-black md:text-[18px] text-[16px]">
                   შექმენით და მართეთ ბლოგის სტატიები.
                 </p>
                 <button className="mt-4 w-full cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md md:text-[18px] text-[16px] font-medium">
                   <Link href="/teacher/blog" className="block w-full h-full text-white">
                     ბლოგის მართვა
                   </Link>
                 </button>
               </div>
             </div>
           </div>

                       {/* Check Answers Card */}
            <div className={`overflow-hidden shadow rounded-lg ${canReviewAnswers ? 'bg-white' : 'bg-gray-100'}`}>
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${canReviewAnswers ? 'bg-green-500' : 'bg-gray-400'}`}>
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">პასუხების შემოწმება</h3>
                    {!permissionLoading && (
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        canReviewAnswers 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {canReviewAnswers ? 'უფლება არის' : 'უფლება არ არის'}
                      </span>
                    )}
                  </div>
                </div>
                <div className="mt-4">
                    <p className={`md:text-[18px] text-[16px] ${canReviewAnswers ? 'text-black' : 'text-gray-500'}`}>
                    {canReviewAnswers 
                      ? 'შეამოწმეთ სტუდენტების პასუხები და შედეგები.'
                      : 'პასუხების შემოწმების უფლება ადმინისტრატორმა უნდა მიანიჭოს.'
                    }
                  </p>
                  {canReviewAnswers ? (
                    <button className="mt-4 w-full cursor-pointer bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md md:text-[18px] text-[16px] font-medium text-black">
                      <Link href="/teacher/answers" className="block w-full h-full text-white">
                       პასუხების შემოწმება
                      </Link>
                    </button>
                  ) : (
                    <button 
                      disabled 
                      className="mt-4 w-full cursor-not-allowed bg-gray-400 text-white px-4 py-2 rounded-md md:text-[18px] text-[16px] font-medium text-black"
                    >
                      უფლება არ არის
                    </button>
                  )}
                </div>
              </div>
            </div>
        </div>
      </div>
    </div>
  )
}

export default function TeacherDashboardPage() {
  return (
    <TeacherOnly>
      <TeacherDashboardContent />
    </TeacherOnly>
  )
}
