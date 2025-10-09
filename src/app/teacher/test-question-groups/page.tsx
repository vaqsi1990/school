'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface TestQuestionGroup {
  id: string
  name: string
  description?: string
  subject: {
    id: string
    name: string
  }
  grade: number
  createdAt: string
  isActive: boolean
  questions: Array<{
    id: string
    order: number
    points: number
    question: {
      id: string
      text: string
      type: string
    }
  }>
}

interface TeacherProfile {
  id: string
  name: string
  lastname: string
  subject: string
  school: string
  phone: string
  isVerified: boolean
  canCreateQuestions: boolean
}

export default function TestQuestionGroupsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [groups, setGroups] = useState<TestQuestionGroup[]>([])
  const [teacherProfile, setTeacherProfile] = useState<TeacherProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [filters, setFilters] = useState({
    grade: ''
  })

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    grade: 1
  })

  useEffect(() => {
    if (session?.user) {
      fetchTeacherProfile()
      fetchGroups()
    }
  }, [session])

  useEffect(() => {
    if (filters.grade) {
      fetchGroups()
    }
  }, [filters])

  const fetchTeacherProfile = async () => {
    try {
      const response = await fetch('/api/teacher/profile')
      if (response.ok) {
        const data = await response.json()
        setTeacherProfile(data.profile)
      }
    } catch (error) {
      console.error('Error fetching teacher profile:', error)
    }
  }

  const fetchGroups = async () => {
    try {
      const params = new URLSearchParams()
      if (filters.grade) params.append('grade', filters.grade)

      const response = await fetch(`/api/teacher/test-question-groups?${params}`)
      if (response.ok) {
        const data = await response.json()
        setGroups(data.groups)
      }
    } catch (error) {
      console.error('Error fetching groups:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      alert('გთხოვთ შეიყვანოთ ჯგუფის სახელი')
      return
    }

    try {
      const response = await fetch('/api/teacher/test-question-groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          questionIds: [] // Empty group initially
        })
      })

      if (response.ok) {
        setShowCreateForm(false)
        setFormData({
          name: '',
          description: '',
          grade: 1
        })
        fetchGroups()
        alert('ჯგუფი წარმატებით შეიქმნა!')
      } else {
        const error = await response.json()
        alert(error.error || 'შეცდომა ჯგუფის შექმნისას')
      }
    } catch (error) {
      console.error('Error creating group:', error)
      alert('შეცდომა ჯგუფის შექმნისას')
    }
  }

  const deleteGroup = async (groupId: string) => {
    if (!confirm('ნამდვილად გსურთ ჯგუფის წაშლა?')) return

    try {
      const response = await fetch(`/api/teacher/test-question-groups/${groupId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setGroups(groups.filter(group => group.id !== groupId))
        alert('ჯგუფი წარმატებით წაიშალა!')
      } else {
        alert('შეცდომა ჯგუფის წაშლისას')
      }
    } catch (error) {
      console.error('Error deleting group:', error)
      alert('შეცდომა ჯგუფის წაშლისას')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">იტვირთება...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">ტესტის კითხვების ჯგუფები</h1>
            <p className="text-gray-600 mt-2">შექმენით და მართეთ კითხვების ჯგუფები</p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            ახალი ჯგუფი
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">ფილტრები</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                კლასი
              </label>
              <select
                value={filters.grade}
                onChange={(e) => setFilters({ ...filters, grade: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">ყველა კლასი</option>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((grade) => (
                  <option key={grade} value={grade}>
                    კლასი {grade}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {teacherProfile && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-blue-800 font-medium">
                საგანი: {teacherProfile.subject}
              </p>
            </div>
          )}
        </div>

        {/* Groups List */}
        <div className="space-y-4">
          {groups.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📚</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">ჯგუფები არ არის</h3>
              <p className="text-gray-600 mb-6">ჯერ არ შექმნილია არცერთი ჯგუფი</p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                შექმენი პირველი ჯგუფი
              </button>
            </div>
          ) : (
            groups.map((group) => (
              <div key={group.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{group.name}</h3>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        კლასი {group.grade}
                      </span>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {group.questions.length} კითხვა
                      </span>
                    </div>
                    <p className="text-gray-600 mb-2">{group.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>📚 {group.subject.name}</span>
                      <span>📅 {new Date(group.createdAt).toLocaleDateString('ka-GE')}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => router.push(`/teacher/test-question-groups/${group.id}`)}
                      className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm font-medium hover:bg-blue-200 transition-colors"
                    >
                      რედაქტირება
                    </button>
                    <button
                      onClick={() => deleteGroup(group.id)}
                      className="bg-red-100 text-red-700 px-3 py-1 rounded text-sm font-medium hover:bg-red-200 transition-colors"
                    >
                      წაშლა
                    </button>
                  </div>
                </div>

                {group.questions.length > 0 && (
                  <div className="border-t pt-4">
                    <h4 className="font-medium text-gray-900 mb-3">კითხვები</h4>
                    <div className="space-y-2">
                      {group.questions.slice(0, 3).map((groupQuestion) => (
                        <div key={groupQuestion.id} className="bg-gray-50 rounded-lg p-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-700">
                              {groupQuestion.question.text}
                            </span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              groupQuestion.question.type === 'OPEN_ENDED'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {groupQuestion.question.type === 'OPEN_ENDED' ? 'ღია' : 'დახურული'}
                            </span>
                          </div>
                        </div>
                      ))}
                      {group.questions.length > 3 && (
                        <div className="text-center text-sm text-gray-500">
                          და კიდევ {group.questions.length - 3} კითხვა...
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Create Group Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">ახალი ჯგუფის შექმნა</h2>
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ჯგუფის სახელი *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="მაგ: მათემატიკის ტესტი #1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      აღწერა
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="ჯგუფის აღწერა..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      კლასი *
                    </label>
                    <select
                      required
                      value={formData.grade}
                      onChange={(e) => setFormData({ ...formData, grade: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((grade) => (
                        <option key={grade} value={grade}>
                          კლასი {grade}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => setShowCreateForm(false)}
                      className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      გაუქმება
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      ჯგუფის შექმნა
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
