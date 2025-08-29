'use client'

import { useAuth } from '@/hooks/useAuth'
import { AdminOnly } from '@/components/auth/ProtectedRoute'

function AdminDashboardContent() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-black md:text-[25px] text-[20px]">
                ადმინისტრატორის დეშბორდი
              </h1>
              <p className="text-black md:text-[18px] text-[16px]">
                კეთილი იყოს თქვენი მობრძანება, {user?.admin?.name} {user?.admin?.lastname}
              </p>
              <p className=" text-black md:text-[18px] text-[16px]">
                როლი: {user?.admin?.role === 'SUPER_ADMIN' ? 'სუპერ ადმინი' : 
                       user?.admin?.role === 'ADMIN' ? 'ადმინი' : 'მოდერატორი'}
              </p>
            </div>
            <button
              onClick={logout}
              className="bg-red-600 cursor-pointer hover:bg-red-700 text-white px-4 py-2 rounded-md md:text-[20px] text-[18px] font-bold"
            >
              გამოსვლა
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Admin Info Card */}
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
              <div className="mt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-black md:text-[18px] text-[16px]">სახელი:</span>
                  <span className=" md:text-[18px] text-[16px] font-medium text-black">{user?.admin?.name}</span>
                </div>
                <div className="flex justify-between">
                    <span className=" md:text-[18px] text-[16px] text-black">გვარი:</span>
                  <span className="font-medium text-black md:text-[18px] text-[16px]">{user?.admin?.lastname}</span>
                </div>
                <div className="flex justify-between">
                  <span className="md:text-[18px] text-[16px] text-black">როლი:</span>
                  <span className="md:text-[18px] text-[16px] font-medium text-black">
                    {user?.admin?.role === 'SUPER_ADMIN' ? 'სუპერ ადმინი' : 
                     user?.admin?.role === 'ADMIN' ? 'ადმინი' : 'მოდერატორი'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="md:text-[18px] text-[16px] text-black">ელ-ფოსტა:</span>
                  <span className="md:text-[18px] text-[16px] font-medium text-black">{user?.email}</span>
                </div>
              </div>
            </div>
          </div>

          {/* User Management Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">მომხმარებლების მართვა</h3>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-black md:text-[18px] text-[16px]">
                  მართეთ სისტემაში არსებული მომხმარებლები და მათი ნებართვები.
                </p>
                <button className="mt-4 w-full cursor-pointer bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md md:text-[18px] text-[16px] font-medium text-black">
                  მომხმარებლების ნახვა
                </button>
              </div>
            </div>
          </div>

          {/* Olympiad Management Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">ოლიმპიადების მართვა</h3>
                </div>
              </div>
              <div className="mt-4">
                <p className=" text-black md:text-[18px] text-[16px]">
                  მართეთ ყველა ოლიმპიადა, კითხვები და შედეგები.
                </p>
                <button className="mt-4 w-full cursor-pointer bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md md:text-[18px] text-[16px] font-medium text-black">
                  ოლიმპიადების ნახვა
                </button>
              </div>
            </div>
          </div>

          {/* Teacher Verification Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">მასწავლებლების ვერიფიკაცია</h3>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-black md:text-[18px] text-[16px]">
                  დაადასტურეთ მასწავლებლების ანგარიშები.
                </p>
                <button className="mt-4 w-full cursor-pointer bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md md:text-[18px] text-[16px] font-medium text-black">
                  ვერიფიკაციის ნახვა
                </button>
              </div>
            </div>
          </div>

          {/* System Statistics Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">სისტემის სტატისტიკა</h3>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-black md:text-[18px] text-[16px]">
                  იხილეთ სისტემის ზოგადი სტატისტიკა და ანალიტიკა.
                </p>
                <button className="mt-4 w-full cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md md:text-[18px] text-[16px] font-medium">
                  სტატისტიკის ნახვა
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AdminDashboardPage() {
  return (
    <AdminOnly>
      <AdminDashboardContent />
    </AdminOnly>
  )
}
