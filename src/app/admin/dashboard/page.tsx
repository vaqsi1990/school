'use client'

import { useAuth } from '@/hooks/useAuth'
import { AdminOnly } from '@/components/auth/ProtectedRoute'
import { useState } from 'react'
import Link from 'next/link'

function AdminDashboardContent() {
  const { user } = useAuth()
  const [isSettingUpProfile, setIsSettingUpProfile] = useState(false)
  const [profileData, setProfileData] = useState({
    name: '',
    lastname: '',
    role: 'ADMIN' as 'SUPER_ADMIN' | 'ADMIN' | 'MODERATOR'
  })
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')

  // Debug logging to see what user data is available
  console.log('Full user object:', user);
  console.log('Admin data:', user?.admin);
  console.log('User type:', user?.userType);

  const handleProfileSetup = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/admin/setup-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      })

      const result = await response.json()

      if (response.ok) {
        setMessage('პროფილი წარმატებით შეიქმნა! გთხოვთ გადატვირთოთ გვერდი.')
        setIsSettingUpProfile(false)
        // Refresh the page after a short delay to show the new data
        setTimeout(() => window.location.reload(), 2000)
      } else {
        setMessage(`შეცდომა: ${result.error}`)
      }
    } catch {
      setMessage('სისტემური შეცდომა მოხდა')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Enhanced Admin Info Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <div className="flex items-center">

                <div className="ml-4">
                  <h3 className="text-black md:text-[20px] text-[18px]">პროფილის ინფორმაცია</h3>
                </div>
              </div>

              {/* Warning if admin data is missing */}
              {!user?.admin && (
                <div className="mt-4 p-3 bg-yellow-100 border border-yellow-400 rounded-md">
                  <div className="flex">
                    <svg className="w-5 h-5 text-yellow-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <div>
                      <p className="text-sm text-yellow-800 font-medium">ყურადღება!</p>
                      <p className="text-sm text-yellow-700">ადმინის პროფილის მონაცემები არ არის ნაპოვნი.</p>
                      <button
                        onClick={() => setIsSettingUpProfile(true)}
                        className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                      >
                        პროფილის შექმნა
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-black md:text-[18px] text-[16px]">სახელი:</span>
                  <span className="md:text-[18px] text-[16px] font-medium text-black">
                    {user?.admin?.name || 'არ არის მითითებული'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="md:text-[18px] text-[16px] text-black">გვარი:</span>
                  <span className="md:text-[18px] text-[16px] font-medium text-black">
                    {user?.admin?.lastname || 'არ არის მითითებული'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="md:text-[18px] text-[16px] text-black">როლი:</span>
                  <span className="md:text-[18px] text-[16px] font-medium text-black">
                    {user?.admin?.role === 'SUPER_ADMIN' ? 'სუპერ ადმინი' :
                      user?.admin?.role === 'ADMIN' ? 'ადმინი' :
                        user?.admin?.role === 'MODERATOR' ? 'მოდერატორი' : 'უცნობი'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="md:text-[18px] text-[16px] text-black">ელ-ფოსტა:</span>
                  <span className="md:text-[18px] text-[16px] font-medium text-black">{user?.email || 'არ არის მითითებული'}</span>
                </div>

                <div className="flex justify-between">
                  <span className="md:text-[18px] text-[16px] text-black">ტიპი:</span>
                  <span className="md:text-[18px] text-[16px] font-medium text-black">
                    {user?.userType === 'ADMIN' ? 'ადმინისტრატორი' : 'უცნობი'}
                  </span>
                </div>
                {user?.admin?.permissions && user.admin.permissions.length > 0 && (
                  <div className="mt-4">
                    <span className="md:text-[18px] text-[16px] text-black block mb-2">ნებართვები:</span>
                    <div className="flex flex-wrap gap-2">
                      {user.admin.permissions.map((permission, index) => (
                        <span
                          key={index}
                          className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full"
                        >
                          {permission}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Profile Setup Form */}
          {isSettingUpProfile && (
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
                    <h3 className="text-black md:text-[20px] text-[18px]">პროფილის შექმნა</h3>
                  </div>
                </div>

                <form onSubmit={handleProfileSetup} className="mt-4 space-y-4">
                  <div>
                    <label className="block text-black md:text-[18px] text-[16px] font-medium text-black mb-1">
                      სახელი *
                    </label>
                    <input
                      type="text"
                      required
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="შეიყვანეთ სახელი"
                    />
                  </div>

                  <div>
                    <label className="block text-black md:text-[18px] text-[16px] font-medium text-black mb-1">
                      გვარი *
                    </label>
                    <input
                      type="text"
                      required
                      value={profileData.lastname}
                      onChange={(e) => setProfileData({ ...profileData, lastname: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="შეიყვანეთ გვარი"
                    />
                  </div>

                  <div>
                    <label className="block text-black md:text-[18px] text-[16px] font-medium text-black mb-1">
                      როლი
                    </label>
                    <select
                      value={profileData.role}
                      onChange={(e) => setProfileData({ ...profileData, role: e.target.value as 'SUPER_ADMIN' | 'ADMIN' | 'MODERATOR' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="SUPER_ADMIN">სუპერ ადმინი</option>
                      <option value="ADMIN">ადმინი</option>
                      <option value="MODERATOR">მოდერატორი</option>
                    </select>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-md font-medium"
                    >
                      {isLoading ? 'მიმდინარეობს...' : 'შექმნა'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsSettingUpProfile(false)}
                      className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md font-medium"
                    >
                      გაუქმება
                    </button>
                  </div>

                  {message && (
                    <div className={`p-3 rounded-md text-black md:text-[18px] text-[16px] ${message.includes('შეცდომა') ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                      }`}>
                      {message}
                    </div>
                  )}
                </form>
              </div>
            </div>
          )}

          {/* Debug Information Card */}

          {/* User Management Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <div className="flex items-center">

                <div className="ml-4">
                  <h3 className="text-black md:text-[20px] text-[18px]">მომხმარებლების მართვა</h3>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-black md:text-[18px] text-[16px]">
                  მართეთ სისტემაში არსებული მომხმარებლები და მათი ნებართვები.
                </p>
                <button className="mt-4 w-full cursor-pointer bg-[#034e64]  text-white px-4 py-2 rounded-md md:text-[20px] text-[18px] font-bold">
                  <Link href="/admin/users" className="block bg-[#034e64] w-full h-full">
                    მომხმარებლების ნახვა
                  </Link>
                </button>
              </div>
            </div>
          </div>

          {/* Olympiad Management Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <div className="flex items-center">

                <div className="ml-4">
                  <h3 className="text-black md:text-[20px] text-[18px]">ოლიმპიადების მართვა</h3>
                </div>
              </div>
              <div className="mt-4">
                <p className=" text-black md:text-[18px] text-[16px]">
                  მართეთ ყველა ოლიმპიადა, კითხვები და შედეგები.
                </p>
                <button className="mt-4 w-full cursor-pointer bg-[#f06905] text-white px-4 py-2 rounded-md md:text-[18px] text-[16px] font-bold">
                  <Link href="/admin/olympiads" className="block w-full h-full text-white">
                    ოლიმპიადების ნახვა
                  </Link>
                </button>
              </div>
            </div>
          </div>

          {/* Blog Management Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <div className="flex items-center">
                <div className="ml-4">
                  <h3 className="text-black md:text-[20px] text-[18px]">სიახლეების მართვა</h3>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-black md:text-[18px] text-[16px]">
                  შექმენით და მართეთ სიახლეები.
                </p>
                <button className="mt-4 w-full cursor-pointer bg-green-600 text-white px-4 py-2 rounded-md md:text-[18px] text-[16px] font-bold">
                  <Link href="/admin/blog" className="block w-full h-full text-white">
                    სიახლეების მართვა
                  </Link>
                </button>
              </div>
            </div>
          </div>

          {/* Teacher Verification Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <div className="flex items-center">

                <div className="ml-4">
                  <h3 className="text-black md:text-[20px] text-[18px]">მასწავლებლების ვერიფიკაცია</h3>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-black md:text-[18px] text-[16px]">
                  დაადასტურეთ მასწავლებლების ანგარიშები.
                </p>
                <button className="mt-4 w-full cursor-pointer bg-[#feb909] text-white px-4 py-2 rounded-md md:text-[20px] text-[18px] font-bold">
                  <Link href="/admin/teachers" className="block bg-[#feb931] w-full h-full">
                    ვერიფიკაციის ნახვა
                  </Link>
                </button>
              </div>
            </div>
          </div>

          {/* System Statistics Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <div className="flex items-center">

                <div className="ml-4">
                  <h3 className="text-black md:text-[20px] text-[18px]">სისტემის სტატისტიკა</h3>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-black md:text-[18px] text-[16px]">
                  იხილეთ სისტემის ზოგადი სტატისტიკა და ანალიტიკა.
                </p>
                <button className="mt-4 w-full cursor-pointer bg-[#638d13] text-white px-4 py-2 rounded-md md:text-[20px] text-[18px] font-bold">
                  <Link href="/admin/statistics" className="block bg-[#638d13] w-full h-full">
                    სტატისტიკის
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

export default function AdminDashboardPage() {
  return (
    <AdminOnly>
      <AdminDashboardContent />
    </AdminOnly>
  )
}
