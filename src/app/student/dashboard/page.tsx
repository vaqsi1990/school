'use client'

import { useAuth } from '@/hooks/useAuth'
import { StudentOnly } from '@/components/auth/ProtectedRoute'

function StudentDashboardContent() {
  const { user, logout } = useAuth()
  
  // Debug logging to see what user data is available
  console.log('Full user object:', user);
  console.log('Student data:', user?.student);
  console.log('User type:', user?.userType);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-black md:text-[25px] text-[20px]">
                სტუდენტის დეშბორდი
              </h1>
              <p className="text-black md:text-[18px] text-[16px]">
                კეთილი იყოს თქვენი მობრძანება, {user?.student?.name || user?.email} {user?.student?.lastname || ''}
              </p>
              <p className="text-black md:text-[16px] text-[14px]">
                როლი: სტუდენტი
              </p>
            </div>
            <button
              onClick={logout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md md:text-[18px] text-[16px] font-bold"
            >
              გამოსვლა
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Enhanced Student Info Card */}
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
                  <span className="text-black md:text-[16px] text-[14px]">სახელი:</span>
                  <span className="md:text-[16px] text-[14px] font-medium text-black">
                    {user?.student?.name || 'არ არის მითითებული'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="md:text-[16px] text-[14px] text-black">გვარი:</span>
                  <span className="md:text-[16px] text-[14px] font-medium text-black">
                    {user?.student?.lastname || 'არ არის მითითებული'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="md:text-[16px] text-[14px] text-black">კლასი:</span>
                  <span className="md:text-[16px] text-[14px] font-medium text-black">
                    {user?.student?.grade || 'არ არის მითითებული'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="md:text-[16px] text-[14px] text-black">სკოლა:</span>
                  <span className="md:text-[16px] text-[14px] font-medium text-black">
                    {user?.student?.school || 'არ არის მითითებული'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="md:text-[16px] text-[14px] text-black">ტელეფონი:</span>
                  <span className="md:text-[16px] text-[14px] font-medium text-black">
                    {user?.student?.phone || 'არ არის მითითებული'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="md:text-[16px] text-[14px] text-black">კოდი:</span>
                  <span className="md:text-[16px] text-[14px] font-medium text-black">
                    {user?.student?.code || 'არ არის მითითებული'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="md:text-[16px] text-[14px] text-black">ელ-ფოსტა:</span>
                  <span className="md:text-[16px] text-[14px] font-medium text-black">
                    {user?.email || 'არ არის მითითებული'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="md:text-[16px] text-[14px] text-black">მომხმარებლის ID:</span>
                  <span className="md:text-[16px] text-[14px] font-medium text-black">
                    {user?.id || 'არ არის მითითებული'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Debug Information Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">სესიის ინფორმაცია</h3>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="text-xs text-gray-600">
                  <strong>User ID:</strong> {user?.id || 'N/A'}
                </div>
                <div className="text-xs text-gray-600">
                  <strong>Email:</strong> {user?.email || 'N/A'}
                </div>
                <div className="text-xs text-gray-600">
                  <strong>User Type:</strong> {user?.userType || 'N/A'}
                </div>
                <div className="text-xs text-gray-600">
                  <strong>Has Student Data:</strong> {user?.student ? 'Yes' : 'No'}
                </div>
                {user?.student && (
                  <>
                    <div className="text-xs text-gray-600">
                      <strong>Student ID:</strong> {user.student.id || 'N/A'}
                    </div>
                    <div className="text-xs text-gray-600">
                      <strong>Student Name:</strong> {user.student.name || 'N/A'}
                    </div>
                    <div className="text-xs text-gray-600">
                      <strong>Student Lastname:</strong> {user.student.lastname || 'N/A'}
                    </div>
                    <div className="text-xs text-gray-600">
                      <strong>Student Grade:</strong> {user.student.grade || 'N/A'}
                    </div>
                    <div className="text-xs text-gray-600">
                      <strong>Student School:</strong> {user.student.school || 'N/A'}
                    </div>
                    <div className="text-xs text-gray-600">
                      <strong>Student Phone:</strong> {user.student.phone || 'N/A'}
                    </div>
                    <div className="text-xs text-gray-600">
                      <strong>Student Code:</strong> {user.student.code || 'N/A'}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Olympiads Card */}
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
                  <h3 className="text-lg font-medium text-gray-900">ოლიმპიადები</h3>
                </div>
              </div>
              <div className="mt-4">
                <p className=" text-black md:text-[18px] text-[16px]">
                  აქ შეგიძლიათ იხილოთ ხელმისაწვდომი ოლიმპიადები და მიიღოთ მონაწილეობა.
                </p>
                <button className="mt-4 w-full cursor-pointer bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md md:text-[18px] text-[16px] font-medium text-black">
                  ოლიმპიადების ნახვა
                </button>
              </div>
            </div>
          </div>

          {/* Results Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">შედეგები</h3>
                </div>
              </div>
              <div className="mt-4">
                    <p className="text-black md:text-[18px] text-[16px]">
                  იხილეთ თქვენი ოლიმპიადების შედეგები და სტატისტიკა.
                </p>
                <button className="mt-4 w-full cursor-pointer bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md md:text-[18px] text-[16px] font-medium text-black">
                  შედეგების ნახვა
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function StudentDashboardPage() {
  return (
    <StudentOnly>
      <StudentDashboardContent />
    </StudentOnly>
  )
}
