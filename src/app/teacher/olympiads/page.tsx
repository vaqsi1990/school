'use client'


import { TeacherOnly } from '@/components/auth/ProtectedRoute'
import Link from 'next/link'

function TeacherOlympiadsContent() {


  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-black md:text-[25px] text-[20px]">
                ოლიმპიადების მართვა
              </h1>
              <p className="text-black md:text-[18px] text-[16px]">
                მართეთ თქვენი შექმნილი ოლიმპიადები
              </p>
            </div>
            <div className="flex gap-4">
              <Link href="/teacher/dashboard">
                <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md md:text-[18px] text-[16px] font-bold">
                  დეშბორდზე დაბრუნება
                </button>
              </Link>
             
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-black md:text-[20px] text-[18px] font-semibold mb-4">
            ოლიმპიადების სია
          </h2>
          <p className="text-black md:text-[20px] text-[18px] mb-6">
            აქ შეგიძლიათ ნახოთ და მართოთ თქვენი შექმნილი ოლიმპიადები
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Create New Olympiad Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg border-2 border-dashed border-gray-300">
            <div className="p-6 text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-[#034e64] rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
              </div>
              <h3 className="text-black md:text-[20px] text-[18px] font-semibold mb-2">
                ახალი ოლიმპიადის შექმნა
              </h3>
              <p className="text-black md:text-[20px] text-[18px] mb-4">
                შექმენით ახალი ოლიმპიადა სტუდენტებისთვის
              </p>
              <button className="bg-[#034e64] cursor-pointer text-white px-4 py-2 rounded-md md:text-[20px] text-[16px] font-bold transition-colors hover:bg-[#023a4d]">
                ოლიმპიადის შექმნა
              </button>
            </div>
          </div>

          {/* Manage Questions Card */}
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
                    კითხვების მართვა
                  </h3>
                </div>
              </div>
              <p className="text-black md:text-[20px] text-[18px] mb-4">
                მართეთ არსებული კითხვები და დამატეთ ახალი
              </p>
              <button className="bg-[#034e64] cursor-pointer text-white px-4 py-2 rounded-md md:text-[20px] text-[16px] font-bold transition-colors hover:bg-[#023a4d]">
                კითხვების ნახვა
              </button>
            </div>
          </div>

          {/* Manage Packages Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-black md:text-[20px] text-[18px] font-semibold">
                    პაკეტების მართვა
                  </h3>
                </div>
              </div>
              <p className="text-black md:text-[20px] text-[18px] mb-4">
                შექმენით და მართეთ კითხვების პაკეტები თქვენი საგნისთვის
              </p>
              <Link href="/teacher/olympiads/packages">
                <button className="bg-[#034e64] cursor-pointer text-white px-4 py-2 rounded-md md:text-[20px] text-[16px] font-bold transition-colors hover:bg-[#023a4d]">
                  პაკეტების ნახვა
                </button>
              </Link>
            </div>
          </div>

          {/* View Results Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-black md:text-[20px] text-[18px] font-semibold">
                    შედეგების ნახვა
                  </h3>
                </div>
              </div>
              <p className="text-black md:text-[20px] text-[18px] mb-4">
                ნახეთ სტუდენტების შედეგები ოლიმპიადებში
              </p>
              <button className="bg-[#034e64] cursor-pointer text-white px-4 py-2 rounded-md md:text-[20px] text-[16px] font-bold transition-colors hover:bg-[#023a4d]">
                შედეგების ნახვა
              </button>
            </div>
          </div>
        </div>

        {/* Olympiads List Section */}
        <div className="mt-12">
          <h3 className="text-black md:text-[20px] text-[18px] font-semibold mb-6">
            არსებული ოლიმპიადები
          </h3>
          
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h4 className="text-black md:text-[20px] text-[18px] font-medium">
                  ოლიმპიადების სია
                </h4>
                <button className="bg-[#034e64] cursor-pointer text-white px-4 py-2 rounded-md md:text-[20px] text-[16px] font-bold transition-colors hover:bg-[#023a4d]">
                  ფილტრის გამოყენება
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <p className="text-black md:text-[20px] text-[18px] mb-4">
                  ჯერ არ გაქვთ შექმნილი ოლიმპიადები
                </p>
                <button className="bg-[#034e64] cursor-pointer text-white px-4 py-2 rounded-md md:text-[20px] text-[16px] font-bold transition-colors hover:bg-[#023a4d]">
                  პირველი ოლიმპიადის შექმნა
                </button>
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
