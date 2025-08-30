'use client'

import { useAuth } from '@/hooks/useAuth'
import { StudentOnly } from '@/components/auth/ProtectedRoute'
import Link from 'next/link';

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
                მოსწავლის დეშბორდი
              </h1>
              <p className="text-black md:text-[18px] text-[16px]">
                კეთილი იყოს თქვენი მობრძანება, {user?.student?.name || user?.email} {user?.student?.lastname || ''}
              </p>
              <p className="text-black md:text-[18px] text-[16px]">
                როლი: მოსწავლე
              </p>
            </div>
            
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Enhanced Student Info Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg flex flex-col h-full">
            <div className="p-4 flex-1 flex flex-col">
              <div className="flex items-center">
               
                <div className="ml-4">
                  <h3 className="text-black md:text-[18px] text-[16px]">პროფილის ინფორმაცია</h3>
                </div>
              </div>
              <div className="mt-3 space-y-2 flex-1">
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
                
              </div>
            </div>
          </div>

      

          {/* Olympiads Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg flex flex-col h-full">
            <div className="p-4 flex-1 flex flex-col">
              <div className="flex items-center">
               
                <div className="ml-4">
                  <h3 className="text-black md:text-[18px] text-[16px]">ოლიმპიადები</h3>
                </div>
              </div>
              <div className="mt-3 flex-1 flex flex-col">
                <p className="text-black md:text-[16px] text-[14px] flex-1">
                  აქ შეგიძლიათ იხილოთ ხელმისაწვდომი ოლიმპიადები და მიიღოთ მონაწილეობა.
                </p>
                <button className="mt-3 w-full cursor-pointer bg-[#034e64] text-white px-4 py-2 rounded-md md:text-[18px] text-[16px] font-bold">
                  <Link href="/student/olympiads" className="block bg-[#034e64] w-full h-full">
                  ოლიმპიადების ნახვა
                  </Link>
                </button>
              </div>
            </div>
          </div>

         
          <div className="bg-white overflow-hidden shadow rounded-lg flex flex-col h-full">
            <div className="p-4 flex-1 flex flex-col">
              <div className="flex items-center">
               
                <div className="ml-4">
                  <h3 className="text-black md:text-[18px] text-[16px]">შედეგები</h3>
                </div>
              </div>
              <div className="mt-3 flex-1 flex flex-col">
                    <p className="text-black md:text-[16px] text-[14px] flex-1">
                  იხილეთ თქვენი ოლიმპიადების შედეგები და სტატისტიკა.
                </p>
                <button className="mt-3 w-full cursor-pointer bg-[#f06905] text-white px-4 py-2 rounded-md md:text-[18px] text-[16px] font-bold">
                  <Link href="/student/results" className="block bg-[#f06905] w-full h-full">
                    შედეგების ნახვა
                  </Link>
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
