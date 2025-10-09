'use client'

import { useAuth } from '@/hooks/useAuth'
import { TeacherOnly } from '@/components/auth/ProtectedRoute'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
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

interface SearchStudent {
  id: string
  name: string
  lastname: string
  grade: number
  school: string
  code: string
  user: {
    email: string
  }
}

function ClassDetailContent() {
  const { user } = useAuth()
  const params = useParams()
  const router = useRouter()
  const [classData, setClassData] = useState<Class | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAddStudentsModal, setShowAddStudentsModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchStudent[]>([])
  const [allStudents, setAllStudents] = useState<SearchStudent[]>([])
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [showAllStudents, setShowAllStudents] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchClassData()
    }
  }, [params.id])

  const fetchClassData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/teacher/classes`)
      if (response.ok) {
        const data = await response.json()
        const classItem = data.classes.find((c: Class) => c.id === params.id)
        if (classItem) {
          setClassData(classItem)
        } else {
          router.push('/teacher/classes')
        }
      } else {
        console.error('Failed to fetch class data')
        router.push('/teacher/classes')
      }
    } catch (error) {
      console.error('Error fetching class data:', error)
      router.push('/teacher/classes')
    } finally {
      setLoading(false)
    }
  }

  const handleSearchStudents = async () => {
    if (!searchQuery.trim()) return

    try {
      setSearchLoading(true)
      const response = await fetch(
        `/api/teacher/students/search?q=${encodeURIComponent(searchQuery)}&grade=${classData?.grade}`
      )
      if (response.ok) {
        const data = await response.json()
        // Filter out students already in the class
        const existingStudentIds = classData?.students.map(s => s.student.id) || []
        const filteredStudents = data.students.filter((s: SearchStudent) => !existingStudentIds.includes(s.id))
        setSearchResults(filteredStudents)
      } else {
        console.error('Failed to search students')
      }
    } catch (error) {
      console.error('Error searching students:', error)
    } finally {
      setSearchLoading(false)
    }
  }

  const handleLoadAllStudents = async () => {
    try {
      setSearchLoading(true)
      const response = await fetch(
        `/api/teacher/students/list?grade=${classData?.grade}`
      )
      if (response.ok) {
        const data = await response.json()
        // Filter out students already in the class
        const existingStudentIds = classData?.students.map(s => s.student.id) || []
        const filteredStudents = data.students.filter((s: SearchStudent) => !existingStudentIds.includes(s.id))
        setAllStudents(filteredStudents)
        setShowAllStudents(true)
      } else {
        console.error('Failed to load students')
      }
    } catch (error) {
      console.error('Error loading students:', error)
    } finally {
      setSearchLoading(false)
    }
  }

  const handleAddStudents = async () => {
    if (selectedStudents.length === 0) return

    console.log('Adding students to class:', params.id, 'Selected students:', selectedStudents)

    try {
      const response = await fetch(`/api/teacher/classes/${params.id}/students`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ studentIds: selectedStudents }),
      })

      if (response.ok) {
        await fetchClassData() // Refresh class data
        setShowAddStudentsModal(false)
        setSearchQuery('')
        setSearchResults([])
        setAllStudents([])
        setSelectedStudents([])
        setShowAllStudents(false)
      } else {
        const errorData = await response.json()
        console.error('Failed to add students:', errorData)
        alert(`შეცდომა: ${errorData.error || 'მოსწავლეების დამატება ვერ მოხერხდა'}`)
      }
    } catch (error) {
      console.error('Error adding students:', error)
    }
  }

  const handleRemoveStudent = async (studentId: string) => {
    try {
      const response = await fetch(`/api/teacher/classes/${params.id}/students`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ studentIds: [studentId] }),
      })

      if (response.ok) {
        await fetchClassData() // Refresh class data
      } else {
        console.error('Failed to remove student')
      }
    } catch (error) {
      console.error('Error removing student:', error)
    }
  }

  const handleDeleteClass = async () => {
    if (!classData) return
    
    if (!confirm(`ნამდვილად გსურთ კლასის "${classData.name}" წაშლა? ეს მოქმედება შეუქცევადია და ყველა მოსწავლე ამოიშლება კლასიდან.`)) {
      return
    }

    try {
      const response = await fetch(`/api/teacher/classes/${params.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        router.push('/teacher/classes')
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
          <p className="mt-4 text-gray-600">კლასის ინფორმაციის ჩატვირთვა...</p>
        </div>
      </div>
    )
  }

  if (!classData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">კლასი ვერ მოიძებნა</p>
          <Link href="/teacher/classes" className="text-blue-600 hover:text-blue-800 mt-2 inline-block">
            კლასების სიაში დაბრუნება
          </Link>
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
              <Link href="/teacher/classes" className="text-blue-600 hover:text-blue-800 mb-2 inline-block">
                ← კლასების სიაში დაბრუნება
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">{classData.name}</h1>
              <p className="mt-2 text-gray-600">{classData.subject} - {classData.grade} კლასი</p>
              {classData.description && (
                <p className="mt-1 text-gray-500">{classData.description}</p>
              )}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowAddStudentsModal(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium"
              >
                მოსწავლის დამატება
              </button>
              <button
                onClick={handleDeleteClass}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium"
              >
                კლასის წაშლა
              </button>
            </div>
          </div>

          {/* Students List */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                მოსწავლეები ({classData.students.length})
              </h2>
            </div>
            <div className="px-6 py-4">
              {classData.students.length === 0 ? (
                <div className="text-center py-8">
                  <div className="mx-auto h-16 w-16 text-gray-400">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">მოსწავლეები არ არის</h3>
                  <p className="mt-1 text-sm text-gray-500">დაამატეთ მოსწავლეები კლასში</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          მოსწავლე
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          კლასი
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          სკოლა
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          კოდი
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          დამატების თარიღი
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          მოქმედება
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {classData.students.map((classStudent) => (
                        <tr key={classStudent.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {classStudent.student.name} {classStudent.student.lastname}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {classStudent.student.grade} კლასი
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {classStudent.student.school}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {classStudent.student.code}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(classStudent.joinedAt).toLocaleDateString('ka-GE')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleRemoveStudent(classStudent.student.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              წაშლა
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Students Modal */}
      {showAddStudentsModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">მოსწავლეების დამატება</h3>
              <p className="text-sm text-gray-600 mb-4">
                ძებნა მხოლოდ დარეგისტრირებულ მოსწავლეებს შორის
              </p>
              
              {/* Search and Load All */}
              <div className="mb-4">
                <div className="flex space-x-2 mb-3">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ძებნა დარეგისტრირებულ მოსწავლეებს შორის..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleSearchStudents}
                    disabled={searchLoading || !searchQuery.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                  >
                    {searchLoading ? 'ძიება...' : 'ძიება'}
                  </button>
                </div>
                <div className="flex justify-center">
                  <button
                    onClick={handleLoadAllStudents}
                    disabled={searchLoading}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 text-sm"
                  >
                    {searchLoading ? 'იტვირთება...' : 'ყველა მოსწავლის ნახვა'}
                  </button>
                </div>
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && !showAllStudents && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">ძიების შედეგები:</h4>
                  <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-md">
                    {searchResults.map((student) => (
                      <div key={student.id} className="flex items-center justify-between p-3 border-b border-gray-100">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {student.name} {student.lastname}
                          </div>
                          <div className="text-sm text-gray-500">
                            {student.grade} კლასი, {student.school} - {student.code}
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={selectedStudents.includes(student.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedStudents([...selectedStudents, student.id])
                            } else {
                              setSelectedStudents(selectedStudents.filter(id => id !== student.id))
                            }
                          }}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* All Students List */}
              {showAllStudents && allStudents.length > 0 && (
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-medium text-gray-700">
                      ყველა დარეგისტრირებული მოსწავლე ({allStudents.length})
                    </h4>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          const allIds = allStudents.map(s => s.id)
                          setSelectedStudents(allIds)
                        }}
                        className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                      >
                        ყველას მონიშვნა
                      </button>
                      <button
                        onClick={() => setSelectedStudents([])}
                        className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                      >
                        ყველას გაუქმება
                      </button>
                    </div>
                  </div>
                  <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-md">
                    {allStudents.map((student) => (
                      <div key={student.id} className="flex items-center justify-between p-3 border-b border-gray-100">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {student.name} {student.lastname}
                          </div>
                          <div className="text-sm text-gray-500">
                            {student.grade} კლასი, {student.school} - {student.code}
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={selectedStudents.includes(student.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedStudents([...selectedStudents, student.id])
                            } else {
                              setSelectedStudents(selectedStudents.filter(id => id !== student.id))
                            }
                          }}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* No Results */}
              {searchResults.length === 0 && !showAllStudents && searchQuery && !searchLoading && (
                <div className="mb-4 text-center py-4">
                  <p className="text-gray-500">მოსწავლე ვერ მოიძებნა</p>
                </div>
              )}

              {/* No Students */}
              {showAllStudents && allStudents.length === 0 && !searchLoading && (
                <div className="mb-4 text-center py-4">
                  <p className="text-gray-500">ამ კლასის მოსწავლეები არ არის</p>
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowAddStudentsModal(false)
                    setSearchQuery('')
                    setSearchResults([])
                    setAllStudents([])
                    setSelectedStudents([])
                    setShowAllStudents(false)
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md"
                >
                  გაუქმება
                </button>
                <button
                  onClick={handleAddStudents}
                  disabled={selectedStudents.length === 0}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md disabled:bg-gray-400"
                >
                  დამატება ({selectedStudents.length})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function ClassDetailPage() {
  return (
    <TeacherOnly>
      <ClassDetailContent />
    </TeacherOnly>
  )
}
