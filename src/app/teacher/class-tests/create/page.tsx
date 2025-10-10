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

export default function CreateClassTestPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [teacherProfile, setTeacherProfile] = useState<TeacherProfile | null>(null)
  const [classes, setClasses] = useState<Class[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([])
  const [showCreateQuestion, setShowCreateQuestion] = useState(false)
  const [newQuestion, setNewQuestion] = useState({
    text: '',
    type: 'OPEN_ENDED' as 'OPEN_ENDED' | 'CLOSED_ENDED',
    options: [] as string[],
    correctAnswer: '',
    answerTemplate: '',
    points: 1,
    grade: '',
    image: [] as string[],
    content: '',
    maxPoints: 1,
    rubric: '',
    imageOptions: [] as string[]
  })
  const [newOption, setNewOption] = useState('')


  const [formData, setFormData] = useState({
    title: '',
    description: '',
    classId: '',
    startDate: '',
    startTime: '09:00',
    endDate: '',
    endTime: '17:00',
    duration: ''
  })

  const formatDate = (dateString: string) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('ka-GE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'Asia/Tbilisi'
    })
  }

  const formatDateTime = (dateString: string) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleString('ka-GE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Tbilisi'
    })
  }

  useEffect(() => {
    fetchTeacherProfile()
    fetchClasses()
    fetchQuestions()
  }, [])

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
      const response = await fetch('/api/teacher/test-questions')
      if (response.ok) {
        const data = await response.json()
        setQuestions(data.questions)
      }
    } catch (error) {
      console.error('Error fetching questions:', error)
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
      // Combine date and time for start and end
      const startDateTime = formData.startDate ? new Date(`${formData.startDate}T${formData.startTime}`).toISOString() : ''
      const endDateTime = formData.endDate ? new Date(`${formData.endDate}T${formData.endTime}`).toISOString() : ''
      
      const response = await fetch('/api/teacher/class-tests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          startDate: startDateTime,
          endDate: endDateTime,
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

  const handleQuestionToggle = (questionId: string) => {
    if (selectedQuestions.includes(questionId)) {
      setSelectedQuestions(prev => prev.filter(id => id !== questionId))
    } else {
      setSelectedQuestions(prev => [...prev, questionId])
    }
  }

  const handleCreateQuestion = async () => {
    if (!newQuestion.text.trim()) {
      alert('გთხოვთ შეიყვანოთ კითხვის ტექსტი')
      return
    }

    if (newQuestion.type === 'CLOSED_ENDED' && newQuestion.options.length < 2) {
      alert('დახურული კითხვისთვის მინიმუმ 2 ვარიანტი უნდა იყოს')
      return
    }

    if (newQuestion.type === 'CLOSED_ENDED' && !newQuestion.correctAnswer) {
      alert('გთხოვთ აირჩიოთ სწორი ვარიანტი')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/teacher/test-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...newQuestion,
          grade: 1 // Default grade, can be changed later
        })
      })

      if (response.ok) {
        const data = await response.json()
        setQuestions(prev => [data.question, ...prev])
        setSelectedQuestions(prev => [data.question.id, ...prev])
        setShowCreateQuestion(false)
        setNewQuestion({
          text: '',
          type: 'OPEN_ENDED',
          options: [],
          correctAnswer: '',
          answerTemplate: '',
          points: 1,
          grade: '',
          image: [],
          content: '',
          maxPoints: 1,
          rubric: '',
          imageOptions: []
        })
        alert('კითხვა წარმატებით შეიქმნა და დაემატა ტესტში')
      } else {
        const error = await response.json()
        alert(error.error || 'შეცდომა კითხვის შექმნისას')
      }
    } catch (error) {
      console.error('Error creating question:', error)
      alert('შეცდომა კითხვის შექმნისას')
    } finally {
      setLoading(false)
    }
  }

  const addOption = () => {
    if (newOption.trim() && !newQuestion.options.includes(newOption.trim())) {
      setNewQuestion(prev => ({
        ...prev,
        options: [...prev.options, newOption.trim()]
      }))
      setNewOption('')
    }
  }

  const removeOption = (index: number) => {
    setNewQuestion(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }))
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  დაწყების თარიღი და დრო
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <select
                    value={formData.startTime.split(':')[0]}
                    onChange={(e) => {
                      const minutes = formData.startTime.split(':')[1] || '00'
                      setFormData(prev => ({ ...prev, startTime: `${e.target.value}:${minutes}` }))
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={i.toString().padStart(2, '0')}>
                        {i.toString().padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                  <select
                    value={formData.startTime.split(':')[1] || '00'}
                    onChange={(e) => {
                      const hours = formData.startTime.split(':')[0]
                      setFormData(prev => ({ ...prev, startTime: `${hours}:${e.target.value}` }))
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {Array.from({ length: 60 }, (_, i) => (
                      <option key={i} value={i.toString().padStart(2, '0')}>
                        {i.toString().padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                </div>
                {formData.startDate && (
                  <p className="text-sm text-gray-600 mt-1">
                    <strong>დაწყება:</strong> {formatDateTime(`${formData.startDate}T${formData.startTime}`)}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  დასრულების თარიღი და დრო
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="date"
                    min={formData.startDate || new Date().toISOString().split('T')[0]}
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <select
                    value={formData.endTime.split(':')[0]}
                    onChange={(e) => {
                      const minutes = formData.endTime.split(':')[1] || '00'
                      setFormData(prev => ({ ...prev, endTime: `${e.target.value}:${minutes}` }))
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={i.toString().padStart(2, '0')}>
                        {i.toString().padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                  <select
                    value={formData.endTime.split(':')[1] || '00'}
                    onChange={(e) => {
                      const hours = formData.endTime.split(':')[0]
                      setFormData(prev => ({ ...prev, endTime: `${hours}:${e.target.value}` }))
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {Array.from({ length: 60 }, (_, i) => (
                      <option key={i} value={i.toString().padStart(2, '0')}>
                        {i.toString().padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                </div>
                {formData.endDate && (
                  <p className="text-sm text-gray-600 mt-1">
                    <strong>დასრულება:</strong> {formatDateTime(`${formData.endDate}T${formData.endTime}`)}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mt-6">

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
              <button
                type="button"
                onClick={() => setShowCreateQuestion(!showCreateQuestion)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                {showCreateQuestion ? 'უკან' : '+ ახალი კითხვა'}
              </button>
            </div>
            
      

            {teacherProfile && (
              <div className="mb-6 p-3 bg-blue-50 rounded-lg">
                <p className="text-blue-800 font-medium">
                  საგანი: {teacherProfile.subject}
                </p>
              </div>
            )}

            {/* Create New Question Form */}
            {showCreateQuestion && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">ახალი კითხვის შექმნა</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      კითხვის ტექსტი *
                    </label>
                    <textarea
                      value={newQuestion.text}
                      onChange={(e) => setNewQuestion({ ...newQuestion, text: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="შეიყვანეთ კითხვის ტექსტი..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        კითხვის ტიპი *
                      </label>
                      <select
                        value={newQuestion.type}
                        onChange={(e) => setNewQuestion({ ...newQuestion, type: e.target.value as 'OPEN_ENDED' | 'CLOSED_ENDED' })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="OPEN_ENDED">ღია კითხვა</option>
                        <option value="CLOSED_ENDED">დახურული კითხვა</option>
                      </select>
                    </div>
                  </div>

                  {newQuestion.type === 'CLOSED_ENDED' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ვარიანტები *
                      </label>
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newOption}
                            onChange={(e) => setNewOption(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addOption()}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="შეიყვანეთ ვარიანტი..."
                          />
                          <button
                            type="button"
                            onClick={addOption}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            დამატება
                          </button>
                        </div>
                        <div className="space-y-1">
                          {newQuestion.options.map((option, index) => (
                            <div key={index} className="flex items-center gap-2 p-2 bg-white rounded border">
                              <input
                                type="radio"
                                name="correctAnswer"
                                value={option}
                                checked={newQuestion.correctAnswer === option}
                                onChange={(e) => setNewQuestion({ ...newQuestion, correctAnswer: e.target.value })}
                                className="w-4 h-4 text-blue-600"
                              />
                              <span className="flex-1">{option}</span>
                              <button
                                type="button"
                                onClick={() => removeOption(index)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                        {newQuestion.options.length > 0 && !newQuestion.correctAnswer && (
                          <p className="text-red-600 text-sm">გთხოვთ აირჩიოთ სწორი ვარიანტი</p>
                        )}
                      </div>
                    </div>
                  )}

                  {newQuestion.type === 'OPEN_ENDED' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        პასუხის შაბლონი
                      </label>
                      <textarea
                        value={newQuestion.answerTemplate}
                        onChange={(e) => setNewQuestion({ ...newQuestion, answerTemplate: e.target.value })}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="პასუხის შაბლონი (ოფციონალური)..."
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ქულები
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={newQuestion.points}
                        onChange={(e) => setNewQuestion({ ...newQuestion, points: parseInt(e.target.value) || 1 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        მაქსიმალური ქულები
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={newQuestion.maxPoints}
                        onChange={(e) => setNewQuestion({ ...newQuestion, maxPoints: parseInt(e.target.value) || 1 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowCreateQuestion(false)}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      გაუქმება
                    </button>
                    <button
                      type="button"
                      onClick={handleCreateQuestion}
                      disabled={loading}
                      className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                      {loading ? 'შეიქმნება...' : 'კითხვის შექმნა'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Questions List */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {questions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>კითხვები არ მოიძებნა</p>
                  <p className="text-sm">შექმენით ახალი კითხვა</p>
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
