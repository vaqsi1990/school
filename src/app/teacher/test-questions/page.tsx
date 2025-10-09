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

export default function TestQuestionsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [questions, setQuestions] = useState<TestQuestion[]>([])
  const [teacherProfile, setTeacherProfile] = useState<TeacherProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [filters, setFilters] = useState({
    grade: '',
    type: ''
  })

  const [formData, setFormData] = useState({
    text: '',
    type: 'CLOSED_ENDED' as 'OPEN_ENDED' | 'CLOSED_ENDED',
    options: ['', '', '', ''],
    correctAnswer: '',
    answerTemplate: '',
    points: 1,
    grade: 1,
    content: '',
    maxPoints: 1,
    rubric: ''
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.type === 'CLOSED_ENDED' && formData.options.some(opt => !opt.trim())) {
      alert('გთხოვთ შეავსოთ ყველა ვარიანტი')
      return
    }

    if (formData.type === 'CLOSED_ENDED' && !formData.correctAnswer) {
      alert('გთხოვთ აირჩიოთ სწორი პასუხი')
      return
    }

    try {
      const response = await fetch('/api/teacher/test-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          options: formData.type === 'CLOSED_ENDED' ? formData.options : []
        })
      })

      if (response.ok) {
        setShowCreateForm(false)
        setFormData({
          text: '',
          type: 'CLOSED_ENDED',
          options: ['', '', '', ''],
          correctAnswer: '',
          answerTemplate: '',
          points: 1,
          grade: 1,
          content: '',
          maxPoints: 1,
          rubric: ''
        })
        fetchQuestions()
        alert('კითხვა წარმატებით შეიქმნა!')
      } else {
        const error = await response.json()
        alert(error.error || 'შეცდომა კითხვის შექმნისას')
      }
    } catch (error) {
      console.error('Error creating question:', error)
      alert('შეცდომა კითხვის შექმნისას')
    }
  }

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options]
    newOptions[index] = value
    setFormData({ ...formData, options: newOptions })
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
            <h1 className="text-3xl font-bold text-gray-900">ტესტის კითხვები</h1>
            <p className="text-gray-600 mt-2">შექმენით და მართეთ ტესტის კითხვები</p>
          </div>
          <div className="flex gap-3">
          
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              ახალი კითხვა
            </button>
          </div>
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
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-blue-800 font-medium">
                საგანი: {teacherProfile.subject}
              </p>
            </div>
          )}
        </div>

        {/* Questions List */}
        <div className="space-y-4">
          {questions.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">❓</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">კითხვები არ არის</h3>
              <p className="text-gray-600 mb-6">ჯერ არ შექმნილია არცერთი კითხვა</p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                შექმენი პირველი კითხვა
              </button>
            </div>
          ) : (
            questions.map((question) => (
              <div key={question.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        question.type === 'OPEN_ENDED'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {question.type === 'OPEN_ENDED' ? 'ღია' : 'დახურული'}
                      </span>
                      <span className="text-sm text-gray-500">
                        {question.subject.name} - კლასი {question.grade}
                      </span>
                      <span className="text-sm text-gray-500">
                        {question.points} ქულა
                      </span>
                    </div>
                    <p className="text-gray-900 text-lg">{question.text}</p>
                    
                    {question.type === 'CLOSED_ENDED' && question.options.length > 0 && (
                      <div className="mt-3 space-y-1">
                        {question.options.map((option, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <span className="text-sm text-gray-500 w-6">
                              {String.fromCharCode(65 + index)}.
                            </span>
                            <span className={`px-2 py-1 rounded text-sm ${
                              option === question.correctAnswer
                                ? 'bg-green-100 text-green-800 border border-green-200'
                                : 'bg-gray-50 text-gray-700'
                            }`}>
                              {option}
                              {option === question.correctAnswer && (
                                <span className="ml-2 text-green-600">✓</span>
                              )}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Create Question Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">ახალი კითხვის შექმნა</h2>
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
                      კითხვის ტექსტი *
                    </label>
                    <textarea
                      required
                      value={formData.text}
                      onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="შეიყვანეთ კითხვის ტექსტი..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        კითხვის ტიპი *
                      </label>
                      <select
                        required
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value as 'OPEN_ENDED' | 'CLOSED_ENDED' })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="CLOSED_ENDED">დახურული კითხვა</option>
                        <option value="OPEN_ENDED">ღია კითხვა</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ქულა *
                      </label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={formData.points}
                        onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        საგანი
                      </label>
                      <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600">
                        {teacherProfile?.subject || 'იტვირთება...'}
                      </div>
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
                  </div>

                  {formData.type === 'CLOSED_ENDED' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        პასუხის ვარიანტები *
                      </label>
                      <div className="space-y-2">
                        {formData.options.map((option, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <span className="text-sm text-gray-500 w-6">
                              {String.fromCharCode(65 + index)}.
                            </span>
                            <input
                              type="text"
                              required
                              value={option}
                              onChange={(e) => handleOptionChange(index, e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder={`ვარიანტი ${String.fromCharCode(65 + index)}`}
                            />
                            <input
                              type="radio"
                              name="correctAnswer"
                              value={option}
                              checked={formData.correctAnswer === option}
                              onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
                              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-500">სწორი</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {formData.type === 'OPEN_ENDED' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        პასუხის შაბლონი
                      </label>
                      <textarea
                        value={formData.answerTemplate}
                        onChange={(e) => setFormData({ ...formData, answerTemplate: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="შეიყვანეთ სწორი პასუხის შაბლონი..."
                      />
                    </div>
                  )}

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
                      კითხვის შექმნა
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
