'use client'

import { useAuth } from '@/hooks/useAuth'
import { TeacherOnly } from '@/components/auth/ProtectedRoute'

function TeacherDashboardContent() {
  const { user, logout } = useAuth()
  
  // Debug logging to see what user data is available
  console.log('Full user object:', user);
  console.log('Teacher data:', user?.teacher);
  console.log('User type:', user?.userType);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-black md:text-[25px] text-[20px]">
                მასწავლებლის დეშბორდი
              </h1>
              <p className="text-black md:text-[18px] text-[16px]">
                კეთილი იყოს თქვენი მობრძანება, {user?.teacher?.name || user?.email} {user?.teacher?.lastname || ''}
              </p>
              <p className="text-black md:text-[16px] text-[14px]">
                როლი: მასწავლებელი
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
                    {user?.teacher?.name || 'არ არის მითითებული'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="md:text-[16px] text-[14px] text-black">გვარი:</span>
                  <span className="md:text-[16px] text-[14px] font-medium text-black">
                    {user?.teacher?.lastname || 'არ არის მითითებული'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="md:text-[16px] text-[14px] text-black">საგანი:</span>
                  <span className="md:text-[16px] text-[14px] font-medium text-black">
                    {user?.teacher?.subject || 'არ არის მითითებული'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="md:text-[16px] text-[14px] text-black">სკოლა:</span>
                  <span className="md:text-[16px] text-[14px] font-medium text-black">
                    {user?.teacher?.school || 'არ არის მითითებული'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="md:text-[16px] text-[14px] text-black">ტელეფონი:</span>
                  <span className="md:text-[16px] text-[14px] font-medium text-black">
                    {user?.teacher?.phone || 'არ არის მითითებული'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="md:text-[16px] text-[14px] text-black">სტატუსი:</span>
                  <span className={`md:text-[16px] text-[14px] font-medium ${user?.teacher?.isVerified ? 'text-green-600' : 'text-yellow-600'}`}>
                    {user?.teacher?.isVerified ? 'ვერიფიცირებული' : 'ვერიფიკაციის პროცესში'}
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
                  <strong>Has Teacher Data:</strong> {user?.teacher ? 'Yes' : 'No'}
                </div>
                {user?.teacher && (
                  <>
                    <div className="text-xs text-gray-600">
                      <strong>Teacher ID:</strong> {user.teacher.id || 'N/A'}
                    </div>
                    <div className="text-xs text-gray-600">
                      <strong>Teacher Name:</strong> {user.teacher.name || 'N/A'}
                    </div>
                    <div className="text-xs text-gray-600">
                      <strong>Teacher Lastname:</strong> {user.teacher.lastname || 'N/A'}
                    </div>
                    <div className="text-xs text-gray-600">
                      <strong>Teacher Subject:</strong> {user.teacher.subject || 'N/A'}
                    </div>
                    <div className="text-xs text-gray-600">
                      <strong>Teacher School:</strong> {user.teacher.school || 'N/A'}
                    </div>
                    <div className="text-xs text-gray-600">
                      <strong>Teacher Phone:</strong> {user.teacher.phone || 'N/A'}
                    </div>
                    <div className="text-xs text-gray-600">
                      <strong>Teacher Verified:</strong> {user.teacher.isVerified ? 'Yes' : 'No'}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Create Questions Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">კითხვების შექმნა</h3>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-black md:text-[18px] text-[16px]">
                  შექმენით ახალი კითხვები ოლიმპიადებისთვის.
                </p>
                <button className="mt-4 w-full cursor-pointer bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md md:text-[18px] text-[16px] font-medium text-black">
                  კითხვის დამატება
                </button>
              </div>
            </div>
          </div>

          {/* Manage Olympiads Card */}
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
                  <p className="text-black md:text-[18px] text-[16px]">
                  მართეთ თქვენი შექმნილი ოლიმპიადები და კითხვები.
                </p>
                <button className="mt-4 w-full cursor-pointer bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md md:text-[18px] text-[16px] font-medium text-black">
                  ოლიმპიადების ნახვა
                </button>
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
