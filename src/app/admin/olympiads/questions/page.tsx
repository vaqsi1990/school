'use client'

import { useAuth } from '@/hooks/useAuth'
import { AdminOnly } from '@/components/auth/ProtectedRoute'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import ImageUpload from '@/component/CloudinaryUploader'
interface Subject {
  id: string
  name: string
}

interface Chapter {
  id: string
  name: string
  subjectId: string
}

interface Paragraph {
  id: string
  name: string
  chapterId: string
}

interface Question {
  id: string
  text: string
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE'
  options: string[]
  correctAnswer: string
  points: number
  image?: string
  subjectId: string
  chapterId?: string
  paragraphId?: string
  grade: number
  round: number
  createdAt: string
}

function AdminQuestionsContent() {
  const { user } = useAuth()
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [paragraphs, setParagraphs] = useState<Paragraph[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [activeTab, setActiveTab] = useState<'all' | 'multiple-choice' | 'true-false'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')
  const [selectedGrade, setSelectedGrade] = useState('')
  const [selectedRound, setSelectedRound] = useState('')
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletingQuestionId, setDeletingQuestionId] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    text: '',
    type: 'MULTIPLE_CHOICE' as 'MULTIPLE_CHOICE' | 'TRUE_FALSE',
    options: ['', '', '', ''],
    correctAnswer: '',
    points: 1,
    image: '',
    subjectId: '',
    chapterId: '',
    paragraphId: '',
    grade: 5,
    round: 1
  })

  useEffect(() => {
    if (user) {
      fetchSubjects()
      fetchQuestions()
    }
  }, [user])

  useEffect(() => {
    if (selectedSubject) {
      fetchChapters(selectedSubject)
    }
  }, [selectedSubject])

  useEffect(() => {
    if (selectedSubject && selectedGrade) {
      fetchParagraphs(selectedSubject, parseInt(selectedGrade))
    }
  }, [selectedSubject, selectedGrade])

  const fetchSubjects = async () => {
    try {
      const response = await fetch('/api/admin/subjects')
      if (response.ok) {
        const data = await response.json()
        setSubjects(data.subjects)
      }
    } catch (error) {
      console.error('Error fetching subjects:', error)
    }
  }

  const fetchChapters = async (subjectId: string) => {
    try {
      const response = await fetch(`/api/admin/chapters?subjectId=${subjectId}`)
      if (response.ok) {
        const data = await response.json()
        setChapters(data.chapters)
      }
    } catch (error) {
      console.error('Error fetching chapters:', error)
    }
  }

  const fetchParagraphs = async (subjectId: string, grade: number) => {
    try {
      const response = await fetch(`/api/admin/paragraphs?subjectId=${subjectId}&grade=${grade}`)
      if (response.ok) {
        const data = await response.json()
        setParagraphs(data.paragraphs)
      }
    } catch (error) {
      console.error('Error fetching paragraphs:', error)
    }
  }

  const fetchQuestions = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/questions')
      if (response.ok) {
        const data = await response.json()
        setQuestions(data.questions)
      }
    } catch (error) {
      console.error('Error fetching questions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const createDefaultSubjects = async () => {
    try {
      const defaultSubjects = [
        { name: 'მათემატიკა', description: 'მათემატიკის საგანი' },
        { name: 'ფიზიკა', description: 'ფიზიკის საგანი' },
        { name: 'ქიმია', description: 'ქიმიის საგანი' },
        { name: 'ბიოლოგია', description: 'ბიოლოგიის საგანი' },
        { name: 'ისტორია', description: 'ისტორიის საგანი' },
        { name: 'გეოგრაფია', description: 'გეოგრაფიის საგანი' },
        { name: 'ქართული ენა', description: 'ქართული ენის საგანი' },
        { name: 'ინგლისური ენა', description: 'ინგლისური ენის საგანი' }
      ]

      for (const subject of defaultSubjects) {
        await fetch('/api/admin/subjects', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(subject),
        })
      }

      alert('საწყისი საგნები წარმატებით შეიქმნა!')
      fetchSubjects()
    } catch (error) {
      console.error('Error creating default subjects:', error)
      alert('შეცდომა მოხდა საგნების შექმნისას')
    }
  }

  const editQuestion = (question: Question) => {
    setEditingQuestion(question)
    setFormData({
      text: question.text,
      type: question.type,
      options: question.options,
      correctAnswer: question.correctAnswer,
      points: question.points,
      image: question.image || '',
      subjectId: question.subjectId,
      chapterId: question.chapterId || '',
      paragraphId: question.paragraphId || '',
      grade: question.grade,
      round: question.round
    })
    setShowAddForm(true)
  }

  const deleteQuestion = async (questionId: string) => {
    try {
      const response = await fetch(`/api/admin/questions/${questionId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        alert('კითხვა წარმატებით წაიშალა!')
        setQuestions(prevQuestions => prevQuestions.filter(q => q.id !== questionId))
        setShowDeleteModal(false)
        setDeletingQuestionId(null)
      } else {
        const error = await response.json()
        alert(`შეცდომა: ${error.message}`)
      }
    } catch (error) {
      console.error('Error deleting question:', error)
      alert('სისტემური შეცდომა მოხდა')
    }
  }

  const openDeleteModal = (questionId: string) => {
    setDeletingQuestionId(questionId)
    setShowDeleteModal(true)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options]
    newOptions[index] = value
    setFormData(prev => ({
      ...prev,
      options: newOptions
    }))
  }

  const handleAddOption = () => {
    if (formData.options.length < 6) {
      setFormData(prev => ({
        ...prev,
        options: [...prev.options, '']
      }))
    }
  }

  const handleRemoveOption = (index: number) => {
    if (formData.options.length > 2) {
      const newOptions = formData.options.filter((_, i) => i !== index)
      setFormData(prev => ({
        ...prev,
        options: newOptions
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingQuestion 
        ? `/api/admin/questions/${editingQuestion.id}`
        : '/api/admin/questions'
      
      const method = editingQuestion ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const message = editingQuestion ? 'კითხვა წარმატებით განახლდა!' : 'კითხვა წარმატებით დაემატა!'
        alert(message)
        setShowAddForm(false)
        resetForm()
        fetchQuestions()
      } else {
        const error = await response.json()
        alert(`შეცდომა: ${error.message}`)
      }
    } catch (error) {
      console.error('Error saving question:', error)
      alert('სისტემური შეცდომა მოხდა')
    }
  }

  const resetForm = () => {
    setFormData({
      text: '',
      type: 'MULTIPLE_CHOICE',
      options: ['', '', '', ''],
      correctAnswer: '',
      points: 1,
      image: '',
      subjectId: '',
      chapterId: '',
      paragraphId: '',
      grade: 5,
      round: 1
    })
    setEditingQuestion(null)
  }

  const filteredQuestions = questions.filter(question => {
    const matchesSearch = question.text.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = activeTab === 'all' || question.type.toLowerCase().includes(activeTab.replace('-', ''))
    const matchesSubject = !selectedSubject || question.subjectId === selectedSubject
    const matchesGrade = !selectedGrade || question.grade === parseInt(selectedGrade)
    const matchesRound = !selectedRound || question.round === parseInt(selectedRound)
    
    return matchesSearch && matchesType && matchesSubject && matchesGrade && matchesRound
  })

  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case 'MULTIPLE_CHOICE': return 'მრავალი არჩევანი'
      case 'TRUE_FALSE': return 'მართალი/ცრუ'
      default: return type
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-black md:text-[18px] text-[16px]">კითხვები იტვირთება...</p>
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
                კითხვების მართვა
              </h1>
              <p className="text-black md:text-[18px] text-[16px]">
                ოლიმპიადების კითხვების შექმნა და მართვა
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md md:text-[18px] text-[16px] font-bold"
              >
                ახალი კითხვა
              </button>
              {subjects.length === 0 && (
                <button
                  onClick={createDefaultSubjects}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md md:text-[18px] text-[16px] font-bold"
                >
                  საწყისი საგნების შექმნა
                </button>
              )}
              <Link
                href="/admin/olympiads"
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md md:text-[18px] text-[16px] font-bold"
              >
                დაბრუნება
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Search */}
        <div className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="lg:col-span-2">
              <input
                type="text"
                placeholder="მოძებნა კითხვის ტექსტით..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 md:text-[18px] text-[16px]"
              />
            </div>
            <div>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 md:text-[18px] text-[16px]"
              >
                <option value="">ყველა საგანი</option>
                {subjects.map(subject => (
                  <option key={subject.id} value={subject.id}>{subject.name}</option>
                ))}
              </select>
            </div>
            <div>
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 md:text-[18px] text-[16px]"
              >
                <option value="">ყველა კლასი</option>
                {[5, 6, 7, 8, 9, 10, 11, 12].map(grade => (
                  <option key={grade} value={grade}>{grade} კლასი</option>
                ))}
              </select>
            </div>
            <div>
              <select
                value={selectedRound}
                onChange={(e) => setSelectedRound(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 md:text-[18px] text-[16px]"
              >
                <option value="">ყველა რაუნდი</option>
                {[1, 2, 3].map(round => (
                  <option key={round} value={round}>{round} რაუნდი</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-md font-medium md:text-[18px] text-[16px] ${
                activeTab === 'all' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-black hover:bg-gray-300'
              }`}
            >
              ყველა ({questions.length})
            </button>
            <button
              onClick={() => setActiveTab('multiple-choice')}
              className={`px-4 py-2 rounded-md font-medium md:text-[18px] text-[16px] ${
                activeTab === 'multiple-choice' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-black hover:bg-gray-300'
              }`}
            >
              მრავალი არჩევანი ({questions.filter(q => q.type === 'MULTIPLE_CHOICE').length})
            </button>
            <button
              onClick={() => setActiveTab('true-false')}
              className={`px-4 py-2 rounded-md font-medium md:text-[18px] text-[16px] ${
                activeTab === 'true-false' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-black hover:bg-gray-300'
              }`}
            >
              მართალი/ცრუ ({questions.filter(q => q.type === 'TRUE_FALSE').length})
            </button>
          </div>
        </div>

        {/* Questions List */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    კითხვა
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ტიპი
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    საგანი
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    კლასი
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    რაუნდი
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ქულები
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    მოქმედებები
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredQuestions.map((question) => (
                  <tr key={question.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <div className="text-sm font-medium text-black md:text-[18px] text-[16px]">
                          {question.text.length > 100 ? `${question.text.substring(0, 100)}...` : question.text}
                        </div>
                        {question.image && (
                          <div className="text-xs text-gray-500 mt-1">🖼️ სურათი არის</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        question.type === 'MULTIPLE_CHOICE' ? 'bg-blue-100 text-blue-800' :
                        question.type === 'TRUE_FALSE' ? 'bg-purple-100 text-purple-800' :
                        ''
                      }`}>
                        {getQuestionTypeLabel(question.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black md:text-[18px] text-[16px]">
                      {subjects.find(s => s.id === question.subjectId)?.name || 'უცნობი'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black md:text-[18px] text-[16px]">
                      {question.grade} კლასი
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black md:text-[18px] text-[16px]">
                      {question.round} რაუნდი
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black md:text-[18px] text-[16px]">
                      {question.points}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black md:text-[18px] text-[16px]">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => editQuestion(question)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-medium"
                        >
                          რედაქტირება
                        </button>
                        <button 
                          onClick={() => openDeleteModal(question.id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-medium"
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
          
          {filteredQuestions.length === 0 && (
            <div className="text-center py-12">
              <p className="text-black md:text-[18px] text-[16px]">კითხვა ვერ მოიძებნა</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Question Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-black md:text-[20px] text-[18px]">
                  {editingQuestion ? 'კითხვის რედაქტირება' : 'ახალი კითხვის დამატება'}
                </h3>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Question Text */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-black md:text-[18px] text-[16px] mb-2">
                      კითხვის ტექსტი *
                    </label>
                    <textarea
                      name="text"
                      required
                      value={formData.text}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 md:text-[18px] text-[16px]"
                      placeholder="შეიყვანეთ კითხვის ტექსტი..."
                    />
                  </div>

                  {/* Question Type */}
                  <div>
                    <label className="block text-sm font-medium text-black md:text-[18px] text-[16px] mb-2">
                      კითხვის ტიპი *
                    </label>
                    <select
                      name="type"
                      required
                      value={formData.type}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 md:text-[18px] text-[16px]"
                    >
                      <option value="MULTIPLE_CHOICE">მრავალი არჩევანი</option>
                      <option value="TRUE_FALSE">მართალი/ცრუ</option>
                    </select>
                  </div>

                  {/* Points */}
                  <div>
                    <label className="block text-sm font-medium text-black md:text-[18px] text-[16px] mb-2">
                      ქულები *
                    </label>
                    <input
                      type="number"
                      name="points"
                      required
                      min="1"
                      max="10"
                      value={formData.points}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 md:text-[18px] text-[16px]"
                    />
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block text-sm font-medium text-black md:text-[18px] text-[16px] mb-2">
                      საგანი *
                    </label>
                    <select
                      name="subjectId"
                      required
                      value={formData.subjectId}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 md:text-[18px] text-[16px]"
                    >
                      <option value="">აირჩიეთ საგანი</option>
                      {subjects.map(subject => (
                        <option key={subject.id} value={subject.id}>{subject.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Grade */}
                  <div>
                    <label className="block text-sm font-medium text-black md:text-[18px] text-[16px] mb-2">
                      კლასი *
                    </label>
                    <select
                      name="grade"
                      required
                      value={formData.grade}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 md:text-[18px] text-[16px]"
                    >
                      {[5, 6, 7, 8, 9, 10, 11, 12].map(grade => (
                        <option key={grade} value={grade}>{grade} კლასი</option>
                      ))}
                    </select>
                  </div>

                  {/* Round */}
                  <div>
                    <label className="block text-sm font-medium text-black md:text-[18px] text-[16px] mb-2">
                      რაუნდი *
                    </label>
                    <select
                      name="round"
                      required
                      value={formData.round}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 md:text-[18px] text-[16px]"
                    >
                      <option value={1}>1 რაუნდი</option>
                      <option value={2}>2 რაუნდი</option>
                      <option value={3}>3 რაუნდი</option>
                    </select>
                  </div>

                  {/* Chapter */}
                  <div>
                    <label className="block text-sm font-medium text-black md:text-[18px] text-[16px] mb-2">
                      თავი
                    </label>
                    <select
                      name="chapterId"
                      value={formData.chapterId}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 md:text-[18px] text-[16px]"
                    >
                      <option value="">აირჩიეთ თავი</option>
                      {chapters.map(chapter => (
                        <option key={chapter.id} value={chapter.id}>{chapter.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Paragraph */}
                  <div>
                    <label className="block text-sm font-medium text-black md:text-[18px] text-[16px] mb-2">
                      პარაგრაფი
                    </label>
                    <select
                      name="paragraphId"
                      value={formData.paragraphId}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 md:text-[18px] text-[16px]"
                    >
                      <option value="">აირჩიეთ პარაგრაფი</option>
                      {paragraphs.map(paragraph => (
                        <option key={paragraph.id} value={paragraph.id}>{paragraph.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Image URL */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-black md:text-[18px] text-[16px] mb-2">
                      სურათის URL (არასავალდებულო)
                    </label>
                    <ImageUpload 
                      onChange={(urls) => setFormData(prev => ({ ...prev, image: urls[0] || '' }))}
                      value={formData.image ? [formData.image] : []}
                    />
                  </div>
                </div>

                {/* Options Section */}
                {formData.type === 'MULTIPLE_CHOICE' && (
                  <div className="border-t pt-6 bg-blue-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-lg font-bold text-black md:text-[18px] text-[16px]">
                         პასუხის ვარიანტები (ყველა პასუხი)
                      </h4>
                      <button
                        type="button"
                        onClick={handleAddOption}
                        disabled={formData.options.length >= 6}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-3 py-1 rounded text-sm font-medium"
                      >
                        ➕ ვარიანტის დამატება
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      {formData.options.map((option, index) => (
                        <div key={index} className="flex items-center space-x-3 bg-white p-3 rounded border">
                          <span className="text-sm font-medium text-gray-600 min-w-[80px]">
                            ვარიანტი {index + 1}:
                          </span>
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => handleOptionChange(index, e.target.value)}
                            placeholder={`შეიყვანეთ პასუხის ვარიანტი ${index + 1}...`}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 md:text-[18px] text-[16px]"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveOption(index)}
                            disabled={formData.options.length <= 2}
                            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-3 py-1 rounded text-sm font-medium"
                          >
                             წაშლა
                          </button>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-4 p-3 bg-yellow-100 rounded text-sm border-l-4 border-yellow-400">
                      <p className="font-medium text-yellow-800">💡 მნიშვნელოვანი:</p>
                      <p className="text-yellow-700">შეიყვანეთ ყველა პასუხის ვარიანტი (სწორი და არასწორი), შემდეგ აირჩიეთ სწორი პასუხი ქვემოთ</p>
                    </div>
                  </div>
                )}

                {formData.type === 'TRUE_FALSE' && (
                  <div className="border-t pt-6">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-lg font-medium text-black md:text-[18px] text-[16px]">
                        პასუხის ვარიანტები
                      </h4>
                      <button
                        type="button"
                        onClick={handleAddOption}
                        disabled={formData.options.length >= 6}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-3 py-1 rounded text-sm font-medium"
                      >
                        ვარიანტის დამატება
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      {formData.options.map((option, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => handleOptionChange(index, e.target.value)}
                            placeholder={`ვარიანტი ${index + 1}`}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 md:text-[18px] text-[16px]"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveOption(index)}
                            disabled={formData.options.length <= 2}
                            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-3 py-1 rounded text-sm font-medium"
                          >
                            წაშლა
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Correct Answer */}
                <div>
                  <label className="block text-sm font-medium text-black md:text-[18px] text-[16px] mb-2">
                    სწორი პასუხი *
                  </label>
                  {formData.type === 'TRUE_FALSE' ? (
                    <select
                      name="correctAnswer"
                      required
                      value={formData.correctAnswer}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 md:text-[18px] text-[16px]"
                    >
                      <option value="">აირჩიეთ პასუხი</option>
                      <option value="true">მართალი</option>
                      <option value="false">ცრუ</option>
                    </select>
                  ) : formData.type === 'MULTIPLE_CHOICE' ? (
                    <select
                      name="correctAnswer"
                      required
                      value={formData.correctAnswer}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 md:text-[18px] text-[16px]"
                    >
                      <option value="">აირჩიეთ სწორი პასუხი</option>
                      {formData.options.map((option, index) => (
                        <option key={index} value={option}>
                          {option || `ვარიანტი ${index + 1}`}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      name="correctAnswer"
                      required
                      value={formData.correctAnswer}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 md:text-[18px] text-[16px]"
                      placeholder="შეიყვანეთ სწორი პასუხი..."
                    />
                  )}
                </div>

                {/* Form Actions */}
                <div className="flex space-x-3 pt-6 border-t">
                  <button
                    type="submit"
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium md:text-[18px] text-[16px]"
                  >
                    {editingQuestion ? 'კითხვის განახლება' : 'კითხვის დამატება'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md font-medium md:text-[18px] text-[16px]"
                  >
                    გაუქმება
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              
              <h3 className="text-lg font-medium text-black md:text-[18px] text-[16px] mb-4 text-center">
                კითხვის წაშლა
              </h3>
              
              <div className="text-center mb-6">
                <p className="text-sm text-black md:text-[16px] text-[14px] mb-2">
                  <strong>ყურადღება!</strong> ეს მოქმედება შეუქცევადია.
                </p>
                <p className="text-sm text-black md:text-[16px] text-[14px]">
                  ნამდვილად გსურთ ამ კითხვის წაშლა?
                </p>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => deleteQuestion(deletingQuestionId!)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium md:text-[18px] text-[16px]"
                >
                  დიახ, წავშალოთ
                </button>
                <button
                  onClick={() => {
                    setShowDeleteModal(false)
                    setDeletingQuestionId(null)
                  }}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md font-medium md:text-[18px] text-[16px]"
                >
                  გაუქმება
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function AdminQuestionsPage() {
  return (
    <AdminOnly>
      <AdminQuestionsContent />
    </AdminOnly>
  )
}
