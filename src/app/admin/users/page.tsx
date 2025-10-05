'use client'

import { useAuth } from '@/hooks/useAuth'
import { AdminOnly } from '@/components/auth/ProtectedRoute'
import { useState, useEffect } from 'react'
import Link from 'next/link'

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
  const [resetPasswordModal, setResetPasswordModal] = useState({
    isOpen: false,
    userId: '',
    userEmail: '',
    userName: ''
  })
  const [deleteUserModal, setDeleteUserModal] = useState({
    isOpen: false,
    userId: '',
    userEmail: '',
    userName: '',
    userType: '' as string
  })
  const [newPassword, setNewPassword] = useState('')
  const [isResetting, setIsResetting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [resetMessage, setResetMessage] = useState('')
  const [deleteMessage, setDeleteMessage] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [addTeacherModal, setAddTeacherModal] = useState({
    isOpen: false
  })
  const [teacherForm, setTeacherForm] = useState({
    email: '',
    password: '',
    name: '',
    lastname: '',
    subject: '',
    school: '',
    phone: '',
    isVerified: true
  })
  const [isAddingTeacher, setIsAddingTeacher] = useState(false)
  const [addTeacherMessage, setAddTeacherMessage] = useState('')
  const [subjects, setSubjects] = useState<{id: string, name: string}[]>([])
  const [loadingSubjects, setLoadingSubjects] = useState(false)

  useEffect(() => {
    console.log('Current user:', user)
    if (user) {
      fetchUsers()
      fetchSubjects()
    }
  }, [user])

  const fetchSubjects = async () => {
    try {
      setLoadingSubjects(true)
      const response = await fetch('/api/subjects')
      console.log('Subjects API response status:', response.status)
      if (response.ok) {
        const data = await response.json()
        console.log('Subjects data received:', data)
        const subjectsFromAPI = data.subjects || []
        
        // If no subjects from API, use fallback list
        if (subjectsFromAPI.length === 0) {
          console.log('No subjects from API, using fallback list')
          const fallbackSubjects = [
            { id: 'math', name: 'მათემატიკა' },
            { id: 'physics', name: 'ფიზიკა' },
            { id: 'chemistry', name: 'ქიმია' },
            { id: 'biology', name: 'ბიოლოგია' },
            { id: 'history', name: 'ისტორია' },
            { id: 'geography', name: 'გეოგრაფია' },
            { id: 'georgian', name: 'ქართული ენა' },
            { id: 'english', name: 'ინგლისური ენა' },
            { id: 'national', name: 'ერთიანი ეროვნული გამოცდები' }
          ]
          setSubjects(fallbackSubjects)
        } else {
          setSubjects(subjectsFromAPI)
        }
      } else {
        console.error('Failed to fetch subjects:', response.statusText)
        // Use fallback on API error
        const fallbackSubjects = [
          { id: 'math', name: 'მათემატიკა' },
          { id: 'physics', name: 'ფიზიკა' },
          { id: 'chemistry', name: 'ქიმია' },
          { id: 'biology', name: 'ბიოლოგია' },
          { id: 'history', name: 'ისტორია' },
          { id: 'geography', name: 'გეოგრაფია' },
          { id: 'georgian', name: 'ქართული ენა' },
          { id: 'english', name: 'ინგლისური ენა' },
          { id: 'national', name: 'ერთიანი ეროვნული გამოცდები' }
        ]
        setSubjects(fallbackSubjects)
      }
    } catch (error) {
      console.error('Error fetching subjects:', error)
      // Use fallback on error
      const fallbackSubjects = [
        { id: 'math', name: 'მათემატიკა' },
        { id: 'physics', name: 'ფიზიკა' },
        { id: 'chemistry', name: 'ქიმია' },
        { id: 'biology', name: 'ბიოლოგია' },
        { id: 'history', name: 'ისტორია' },
        { id: 'geography', name: 'გეოგრაფია' },
        { id: 'georgian', name: 'ქართული ენა' },
        { id: 'english', name: 'ინგლისური ენა' },
        { id: 'national', name: 'ერთიანი ეროვნული გამოცდები' }
      ]
      setSubjects(fallbackSubjects)
    } finally {
      setLoadingSubjects(false)
    }
  }

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

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user || user.userType !== 'ADMIN') {
      setResetMessage('მხოლოდ ადმინისტრატორებს შეუძლიათ პაროლის შეცვლა')
      return
    }
    
    if (!newPassword.trim()) {
      setResetMessage('გთხოვთ შეიყვანოთ ახალი პაროლი')
      return
    }

    if (newPassword.length < 6) {
      setResetMessage('პაროლი უნდა იყოს მინიმუმ 6 სიმბოლო')
      return
    }

    setIsResetting(true)
    setResetMessage('')

    try {
      console.log('Sending password reset request:', {
        userId: resetPasswordModal.userId,
        newPassword: newPassword
      })

      const response = await fetch('/api/admin/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: resetPasswordModal.userId,
          newPassword: newPassword
        }),
      })

      console.log('Response status:', response.status)
      const result = await response.json()
      console.log('Response result:', result)

      if (response.ok) {
        setResetMessage('პაროლი წარმატებით შეიცვალა!')
        setNewPassword('')
        setShowPassword(false)
        setTimeout(() => {
          closePasswordResetModal()
        }, 2000)
      } else {
        setResetMessage(`შეცდომა: ${result.error}`)
      }
    } catch (error) {
      console.error('Password reset error:', error)
      setResetMessage('სისტემური შეცდომა მოხდა')
    } finally {
      setIsResetting(false)
    }
  }

  const openPasswordResetModal = (userId: string, userEmail: string, userName: string) => {
    if (!user || user.userType !== 'ADMIN') {
      setError('მხოლოდ ადმინისტრატორებს შეუძლიათ პაროლის შეცვლა')
      return
    }
    
    setResetPasswordModal({
      isOpen: true,
      userId,
      userEmail,
      userName
    })
    setNewPassword('')
    setResetMessage('')
    setShowPassword(false)
  }

  const closePasswordResetModal = () => {
    setResetPasswordModal({ isOpen: false, userId: '', userEmail: '', userName: '' })
    setNewPassword('')
    setResetMessage('')
    setShowPassword(false)
  }

  const openDeleteUserModal = (userId: string, userEmail: string, userName: string, userType: string) => {
    if (!user || user.userType !== 'ADMIN') {
      setError('მხოლოდ ადმინისტრატორებს შეუძლიათ მომხმარებლების წაშლა')
      return
    }
    
    setDeleteUserModal({
      isOpen: true,
      userId,
      userEmail,
      userName,
      userType
    })
    setDeleteMessage('')
  }

  const closeDeleteUserModal = () => {
    setDeleteUserModal({ isOpen: false, userId: '', userEmail: '', userName: '', userType: '' })
    setDeleteMessage('')
  }

  const openAddTeacherModal = () => {
    if (!user || user.userType !== 'ADMIN') {
      setError('მხოლოდ ადმინისტრატორებს შეუძლიათ მასწავლებლების დამატება')
      return
    }
    
    setAddTeacherModal({ isOpen: true })
    setTeacherForm({
      email: '',
      password: '',
      name: '',
      lastname: '',
      subject: '',
      school: '',
      phone: '',
      isVerified: true
    })
    setAddTeacherMessage('')
  }

  const closeAddTeacherModal = () => {
    setAddTeacherModal({ isOpen: false })
    setTeacherForm({
      email: '',
      password: '',
      name: '',
      lastname: '',
      subject: '',
      school: '',
      phone: '',
      isVerified: true
    })
    setAddTeacherMessage('')
  }

  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user || user.userType !== 'ADMIN') {
      setAddTeacherMessage('მხოლოდ ადმინისტრატორებს შეუძლიათ მასწავლებლების დამატება')
      return
    }

    setIsAddingTeacher(true)
    setAddTeacherMessage('')

    try {
      const response = await fetch('/api/admin/add-teacher', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(teacherForm),
      })

      const result = await response.json()

      if (response.ok) {
        setAddTeacherMessage('მასწავლებელი წარმატებით დაემატა!')
        // Refresh users list
        await fetchUsers()
        setTimeout(() => {
          closeAddTeacherModal()
        }, 2000)
      } else {
        setAddTeacherMessage(`შეცდომა: ${result.error}`)
      }
    } catch (error) {
      console.error('Add teacher error:', error)
      setAddTeacherMessage('სისტემური შეცდომა მოხდა')
    } finally {
      setIsAddingTeacher(false)
    }
  }

  const handleDeleteUser = async () => {
    if (!user || user.userType !== 'ADMIN') {
      setDeleteMessage('მხოლოდ ადმინისტრატორებს შეუძლიათ მომხმარებლების წაშლა')
      return
    }

    setIsDeleting(true)
    setDeleteMessage('')

    try {
      console.log('Sending delete user request:', {
        userId: deleteUserModal.userId,
        userEmail: deleteUserModal.userEmail
      })

      const response = await fetch('/api/admin/delete-user', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: deleteUserModal.userId
        }),
      })

      console.log('Delete response status:', response.status)
      const result = await response.json()
      console.log('Delete response result:', result)

      if (response.ok) {
        setDeleteMessage('მომხმარებელი წარმატებით წაიშალა!')
        // Remove user from local state
        setUsers(prevUsers => prevUsers.filter(u => u.id !== deleteUserModal.userId))
        setTimeout(() => {
          closeDeleteUserModal()
        }, 2000)
      } else {
        setDeleteMessage(`შეცდომა: ${result.error}`)
      }
    } catch (error) {
      console.error('Delete user error:', error)
      setDeleteMessage('სისტემური შეცდომა მოხდა')
    } finally {
      setIsDeleting(false)
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
        <div className=" mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-black md:text-[25px] text-[20px]">
                მომხმარებლების მართვა
              </h1>
              <p className="text-black md:text-[18px] text-[16px]">
                სისტემაში რეგისტრირებული ყველა მომხმარებელი
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={openAddTeacherModal}
                className="bg-green-600 cursor-pointer text-white px-4 py-2 rounded-md md:text-[20px] text-[16px] font-bold transition-colors hover:bg-green-700"
              >
                მასწავლებლის დამატება
              </button>
              <Link
                href="/admin/dashboard"
                className="bg-[#034e64] cursor-pointer text-white px-4 py-2 rounded-md md:text-[20px] text-[16px] font-bold transition-colors hover:bg-[#023a4d]"
              >
                დაბრუნება
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className=" mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                  <th className="px-6 py-3 text-left md:text-[16px] text-[14px] text-black uppercase tracking-wider">
                    მომხმარებელი
                  </th>
                  <th className="px-6 py-3 text-left md:text-[16px] text-[14px] text-black uppercase tracking-wider">
                    ტიპი
                  </th>
                  <th className="px-6 py-3 text-left md:text-[16px] text-[14px] text-black uppercase tracking-wider">
                    დეტალები
                  </th>
                  <th className="px-6 py-3 text-left md:text-[16px] text-[14px] text-black uppercase tracking-wider">
                    რეგისტრაციის თარიღი
                  </th>
                  <th className="px-6 py-3 text-left md:text-[16px] text-[14px] text-black uppercase tracking-wider">
                    სტატუსი
                  </th>
                  <th className="px-6 py-3 text-left md:text-[16px] text-[14px]  text-black uppercase tracking-wider">
                    მოქმედებები
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
                          <div className="md:text-[16px] text-[14px] text-black">
                            {user.student?.name && user.student?.lastname 
                              ? `${user.student.name} ${user.student.lastname}`
                              : user.teacher?.name && user.teacher?.lastname
                              ? `${user.teacher.name} ${user.teacher.lastname}`
                              : user.admin?.name && user.admin?.lastname
                              ? `${user.admin.name} ${user.admin.lastname}`
                              : 'სახელი არ არის მითითებული'
                            }
                          </div>
                          <div className="md:text-[16px] text-[14px] text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.userType === 'STUDENT' ? 'bg-green-100 text-green-800' :
                        user.userType === 'TEACHER' ? 'bg-blue-100 text-blue-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {user.userType === 'STUDENT' ? 'მოსწავლე' :
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openPasswordResetModal(
                            user.id,
                            user.email,
                            user.student?.name && user.student?.lastname 
                              ? `${user.student.name} ${user.student.lastname}`
                              : user.teacher?.name && user.teacher?.lastname
                              ? `${user.teacher.name} ${user.teacher.lastname}`
                              : user.admin?.name && user.admin?.lastname
                              ? `${user.admin.name} ${user.admin.lastname}`
                              : user.email
                          )}
                          className="bg-[#034e64] cursor-pointer text-white px-4 py-2 rounded-md md:text-[20px] text-[16px] font-bold transition-colors hover:bg-[#023a4d] mr-2"
                        >
                          პაროლის შეცვლა
                        </button>
                        <button
                          onClick={() => openDeleteUserModal(
                            user.id,
                            user.email,
                            user.student?.name && user.student?.lastname 
                              ? `${user.student.name} ${user.student.lastname}`
                              : user.teacher?.name && user.teacher?.lastname
                              ? `${user.teacher.name} ${user.teacher.lastname}`
                              : user.admin?.name && user.admin?.lastname
                              ? `${user.admin.name} ${user.admin.lastname}`
                              : user.email,
                            user.userType
                          )}
                          className="bg-red-600 cursor-pointer text-white px-4 py-2 rounded-md md:text-[20px] text-[16px] font-bold transition-colors hover:bg-red-700"
                        >
                          წაშლა
                        </button>
                      </div>
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

      {/* Password Reset Modal */}
      {resetPasswordModal.isOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                პაროლის შეცვლა
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                მომხმარებელი: <strong>{resetPasswordModal.userName}</strong><br/>
                ელ-ფოსტა: <strong>{resetPasswordModal.userEmail}</strong>
              </p>
              
              <form onSubmit={handlePasswordReset}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ახალი პაროლი
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                      placeholder="შეიყვანეთ ახალი პაროლი"
                      minLength={6}
                    />
                    <button
                       type="button"
                       onClick={() => setShowPassword(!showPassword)}
                       className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                     >
                       {showPassword ? (
                         <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                         </svg>
                       ) : (
                         <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                         </svg>
                       )}
                     </button>
                  </div>
                </div>
                
                {resetMessage && (
                  <div className={`p-3 rounded-md text-sm mb-4 ${
                    resetMessage.includes('შეცდომა') ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {resetMessage}
                  </div>
                )}
                
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    disabled={isResetting}
                    className="flex-1 bg-[#034e64] cursor-pointer text-white px-4 py-2 rounded-md md:text-[20px] text-[16px] font-bold transition-colors hover:bg-[#023a4d] disabled:bg-gray-400"
                  >
                    {isResetting ? 'მიმდინარეობს...' : 'პაროლის შეცვლა'}
                  </button>
                  <button
                    type="button"
                    onClick={closePasswordResetModal}
                    className="flex-1 bg-gray-500 cursor-pointer text-white px-4 py-2 rounded-md md:text-[20px] text-[16px] font-bold transition-colors hover:bg-gray-600"
                  >
                    გაუქმება
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      {deleteUserModal.isOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              
              <h3 className="text-lg font-medium text-gray-900 mb-4 text-center">
                მომხმარებლის წაშლა
              </h3>
              
              <div className="text-center mb-6">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>ყურადღება!</strong> ეს მოქმედება შეუქცევადია.
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  მომხმარებელი: <strong>{deleteUserModal.userName}</strong>
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  ელ-ფოსტა: <strong>{deleteUserModal.userEmail}</strong>
                </p>
                <p className="text-sm text-gray-600">
                  ტიპი: <strong>{deleteUserModal.userType === 'STUDENT' ? 'მოსწავლე' : deleteUserModal.userType === 'TEACHER' ? 'მასწავლებელი' : 'ადმინი'}</strong>
                </p>
              </div>
              
              {deleteMessage && (
                <div className={`p-3 rounded-md text-sm mb-4 ${
                  deleteMessage.includes('შეცდომა') ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                }`}>
                  {deleteMessage}
                </div>
              )}
              
              <div className="flex space-x-3">
                <button
                  onClick={handleDeleteUser}
                  disabled={isDeleting}
                  className="flex-1 bg-red-600 cursor-pointer text-white px-4 py-2 rounded-md md:text-[20px] text-[16px] font-bold transition-colors hover:bg-red-700 disabled:bg-red-400"
                >
                  {isDeleting ? 'მიმდინარეობს...' : 'დიახ, წავშალოთ'}
                </button>
                <button
                  onClick={closeDeleteUserModal}
                  className="flex-1 bg-gray-500 cursor-pointer text-white px-4 py-2 rounded-md md:text-[20px] text-[16px] font-bold transition-colors hover:bg-gray-600"
                >
                  გაუქმება
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Teacher Modal */}
      {addTeacherModal.isOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-medium text-gray-900">
                  მასწავლებლის დამატება
                </h3>
                <button
                  onClick={closeAddTeacherModal}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={handleAddTeacher} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ელ-ფოსტა *
                    </label>
                    <input
                      type="email"
                      required
                      value={teacherForm.email}
                      onChange={(e) => setTeacherForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="მაგ: teacher@school.ge"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      პაროლი *
                    </label>
                    <input
                      type="password"
                      required
                      value={teacherForm.password}
                      onChange={(e) => setTeacherForm(prev => ({ ...prev, password: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="მინიმუმ 6 სიმბოლო"
                      minLength={6}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      სახელი *
                    </label>
                    <input
                      type="text"
                      required
                      value={teacherForm.name}
                      onChange={(e) => setTeacherForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="მაგ: გიორგი"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      გვარი *
                    </label>
                    <input
                      type="text"
                      required
                      value={teacherForm.lastname}
                      onChange={(e) => setTeacherForm(prev => ({ ...prev, lastname: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="მაგ: ქართველიშვილი"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      საგანი *
                    </label>
                    <select
                      required
                      value={teacherForm.subject}
                      onChange={(e) => setTeacherForm(prev => ({ ...prev, subject: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={loadingSubjects}
                    >
                      <option value="">აირჩიეთ საგანი</option>
                      {subjects.map((subject) => (
                        <option key={subject.id} value={subject.name}>
                          {subject.name}
                        </option>
                      ))}
                    </select>
                    {loadingSubjects && (
                      <p className="text-xs text-gray-500 mt-1">საგნები იტვირთება...</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      სკოლა *
                    </label>
                    <input
                      type="text"
                      required
                      value={teacherForm.school}
                      onChange={(e) => setTeacherForm(prev => ({ ...prev, school: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="მაგ: თბილისის #1 საჯარო სკოლა"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ტელეფონი *
                    </label>
                    <input
                      type="tel"
                      required
                      value={teacherForm.phone}
                      onChange={(e) => setTeacherForm(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="მაგ: 555123456"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ვერიფიკაციის სტატუსი
                    </label>
                    <select
                      value={teacherForm.isVerified ? 'true' : 'false'}
                      onChange={(e) => setTeacherForm(prev => ({ ...prev, isVerified: e.target.value === 'true' }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="true">ვერიფიცირებული</option>
                      <option value="false">ვერიფიკაციის პროცესში</option>
                    </select>
                  </div>
                </div>
                
                {addTeacherMessage && (
                  <div className={`p-3 rounded-md text-sm ${
                    addTeacherMessage.includes('შეცდომა') ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {addTeacherMessage}
                  </div>
                )}
                
                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    disabled={isAddingTeacher}
                    className="flex-1 bg-green-600 cursor-pointer text-white px-4 py-2 rounded-md md:text-[18px] text-[16px] font-bold transition-colors hover:bg-green-700 disabled:bg-gray-400"
                  >
                    {isAddingTeacher ? 'მიმდინარეობს...' : 'მასწავლებლის დამატება'}
                  </button>
                  <button
                    type="button"
                    onClick={closeAddTeacherModal}
                    className="flex-1 bg-gray-500 cursor-pointer text-white px-4 py-2 rounded-md md:text-[18px] text-[16px] font-bold transition-colors hover:bg-gray-600"
                  >
                    გაუქმება
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
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
