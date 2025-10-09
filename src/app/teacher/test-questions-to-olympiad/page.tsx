'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface TestQuestion {
  id: string
  text: string
  type: 'OPEN_ENDED' | 'CLOSED_ENDED'
  options: string[]
  correctAnswer?: string
  answerTemplate?: string
  points: number
  subject: {
    id: string
    name: string
  }
  grade: number
  createdAt: string
  isActive: boolean
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

export default function TestQuestionsToOlympiadPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [questions, setQuestions] = useState<TestQuestion[]>([])
  const [teacherProfile, setTeacherProfile] = useState<TeacherProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([])
  const [filters, setFilters] = useState({
    grade: '',
    type: ''
  })

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    grade: 1,
    duration: 60
  })

  useEffect(() => {
    if (session?.user) {
      fetchTeacherProfile()
      fetchQuestions()
    }
  }, [session])

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
    } finally {
      setLoading(false)
    }
  }

  const handleQuestionToggle = (questionId: string) => {
    if (selectedQuestions.includes(questionId)) {
      setSelectedQuestions(prev => prev.filter(id => id !== questionId))
    } else {
      setSelectedQuestions(prev => [...prev, questionId])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (selectedQuestions.length === 0) {
      alert('გთხოვთ აირჩიოთ მინიმუმ ერთი კითხვა')
      return
    }

    if (!formData.title.trim()) {
      alert('გთხოვთ შეიყვანოთ ოლიმპიადის სახელი')
      return
    }

    setCreating(true)
    try {
      const response = await fetch('/api/teacher/test-questions-to-olympiad', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          questionIds: selectedQuestions
        })
      })

      if (response.ok) {
        alert('ოლიმპიადი წარმატებით შეიქმნა!')
        router.push('/teacher/olympiads')
      } else {
        const error = await response.json()
        alert(error.error || 'შეცდომა ოლიმპიადის შექმნისას')
      }
    } catch (error) {
      console.error('Error creating olympiad:', error)
      alert('შეცდომა ოლიმპიადის შექმნისას')
    } finally {
      setCreating(false)
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-700 mb-4"
          >
            ← უკან
          </button>
          
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">ტესტის კითხვებიდან ოლიმპიადის შექმნა</h1>
              <p className="text-gray-600 mb-4">აირჩიეთ ტესტის კითხვები და შექმენით ოლიმპიადი</p>
              
              {teacherProfile && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-blue-800 font-medium">
                    საგანი: {teacherProfile.subject}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Form */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">ოლიმპიადის ინფორმაცია</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ოლიმპიადის სახელი *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="მაგ: მათემატიკის ოლიმპიადი #1"
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
                  placeholder="ოლიმპიადის აღწერა..."
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ხანგრძლივობა (წუთები) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={creating || selectedQuestions.length === 0}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {creating ? 'ოლიმპიადის შექმნა...' : 'ოლიმპიადის შექმნა'}
              </button>
            </form>
          </div>

          {/* Right Column - Questions Selection */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">კითხვების არჩევა</h2>
              {selectedQuestions.length > 0 && (
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {selectedQuestions.length} არჩეული
                </span>
              )}
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

            {/* Questions List */}
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
                            კლასი {question.grade}
                          </span>
                          <span className="text-sm text-gray-500">
                            {question.points} ქულა
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
          </div>
        </div>
      </div>
    </div>
  )
}
