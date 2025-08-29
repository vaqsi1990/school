'use client'

import { useAuth } from '@/hooks/useAuth'
import { AdminOnly } from '@/components/auth/ProtectedRoute'
import { useState, useEffect } from 'react'

interface User {
  id: string
  email: string
  userType: 'STUDENT' | 'TEACHER' | 'ADMIN'
  student?: {
    id: string
    name: string
    lastname: string
    grade: number
    school: string
    phone: string
    code: string
    createdAt: string
  }
  teacher?: {
    id: string
    name: string
    lastname: string
    subject: string
    school: string
    phone: string
    isVerified: boolean
    createdAt: string
  }
  admin?: {
    id: string
    name: string
    lastname: string
    role: string
    permissions: string[]
    createdAt: string
  }
}

function UserManagementContent() {
  const { user } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'all' | 'students' | 'teachers' | 'admins'>('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
      } else {
        setError('მომხმარებლების ჩატვირთვა ვერ მოხერხდა')
      }
    } catch (error) {
      setError('სისტემური შეცდომა მოხდა')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.student?.lastname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.teacher?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.teacher?.lastname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.admin?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.admin?.lastname?.toLowerCase().includes(searchTerm.toLowerCase())

    if (activeTab === 'students') return user.userType === 'STUDENT' && matchesSearch
    if (activeTab === 'teachers') return user.userType === 'TEACHER' && matchesSearch
    if (activeTab === 'admins') return user.userType === 'ADMIN' && matchesSearch
    return matchesSearch
  })

  const getUsersByType = (type: 'STUDENT' | 'TEACHER' | 'ADMIN') => {
    return users.filter(user => user.userType === type)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ka-GE')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">მომხმარებლები იტვირთება...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-black md:text-[25px] text-[20px]">
                მომხმარებლების მართვა
              </h1>
              <p className="text-black md:text-[18px] text-[16px]">
                სისტემაში რეგისტრირებული ყველა მომხმარებელი
              </p>
            </div>
            <a
              href="/admin/dashboard"
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md md:text-[18px] text-[16px] font-bold"
            >
              დაბრუნება
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="მოძებნა სახელით, გვარით ან ელ-ფოსტით..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 rounded-md font-medium ${
                  activeTab === 'all' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                ყველა ({users.length})
              </button>
              <button
                onClick={() => setActiveTab('students')}
                className={`px-4 py-2 rounded-md font-medium ${
                  activeTab === 'students' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                სტუდენტები ({getUsersByType('STUDENT').length})
              </button>
              <button
                onClick={() => setActiveTab('teachers')}
                className={`px-4 py-2 rounded-md font-medium ${
                  activeTab === 'teachers' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                მასწავლებლები ({getUsersByType('TEACHER').length})
              </button>
              <button
                onClick={() => setActiveTab('admins')}
                className={`px-4 py-2 rounded-md font-medium ${
                  activeTab === 'admins' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                ადმინები ({getUsersByType('ADMIN').length})
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {/* Users List */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    მომხმარებელი
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ტიპი
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    დეტალები
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    რეგისტრაციის თარიღი
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    სტატუსი
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">
                              {user.student?.name?.[0] || user.teacher?.name?.[0] || user.admin?.name?.[0] || user.email[0].toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.student?.name && user.student?.lastname 
                              ? `${user.student.name} ${user.student.lastname}`
                              : user.teacher?.name && user.teacher?.lastname
                              ? `${user.teacher.name} ${user.teacher.lastname}`
                              : user.admin?.name && user.admin?.lastname
                              ? `${user.admin.name} ${user.admin.lastname}`
                              : 'სახელი არ არის მითითებული'
                            }
                          </div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.userType === 'STUDENT' ? 'bg-green-100 text-green-800' :
                        user.userType === 'TEACHER' ? 'bg-blue-100 text-blue-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {user.userType === 'STUDENT' ? 'სტუდენტი' :
                         user.userType === 'TEACHER' ? 'მასწავლებელი' :
                         'ადმინი'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.userType === 'STUDENT' && user.student && (
                        <div>
                          <div>კლასი: {user.student.grade}</div>
                          <div>სკოლა: {user.student.school}</div>
                          <div>კოდი: {user.student.code}</div>
                        </div>
                      )}
                      {user.userType === 'TEACHER' && user.teacher && (
                        <div>
                          <div>საგანი: {user.teacher.subject}</div>
                          <div>სკოლა: {user.teacher.school}</div>
                        </div>
                      )}
                      {user.userType === 'ADMIN' && user.admin && (
                        <div>
                          <div>როლი: {user.admin.role}</div>
                          <div>ნებართვები: {user.admin.permissions.length}</div>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(user.student?.createdAt || user.teacher?.createdAt || user.admin?.createdAt || '')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.userType === 'TEACHER' && user.teacher && (
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.teacher.isVerified 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {user.teacher.isVerified ? 'ვერიფიცირებული' : 'ვერიფიკაციის პროცესში'}
                        </span>
                      )}
                      {user.userType !== 'TEACHER' && (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                          აქტიური
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">მომხმარებელი ვერ მოიძებნა</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function UserManagementPage() {
  return (
    <AdminOnly>
      <UserManagementContent />
    </AdminOnly>
  )
}
