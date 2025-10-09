'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

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

interface Class {
  id: string
  name: string
  subject: string
  grade: number
}

interface Question {
  id: string
  text: string
  type: string
  subject: {
    id: string
    name: string
  }
  grade: number
}

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

export default function CreateClassTestPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [teacherProfile, setTeacherProfile] = useState<TeacherProfile | null>(null)
  const [classes, setClasses] = useState<Class[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [groups, setGroups] = useState<TestQuestionGroup[]>([])
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([])
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'questions' | 'groups'>('questions')
  const [filters, setFilters] = useState({
    grade: '',
    type: ''
  })

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    classId: '',
    startDate: '',
    endDate: '',
    duration: ''
  })

  useEffect(() => {
    fetchTeacherProfile()
    fetchClasses()
    fetchGroups()
  }, [])

  useEffect(() => {
    if (filters.grade || filters.type) {
      fetchQuestions()
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

  const fetchClasses = async () => {
    try {
      const response = await fetch('/api/teacher/classes')
      if (response.ok) {
        const data = await response.json()
        setClasses(data.classes)
      }
    } catch (error) {
      console.error('Error fetching classes:', error)
    }
  }

  const fetchQuestions = async () => {
    try {
      const params = new URLSearchParams()
      if (filters.grade) params.append('grade', filters.grade)
      if (filters.type) params.append('type', filters.type)

      const response = await fetch(`/api/teacher/test-questions?${params}`)
      if (response.ok) {
        const data = await response.json()
        setQuestions(data.questions)
      }
    } catch (error) {
      console.error('Error fetching questions:', error)
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
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (selectedQuestions.length === 0) {
      alert('გთხოვთ აირჩიოთ მინიმუმ ერთი კითხვა')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/teacher/class-tests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          questionIds: selectedQuestions,
          subjectId: teacherProfile?.subject
        })
      })

      if (response.ok) {
        router.push('/teacher/class-tests')
      } else {
        const error = await response.json()
        alert(error.error || 'შეცდომა ტესტის შექმნისას')
      }
    } catch (error) {
      console.error('Error creating test:', error)
      alert('შეცდომა ტესტის შექმნისას')
    } finally {
      setLoading(false)
    }
  }

  const handleGroupSelect = (groupId: string) => {
    const group = groups.find(g => g.id === groupId)
    if (group) {
      const questionIds = group.questions.map(gq => gq.question.id)
      setSelectedQuestions(questionIds)
      setSelectedGroup(groupId)
    }
  }

  const handleQuestionToggle = (questionId: string) => {
    if (selectedQuestions.includes(questionId)) {
      setSelectedQuestions(prev => prev.filter(id => id !== questionId))
    } else {
      setSelectedQuestions(prev => [...prev, questionId])
    }
    setSelectedGroup(null) // Clear group selection when manually selecting questions
  }

  const toggleQuestion = (questionId: string) => {
    setSelectedQuestions(prev => 
      prev.includes(questionId) 
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-700 mb-4"
          >
            ← უკან
          </button>
          <h1 className="text-3xl font-bold text-gray-900">ახალი ტესტის შექმნა</h1>
          <p className="text-gray-600 mt-2">შექმენით ახალი ტესტი თქვენი კლასისთვის</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">ძირითადი ინფორმაცია</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ტესტის სახელი *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="მაგ: მათემატიკის ტესტი #1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  კლასი *
                </label>
                <select
                  required
                  value={formData.classId}
                  onChange={(e) => {
                    setFormData({ 
                      ...formData, 
                      classId: e.target.value
                    })
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">აირჩიეთ კლასი</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} - {cls.subject} (კლასი {cls.grade})
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  აღწერა
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="ტესტის აღწერა..."
                />
              </div>
            </div>
          </div>

          {/* Time Settings */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">დროის პარამეტრები</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  დაწყების თარიღი
                </label>
                <input
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  დასრულების თარიღი
                </label>
                <input
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ხანგრძლივობა (წუთები)
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="მაგ: 60"
                />
              </div>
            </div>
          </div>

          {/* Question Selection */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">კითხვების არჩევა</h2>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab('questions')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'questions'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  ცალკეული კითხვები
                </button>
                <button
                  onClick={() => setActiveTab('groups')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'groups'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  კითხვების ჯგუფები
                </button>
              </div>
            </div>
            
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  კითხვის ტიპი
                </label>
                <select
                  value={filters.type}
                  onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">ყველა ტიპი</option>
                  <option value="OPEN_ENDED">ღია კითხვა</option>
                  <option value="CLOSED_ENDED">დახურული კითხვა</option>
                </select>
              </div>
            </div>

            {teacherProfile && (
              <div className="mb-6 p-3 bg-blue-50 rounded-lg">
                <p className="text-blue-800 font-medium">
                  საგანი: {teacherProfile.subject}
                </p>
              </div>
            )}

            {/* Questions List */}
            {activeTab === 'questions' && (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {questions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>კითხვები არ მოიძებნა</p>
                    <p className="text-sm">გთხოვთ აირჩიოთ ფილტრები</p>
                  </div>
                ) : (
                  questions.map((question) => (
                    <div
                      key={question.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        selectedQuestions.includes(question.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleQuestionToggle(question.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              question.type === 'OPEN_ENDED'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {question.type === 'OPEN_ENDED' ? 'ღია' : 'დახურული'}
                            </span>
                            <span className="text-sm text-gray-500">
                              {question.subject.name} - კლასი {question.grade}
                            </span>
                          </div>
                          <p className="text-gray-900">{question.text}</p>
                        </div>
                        <div className="ml-4">
                          {selectedQuestions.includes(question.id) ? (
                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          ) : (
                            <div className="w-6 h-6 border-2 border-gray-300 rounded-full"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Groups List */}
            {activeTab === 'groups' && (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {groups.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>ჯგუფები არ მოიძებნა</p>
                    <button
                      onClick={() => router.push('/teacher/test-question-groups')}
                      className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      შექმენი ჯგუფი
                    </button>
                  </div>
                ) : (
                  groups.map((group) => (
                    <div
                      key={group.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        selectedGroup === group.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleGroupSelect(group.id)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-medium text-gray-900">{group.name}</h3>
                            <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              კლასი {group.grade}
                            </span>
                            <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                              {group.questions.length} კითხვა
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm mb-2">{group.description}</p>
                          <div className="text-xs text-gray-500">
                            {group.questions.slice(0, 2).map((gq, index) => (
                              <span key={gq.id}>
                                {index > 0 && ', '}
                                {gq.question.text.substring(0, 50)}...
                              </span>
                            ))}
                            {group.questions.length > 2 && (
                              <span> და კიდევ {group.questions.length - 2} კითხვა</span>
                            )}
                          </div>
                        </div>
                        <div className="ml-4">
                          {selectedGroup === group.id ? (
                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          ) : (
                            <div className="w-6 h-6 border-2 border-gray-300 rounded-full"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {selectedQuestions.length > 0 && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-blue-800 font-medium">
                  არჩეულია {selectedQuestions.length} კითხვა
                </p>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading || selectedQuestions.length === 0}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'შეიქმნება...' : 'ტესტის შექმნა'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
