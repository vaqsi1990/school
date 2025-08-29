'use client'

import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'

export default function UnauthorizedPage() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 text-red-600">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
          წვდომა აკრძალულია
          </h2>
          <p className="mt-2 text-sm text-gray-600">
          თქვენ არ გაქვთ ამ გვერდზე წვდომის ნებართვა
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <div className="mb-6">
              <p className="text-gray-600 mb-4">
               მომხმარებელი: <span className="font-semibold">{user?.email}</span>
              </p>
              <p className="text-gray-600 mb-4">
                მომხმარებელის ტიპი: <span className="font-semibold capitalize">{user?.userType?.toLowerCase()}</span>
              </p>
            </div>

            <div className="space-y-4">
              <Link
                href="/"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                მთავარ გვერდზე გადასვლა
              </Link>

              {user?.userType === 'STUDENT' && (
                <Link
                  href="/student/dashboard"
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                სკოლის მოსწავლეების დეშბორდი
                </Link>
              )}

              {user?.userType === 'TEACHER' && (
                <Link
                  href="/teacher/dashboard"
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  მასწავლებლის დეშბორდი
                </Link>
              )}

              {user?.userType === 'ADMIN' && (
                <Link
                  href="/admin/dashboard"
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  ადმინისტრატორის დეშბორდი
                </Link>
              )}

              <button
                onClick={logout}
                className="w-full flex justify-center py-2 px-4 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                გამოსვლა
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
