'use client'

import { useAuth } from '@/hooks/useAuth'
import { AdminOnly } from '@/components/auth/ProtectedRoute'
import Link from 'next/link'

function AdminOlympiadsContent() {
  const { user } = useAuth()

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
                ოლიმპიადების შექმნა, რედაქტირება და მართვა
              </p>
            </div>
            <Link
              href="/admin/dashboard"
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md md:text-[18px] text-[16px] font-bold"
            >
              დაბრუნება
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Create Olympiad Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg flex flex-col h-full">
            <div className="p-4 flex-1 flex flex-col">
              <div className="flex items-center">
                <div className="ml-4">
                  <h3 className="text-black md:text-[18px] text-[16px]">შექმნა</h3>
                </div>
              </div>
              <div className="mt-3 flex-1 flex flex-col">
                <p className="text-black md:text-[18px] text-[16px] flex-1">
                  შექმენით ახალი ოლიმპიადა სისტემაში.
                </p>
                <button className="mt-3 w-full cursor-pointer bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md md:text-[18px] text-[16px] font-bold">
                  <Link href="/admin/olympiads/create" className="block w-full h-full text-white">
                    ახალი ოლიმპიადა
                  </Link>
                </button>
              </div>
            </div>
          </div>

          {/* Manage Olympiads Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg flex flex-col h-full">
            <div className="p-4 flex-1 flex flex-col">
              <div className="flex items-center">
                <div className="ml-4">
                  <h3 className="text-black md:text-[18px] text-[16px]">მართვა</h3>
                </div>
              </div>
              <div className="mt-3 flex-1 flex flex-col">
                <p className="text-black md:text-[18px] text-[16px] flex-1">
                  მართეთ არსებული ოლიმპიადები და მათი პარამეტრები.
                </p>
                <button className="mt-3 w-full cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md md:text-[18px] text-[16px] font-bold">
                  <Link href="/admin/olympiads/manage" className="block w-full h-full text-white">
                    ოლიმპიადების ნახვა
                  </Link>
                </button>
              </div>
            </div>
          </div>

          {/* Questions Management Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg flex flex-col h-full">
            <div className="p-4 flex-1 flex flex-col">
              <div className="flex items-center">
                <div className="ml-4">
                  <h3 className="text-black md:text-[18px] text-[16px]">კითხვები</h3>
                </div>
              </div>
              <div className="mt-3 flex-1 flex flex-col">
                <p className="text-black md:text-[18px] text-[16px] flex-1">
                  მართეთ ოლიმპიადების კითხვები და პასუხები.
                </p>
                <button className="mt-3 w-full cursor-pointer bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md md:text-[18px] text-[16px] font-bold">
                  <Link href="/admin/olympiads/questions" className="block w-full h-full text-white">
                    კითხვების მართვა
                  </Link>
                </button>
              </div>
            </div>
          </div>

          {/* Question Packages Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg flex flex-col h-full">
            <div className="p-4 flex-1 flex flex-col">
              <div className="flex items-center">
                <div className="ml-4">
                  <h3 className="text-black md:text-[18px] text-[16px]">პაკეტები</h3>
                </div>
              </div>
              <div className="mt-3 flex-1 flex flex-col">
                <p className="text-black md:text-[18px] text-[16px] flex-1">
                  მართეთ კითხვების პაკეტები და ჯგუფები.
                </p>
                <button className="mt-3 w-full cursor-pointer bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-md md:text-[18px] text-[16px] font-bold">
                  <Link href="/admin/olympiads/packages" className="block w-full h-full text-white">
                    პაკეტების მართვა
                  </Link>
                </button>
              </div>
            </div>
          </div>

          {/* Results Management Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg flex flex-col h-full">
            <div className="p-4 flex-1 flex flex-col">
              <div className="flex items-center">
                <div className="ml-4">
                  <h3 className="text-black md:text-[18px] text-[16px]">შედეგები</h3>
                </div>
              </div>
              <div className="mt-3 flex-1 flex flex-col">
                <p className="text-black md:text-[18px] text-[16px] flex-1">
                  ნახეთ და მართეთ ოლიმპიადების შედეგები.
                </p>
                <button className="mt-3 w-full cursor-pointer bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md md:text-[18px] text-[16px] font-bold">
                  <Link href="/admin/olympiads/results" className="block w-full h-full text-white">
                    შედეგების ნახვა
                  </Link>
                </button>
              </div>
            </div>
          </div>

          {/* Statistics Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg flex flex-col h-full">
            <div className="p-4 flex-1 flex flex-col">
              <div className="flex items-center">
                <div className="ml-4">
                  <h3 className="text-black md:text-[18px] text-[16px]">სტატისტიკა</h3>
                </div>
              </div>
              <div className="mt-3 flex-1 flex flex-col">
                <p className="text-black md:text-[18px] text-[16px] flex-1">
                  ნახეთ ოლიმპიადების სტატისტიკა და ანალიტიკა.
                </p>
                <button className="mt-3 w-full cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md md:text-[18px] text-[16px] font-bold">
                  <Link href="/admin/olympiads/statistics" className="block w-full h-full text-white">
                    სტატისტიკა
                  </Link>
                </button>
              </div>
            </div>
          </div>

          {/* Settings Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg flex flex-col h-full">
            <div className="p-4 flex-1 flex flex-col">
              <div className="flex items-center">
                <div className="ml-4">
                  <h3 className="text-black md:text-[18px] text-[16px]">პარამეტრები</h3>
                </div>
              </div>
              <div className="mt-3 flex-1 flex flex-col">
                <p className="text-black md:text-[18px] text-[16px] flex-1">
                  მართეთ ოლიმპიადების სისტემის პარამეტრები.
                </p>
                <button className="mt-3 w-full cursor-pointer bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md md:text-[18px] text-[16px] font-bold">
                  <Link href="/admin/olympiads/settings" className="block w-full h-full text-white">
                    პარამეტრები
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

export default function AdminOlympiadsPage() {
  return (
    <AdminOnly>
      <AdminOlympiadsContent />
    </AdminOnly>
  )
}
