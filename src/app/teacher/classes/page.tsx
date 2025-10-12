'use client'

import { useAuth } from '@/hooks/useAuth'
import { TeacherOnly } from '@/components/auth/ProtectedRoute'
import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Student {
  id: string
  name: string
  lastname: string
  grade: number
  school: string
  code: string
}

interface ClassStudent {
  id: string
  student: Student
  joinedAt: string
}

interface Class {
  id: string
  name: string
  description: string | null
  subject: string
  grade: number
  createdAt: string
  students: ClassStudent[]
}

function TeacherClassesContent() {
  const [classes, setClasses] = useState<Class[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [teacherProfile, setTeacherProfile] = useState<{subject: string} | null>(null)
  const [newClass, setNewClass] = useState({
    name: '',
    description: '',
    subject: '',
    grade: ''
  })

  useEffect(() => {
    fetchClasses()
    fetchTeacherProfile()
  }, [])

  const fetchTeacherProfile = async () => {
    try {
      const response = await fetch('/api/teacher/profile')
      if (response.ok) {
        const data = await response.json()
        setTeacherProfile(data.profile)
        // Set the teacher's subject automatically
        setNewClass(prev => ({ ...prev, subject: data.profile.subject }))
      }
    } catch (error) {
      console.error('Error fetching teacher profile:', error)
    }
  }

  const fetchClasses = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/teacher/classes')
      if (response.ok) {
        const data = await response.json()
        setClasses(data.classes)
      } else {
        console.error('Failed to fetch classes')
      }
    } catch (error) {
      console.error('Error fetching classes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/teacher/classes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newClass.name,
          description: newClass.description,
          grade: newClass.grade
          // subject is automatically set by the API based on teacher's profile
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setClasses([data.class, ...classes])
        setNewClass({ name: '', description: '', subject: teacherProfile?.subject || '', grade: '' })
        setShowCreateModal(false)
      } else {
        const errorData = await response.json()
        console.error('Failed to create class:', errorData.error)
        alert(`კლასის შექმნა ვერ მოხერხდა: ${errorData.error || 'უცნობი შეცდომა'}`)
      }
    } catch (error) {
      console.error('Error creating class:', error)
    }
  }

  const handleDeleteClass = async (classId: string, className: string) => {
    if (!confirm(`ნამდვილად გსურთ კლასის "${className}" წაშლა? ეს მოქმედება შეუქცევადია.`)) {
      return
    }

    try {
      const response = await fetch(`/api/teacher/classes/${classId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setClasses(classes.filter(c => c.id !== classId))
      } else {
        const errorData = await response.json()
        alert(`შეცდომა: ${errorData.error || 'კლასის წაშლა ვერ მოხერხდა'}`)
      }
    } catch (error) {
      console.error('Error deleting class:', error)
      alert('კლასის წაშლისას მოხდა შეცდომა')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">კლასების ჩატვირთვა...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-[25px] font-bold text-bl">კლასების მართვა</h1>
              <p className="mt-2 text-black text-[18px">შექმენით კლასები და დაამატეთ მოსწავლეები</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 cursor-pointer text-white px-4 py-2 rounded-md text-[20px] font-bold"
            >
              ახალი კლასი
            </button>
          </div>

          {/* Classes Grid */}
          {classes.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto h-24 w-24 text-gray-400">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">კლასები არ არის</h3>
              <p className="mt-1 text-sm text-gray-500">დაიწყეთ ახალი კლასის შექმნით</p>
              <div className="mt-6">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  ახალი კლასი
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {classes.map((classItem) => (
                <div key={classItem.id} className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900">{classItem.name}</h3>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {classItem.grade} კლასი
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-gray-600">{classItem.subject}</p>
                    {classItem.description && (
                      <p className="mt-2 text-sm text-gray-500">{classItem.description}</p>
                    )}
                    <div className="mt-4 flex items-center text-sm text-gray-500">
                      <svg className="flex-shrink-0 mr-1.5 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                      </svg>
                      {classItem.students.length} მოსწავლე
                    </div>
                    <div className="mt-4 space-y-2">
                      <Link
                        href={`/teacher/classes/${classItem.id}`}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-[20px] font-bold text-center block"
                      >
                        კლასის დეტალები
                      </Link>
                      <button
                        onClick={() => handleDeleteClass(classItem.id, classItem.name)}
                        className="w-full bg-red-600 cursor-pointer hover:bg-red-700 text-white px-4 py-2 rounded-md text-[20px] font-bold"
                      >
                        კლასის წაშლა
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Class Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-[16px] font-bold text-black mb-4">ახალი კლასის შექმნა</h3>
              <form onSubmit={handleCreateClass}>
                <div className="mb-4">
                  <label className="block text-[16px] font-medium text-black mb-2">
                    კლასის სახელი
                  </label>
                  <input
                    type="text"
                    required
                    value={newClass.name}
                    onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="მაგ: 10-ა კლასი"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-[16px] font-medium text-black mb-2">
                    საგანი
                  </label>
                  <input
                    type="text"
                    value={newClass.subject}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed"
                    placeholder="მაგ: მათემატიკა"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    საგანი: {teacherProfile?.subject}
                  </p>
                </div>
                <div className="mb-4">
                  <label className="block text-[16px] font-medium text-black mb-2">
                    კლასი
                  </label>
                  <select
                    required
                    value={newClass.grade}
                    onChange={(e) => setNewClass({ ...newClass, grade: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">აირჩიეთ კლასი</option>
                    {[7, 8, 9, 10, 11, 12].map((grade) => (
                      <option key={grade} value={grade}>
                        {grade === 7 ? 'VII კლასი' :
                         grade === 8 ? 'VIII კლასი' :
                         grade === 9 ? 'IX კლასი' :
                         grade === 10 ? 'X კლასი' :
                         grade === 11 ? 'XI კლასი' :
                         'XII კლასი'}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-6">
                    <label className="block text-[16px] font-medium text-black mb-2">
                    აღწერა (არასავალდებულო)
                  </label>
                  <textarea
                    value={newClass.description}
                    onChange={(e) => setNewClass({ ...newClass, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="კლასის აღწერა..."
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-[20px] font-bold cursor-pointer text-black bg-gray-200 hover:bg-gray-300 rounded-md"
                  >
                    გაუქმება
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-[20px] font-bold cursor-pointer text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                  >
                    შექმნა
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

export default function TeacherClassesPage() {
  return (
    <TeacherOnly>
      <TeacherClassesContent />
    </TeacherOnly>
  )
}
