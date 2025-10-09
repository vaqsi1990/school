'use client'

import { useState, useEffect } from 'react'
import { TeacherOnly } from '@/components/auth/ProtectedRoute'
import Link from 'next/link'

interface TeacherProfile {
  id: string
  name: string
  lastname: string
  email: string
  subject: string
  school: string
  phone: string
  isVerified: boolean
  canCreateQuestions: boolean
  createdAt: string
  updatedAt: string
}

function TeacherOlympiadsContent() {
  const [profile, setProfile] = useState<TeacherProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/teacher/profile')
      if (response.ok) {
        const data = await response.json()
        setProfile(data.profile)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-black md:text-[25px] text-[20px]">
                ოლიმპიადების ნახვა
              </h1>
              <p className="text-black md:text-[18px] text-[16px]">
                ნახეთ არსებული ოლიმპიადები
              </p>
            </div>
            <div className="flex gap-4">
              <Link href="/teacher/dashboard">
                <button className="bg-[#034e64] cursor-pointer text-white px-4 py-2 rounded-md md:text-[20px] text-[16px] font-bold transition-colors hover:bg-[#023a4d]">
                  პროფილზე დაბრუნება
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-black md:text-[20px] text-[18px] font-semibold mb-4">
            ხელმისაწვდომი ფუნქციები
          </h2>
          <p className="text-black md:text-[20px] text-[18px] mb-6">
            {profile?.isVerified 
              ? 'მასწავლებლებს შეუძლიათ კითხვების დამატება და ნახვა'
              : 'მასწავლებლებს შეუძლიათ მხოლოდ კითხვების ნახვა'
            }
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* View Questions Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                                 <h3 className="text-black md:text-[20px] text-[18px] font-semibold">
                   კითხვები
                   </h3>
                 </div>
               </div>
               <p className="text-black md:text-[20px] text-[18px] mb-4">
                 {profile?.canCreateQuestions 
                   ? 'დაამატეთ და მართეთ კითხვები თქვენი საგნისთვის'
                   : 'შემოგვთავაზეთ კითხვები განსახილველად'
                 }
               </p>
               {profile?.isVerified && (
                 <Link href="/teacher/questions">
                   <button className="bg-[#034e64] cursor-pointer text-white px-4 py-2 rounded-md md:text-[20px] text-[16px] font-bold transition-colors hover:bg-[#023a4d]">
                     {profile?.canCreateQuestions ? 'კითხვების დამატება' : 'კითხვის გაგზავნა'}
                   </button>
                 </Link>
               )}
            </div>
          </div>

          {/* Information Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg border-2 border-blue-200">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-black md:text-[20px] text-[18px] font-semibold">
                    მნიშვნელოვანი ინფორმაცია
                  </h3>
                </div>
              </div>
              <p className="text-black md:text-[20px] text-[18px] mb-4">
                ოლიმპიადების და პაკეტების შექმნა და მართვა მხოლოდ ადმინისტრატორებს შეუძლიათ
              </p>
              <div className="bg-blue-50 p-3 rounded-md">
                <p className="text-blue-800 md:text-[16px] text-[14px]">
                  {profile?.isVerified 
                    ? 'მასწავლებლებს შეუძლიათ კითხვების დამატება და ნახვა'
                    : 'მასწავლებლებს შეუძლიათ მხოლოდ კითხვების ნახვა'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Information Section */}
        <div className="mt-12">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-blue-50">
              <div className="flex items-center">
                <svg className="w-6 h-6 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h4 className="text-black md:text-[20px] text-[18px] font-medium">
                  ოლიმპიადების მართვის შესახებ
                </h4>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3"></div>
                  <p className="text-black md:text-[18px] text-[16px]">
                    <strong>ოლიმპიადების შექმნა:</strong> მხოლოდ ადმინისტრატორებს შეუძლიათ ახალი ოლიმპიადების შექმნა
                  </p>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3"></div>
                  <p className="text-black md:text-[18px] text-[16px]">
                    <strong>კითხვების პაკეტები:</strong> კითხვების პაკეტების შექმნა და მართვა მხოლოდ ადმინისტრატორებს შეუძლიათ
                  </p>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3"></div>
                  <p className="text-black md:text-[18px] text-[16px]">
                    <strong>კითხვების დამატება:</strong> ვერიფიცირებულ მასწავლებლებს შეუძლიათ პირდაპირ დამატება, ვერიფიკაციის პროცესში მყოფებს - გაგზავნა განსახილველად
                  </p>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3"></div>
                  <p className="text-black md:text-[18px] text-[16px]">
                    <strong>შედეგების ნახვა:</strong> მასწავლებლებს შეუძლიათ სტუდენტების შედეგების ნახვა
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function TeacherOlympiadsPage() {
  return (
    <TeacherOnly>
      <TeacherOlympiadsContent />
    </TeacherOnly>
  )
}
