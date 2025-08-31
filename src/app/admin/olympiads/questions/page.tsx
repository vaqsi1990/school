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

interface Question {
  id: string
  text: string
  type: 'CLOSED_ENDED' | 'MATCHING' | 'TEXT_ANALYSIS' | 'MAP_ANALYSIS' | 'OPEN_ENDED'
  options: string[]
  correctAnswer?: string
  points: number
  maxPoints?: number
  image?: string
  matchingPairs?: Array<{ left: string, right: string }>
  subjectId: string
  chapterId?: string
  paragraphId?: string
  chapterName?: string
  paragraphName?: string
  grade: number
  round: number
  isAutoScored: boolean
  createdAt: string
}

function AdminQuestionsContent() {
  const { user } = useAuth()
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [activeTab, setActiveTab] = useState<'all' | 'multiple-choice' | 'matching' | 'text-analysis' | 'map-analysis' | 'open-ended' | 'closed-ended'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')
  const [selectedGrade, setSelectedGrade] = useState('')
  const [selectedRound, setSelectedRound] = useState('')
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletingQuestionId, setDeletingQuestionId] = useState<string | null>(null)
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(new Set())
  const [showPackageModal, setShowPackageModal] = useState(false)
  const [packageName, setPackageName] = useState('')

  // Form state
  const [formData, setFormData] = useState({
    text: '',
          type: 'CLOSED_ENDED' as 'CLOSED_ENDED' | 'MATCHING' | 'TEXT_ANALYSIS' | 'MAP_ANALYSIS' | 'OPEN_ENDED',
    options: ['', '', '', ''],
    correctAnswer: '',
    points: 1,
    maxPoints: 1,
    image: '',
    matchingPairs: [{ left: '', right: '' }],
    subjectId: '',
    chapterName: '',
    paragraphName: '',
    grade: 7,
    round: 1,
    isAutoScored: true
  })

  useEffect(() => {
    if (user) {
      fetchSubjects()
      fetchQuestions()
    }
  }, [user])

  // Remove the useEffect hooks for chapters and paragraphs since we're using text inputs now

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
      correctAnswer: question.correctAnswer || '',
      points: question.points,
      maxPoints: question.maxPoints || question.points,
      image: question.image || '',
      matchingPairs: question.matchingPairs || [{ left: '', right: '' }],
      subjectId: question.subjectId,
      chapterName: question.chapterName || '',
      paragraphName: question.paragraphName || '',
      grade: question.grade,
      round: question.round,
      isAutoScored: question.isAutoScored
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

  const handleMatchingPairChange = (index: number, field: 'left' | 'right', value: string) => {
    const newPairs = [...formData.matchingPairs]
    newPairs[index] = { ...newPairs[index], [field]: value }
    setFormData(prev => ({
      ...prev,
      matchingPairs: newPairs
    }))
  }

  const handleAddMatchingPair = () => {
    setFormData(prev => ({
      ...prev,
      matchingPairs: [...prev.matchingPairs, { left: '', right: '' }]
    }))
  }

  const handleRemoveMatchingPair = (index: number) => {
    if (formData.matchingPairs.length > 1) {
      const newPairs = formData.matchingPairs.filter((_, i) => i !== index)
      setFormData(prev => ({
        ...prev,
        matchingPairs: newPairs
      }))
    }
  }

  const handleQuestionTypeChange = (type: string) => {
    const isAutoScored = ['MATCHING'].includes(type)
    setFormData(prev => ({
      ...prev,
              type: type as 'CLOSED_ENDED' | 'MATCHING' | 'TEXT_ANALYSIS' | 'MAP_ANALYSIS' | 'OPEN_ENDED',
      isAutoScored,
      maxPoints: isAutoScored ? prev.points : prev.maxPoints
    }))
  }

  const getQuestionTypeLabel = (type: string) => {
    const labels = {
      'CLOSED_ENDED': 'დახურული კითხვა',
      'MATCHING': 'შესაბამისობა',
      'TEXT_ANALYSIS': 'ტექსტის ანალიზი',
      'MAP_ANALYSIS': 'რუკის ანალიზი',
      'OPEN_ENDED': 'ღია კითხვა',
    }
    return labels[type as keyof typeof labels] || type
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
      type: 'CLOSED_ENDED',
      options: ['', '', '', ''],
      correctAnswer: '',
      points: 1,
      maxPoints: 1,
      image: '',
      matchingPairs: [{ left: '', right: '' }],
      subjectId: '',
      chapterName: '',
      paragraphName: '',
      grade: 7,
      round: 1,
      isAutoScored: true
    })
    setEditingQuestion(null)
  }

  const handleQuestionSelect = (questionId: string) => {
    setSelectedQuestions(prev => {
      const newSet = new Set(prev)
      if (newSet.has(questionId)) {
        newSet.delete(questionId)
      } else {
        newSet.add(questionId)
      }
      return newSet
    })
  }

  const handleSelectAll = () => {
    if (selectedQuestions.size === filteredQuestions.length) {
      setSelectedQuestions(new Set())
    } else {
      setSelectedQuestions(new Set(filteredQuestions.map(q => q.id)))
    }
  }

  const createPackage = async () => {
    if (!packageName.trim() || selectedQuestions.size === 0) {
      alert('გთხოვთ შეიყვანოთ პაკეტის სახელი და აირჩიოთ კითხვები')
      return
    }

    try {
      const response = await fetch('/api/admin/question-packages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: packageName,
          questionIds: Array.from(selectedQuestions),
          description: `პაკეტი შეიქმნა ${new Date().toLocaleDateString('ka-GE')}`
        }),
      })

      if (response.ok) {
        alert(`პაკეტი "${packageName}" წარმატებით შეიქმნა!`)
        setPackageName('')
        setSelectedQuestions(new Set())
        setShowPackageModal(false)
      } else {
        const error = await response.json()
        alert(`შეცდომა: ${error.message}`)
      }
    } catch (error) {
      console.error('Error creating package:', error)
      alert('სისტემური შეცდომა მოხდა')
    }
  }

  const filteredQuestions = questions.filter(question => {
    if (!searchTerm.trim()) return true
    
    const searchLower = searchTerm.toLowerCase().trim()
    
    // Simple and robust search across all fields
    const matchesSearch =
      // Question text
      question.text.toLowerCase().includes(searchLower) ||
      
      // Subject name
      (subjects.find(s => s.id === question.subjectId)?.name || '').toLowerCase().includes(searchLower) ||
      
      // Chapter name (handle "თავი 2" and "2")
      (question.chapterName && (
        question.chapterName.toLowerCase().includes(searchLower) ||
        searchLower.includes(question.chapterName.toLowerCase())
      )) ||
      
      // Paragraph name (handle "პარაგრაფი 1.2" and "1.2")
      (question.paragraphName && (
        question.paragraphName.toLowerCase().includes(searchLower) ||
        searchLower.includes(question.paragraphName.toLowerCase())
      )) ||
      
      // Grade (handle "10", "10 კლასი", "კლასი 10")
      question.grade.toString().includes(searchLower) ||
      (searchLower.includes('კლასი') && question.grade.toString().includes(searchLower.replace('კლასი', '').trim())) ||
      
      // Round (handle "1", "1 რაუნდი", "რაუნდი 1")
      question.round.toString().includes(searchLower) ||
      (searchLower.includes('რაუნდი') && question.round.toString().includes(searchLower.replace('რაუნდი', '').trim())) ||
      
      // Question type
      question.type.toLowerCase().includes(searchLower) ||
      getQuestionTypeLabel(question.type).toLowerCase().includes(searchLower) ||
      
      // Points
      question.points.toString().includes(searchLower)

    // Debug logging
    if (searchTerm.trim()) {
      console.log(`Searching for: "${searchLower}"`)
      console.log(`Question: "${question.text.substring(0, 50)}..."`)
      console.log(`Matches: ${matchesSearch}`)
      console.log(`Grade: ${question.grade}, Round: ${question.round}`)
      console.log(`Chapter: ${question.chapterName}, Paragraph: ${question.paragraphName}`)
      console.log('---')
    }

    // Fix tab filtering logic - remove duplicate case
    let matchesType = true
    if (activeTab !== 'all') {
      switch (activeTab) {
        case 'closed-ended':
          matchesType = question.type === 'CLOSED_ENDED'
          break
        case 'matching':
          matchesType = question.type === 'MATCHING'
          break
        case 'text-analysis':
          matchesType = question.type === 'TEXT_ANALYSIS'
          break
        case 'map-analysis':
          matchesType = question.type === 'MAP_ANALYSIS'
          break
        case 'open-ended':
          matchesType = question.type === 'OPEN_ENDED'
          break
        default:
          matchesType = true
      }
    }

    const matchesSubject = !selectedSubject || question.subjectId === selectedSubject
    const matchesGrade = !selectedGrade || question.grade === parseInt(selectedGrade)
    const matchesRound = !selectedRound || question.round === parseInt(selectedRound)

    return matchesSearch && matchesType && matchesSubject && matchesGrade && matchesRound
  })



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
              {selectedQuestions.size > 0 && (
                <>
                  <button
                    onClick={() => setShowPackageModal(true)}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md md:text-[18px] text-[16px] font-bold"
                  >
                    პაკეტის შექმნა ({selectedQuestions.size})
                  </button>
                  <button
                    onClick={() => setSelectedQuestions(new Set())}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md md:text-[18px] text-[16px] font-bold"
                  >
                    გაწმენდა
                  </button>
                </>
              )}
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
              <div className="relative">
                                 <input
                   type="text"
                   placeholder="მოძებნა: კითხვა, საგანი, თავი (მაგ: 2), პარაგრაფი (მაგ: 1.2), კლასი (მაგ: 10 კლასი), რაუნდი (მაგ: 1 რაუნდი), ქულები, ტიპი..."
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2  md:text-[18px] text-[16px]"
                 />
                 {searchTerm && (
                   <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                     {filteredQuestions.length} / {questions.length}
                   </div>
                 )}
                
               </div>
            </div>
            <div>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2  md:text-[18px] text-[16px]"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2  md:text-[18px] text-[16px]"
              >
                <option value="">ყველა კლასი</option>
                {[7, 8, 9, 10, 11, 12].map(grade => (
                  <option key={grade} value={grade}>{grade} კლასი</option>
                ))}
              </select>
            </div>
            <div>
              <select
                value={selectedRound}
                onChange={(e) => setSelectedRound(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2  md:text-[18px] text-[16px]"
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
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-md font-medium md:text-[18px] text-[16px] ${activeTab === 'all'
                  ? 'bg-[#034e64] text-white'
                  : 'bg-gray-200 text-black hover:bg-gray-300'
                }`}
            >
              ყველა ({questions.length})
            </button>
            <button
              onClick={() => setActiveTab('closed-ended')}
              className={`px-4 py-2 rounded-md font-medium md:text-[18px] text-[16px] ${activeTab === 'closed-ended'
                  ? 'bg-[#034e64] text-white'
                  : 'bg-gray-200 text-black hover:bg-gray-300'
                }`}
            >
              დახურული კითხვები ({questions.filter(q => q.type === 'CLOSED_ENDED').length})
            </button>

            <button
              onClick={() => setActiveTab('matching')}
              className={`px-4 py-2 rounded-md font-medium md:text-[18px] text-[16px] ${activeTab === 'matching'
                  ? 'bg-[#034e64] text-white'
                  : 'bg-gray-200 text-black hover:bg-gray-300'
                }`}
            >
              შესაბამისობა ({questions.filter(q => q.type === 'MATCHING').length})
            </button>
            <button
              onClick={() => setActiveTab('text-analysis')}
              className={`px-4 py-2 rounded-md font-medium md:text-[18px] text-[16px] ${activeTab === 'text-analysis'
                  ? 'bg-[#034e64] text-white'
                  : 'bg-gray-200 text-black hover:bg-gray-300'
                }`}
            >
              ტექსტის ანალიზი ({questions.filter(q => q.type === 'TEXT_ANALYSIS').length})
            </button>
            <button
              onClick={() => setActiveTab('map-analysis')}
              className={`px-4 py-2 rounded-md font-medium md:text-[18px] text-[16px] ${activeTab === 'map-analysis'
                  ? 'bg-[#034e64] text-white'
                  : 'bg-gray-200 text-black hover:bg-gray-300'
                }`}
            >
              რუკის ანალიზი ({questions.filter(q => q.type === 'MAP_ANALYSIS').length})
            </button>
            <button
              onClick={() => setActiveTab('open-ended')}
              className={`px-4 py-2 rounded-md font-medium md:text-[18px] text-[16px] ${activeTab === 'open-ended'
                  ? 'bg-[#034e64] text-white'
                  : 'bg-gray-300 text-black hover:bg-gray-400'
                }`}
            >
              ღია კითხვა ({questions.filter(q => q.type === 'OPEN_ENDED').length})
            </button>

          </div>
        </div>

        {/* Questions List */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-[15px] font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedQuestions.size === filteredQuestions.length && filteredQuestions.length > 0}
                        onChange={handleSelectAll}
                        className="h-4 w-4 text-blue-600  border-gray-300 rounded"
                      />
                      {selectedQuestions.size > 0 && (
                        <span className="text-xs text-blue-600 font-medium">
                          {selectedQuestions.size} არჩეული
                        </span>
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-[16px] font-bold text-black uppercase tracking-wider">
                    კითხვა
                  </th>
                  <th className="px-6 py-3 text-left text-[16px] font-bold text-black uppercase tracking-wider">
                    ტიპი
                  </th>
                  <th className="px-6 py-3 text-left text-[16px] font-bold text-black uppercase tracking-wider">
                    საგანი
                  </th>
                  <th className="px-6 py-3 text-left text-[16px] font-bold text-black uppercase tracking-wider">
                    თავი
                  </th>
                  <th className="px-6 py-3 text-left text-[16px] font-bold text-black uppercase tracking-wider">
                    პარაგრაფი
                  </th>
                  <th className="px-6 py-3 text-left text-[16px] font-bold text-black uppercase tracking-wider">
                    კლასი
                  </th>
                  <th className="px-6 py-3 text-left text-[16px] font-bold text-black uppercase tracking-wider">
                    რაუნდი
                  </th>
                  <th className="px-6 py-3 text-left text-[16px] font-bold text-black uppercase tracking-wider">
                    ქულები
                  </th>
                  <th className="px-6 py-3 text-left text-[16px] font-bold text-black uppercase tracking-wider">
                    მოქმედებები
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredQuestions.map((question) => (
                  <tr key={question.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedQuestions.has(question.id)}
                        onChange={() => handleQuestionSelect(question.id)}
                        className="h-4 w-4 text-blue-600  border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <div className="text-sm font-medium text-black md:text-[18px] text-[16px]">
                          {question.text.length > 100 ? `${question.text.substring(0, 100)}...` : question.text}
                        </div>
                        {question.image && (
                          <div className="text-xs text-gray-500 mt-1"> სურათი არის</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-[16px] font-normal rounded-full ${question.type === 'CLOSED_ENDED' ? ' text-black' :

                          question.type === 'MATCHING' ? 'text-black' :
                            question.type === 'TEXT_ANALYSIS' ? 'text-black' :
                              question.type === 'MAP_ANALYSIS' ? 'text-black' :
                                question.type === 'OPEN_ENDED' ? 'text-black' :
                                  question.type === 'CLOSED_ENDED' ? 'text-black' :
                                    'text-black'
                        }`}>
                        {getQuestionTypeLabel(question.type)}
                      </span>
                     
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap  text-black md:text-[16px] text-[16px]">
                      {subjects.find(s => s.id === question.subjectId)?.name || 'უცნობი'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap  text-black md:text-[16px] text-[16px]">
                      {question.chapterName || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap  text-black md:text-[16px] text-[16px]">
                      {question.paragraphName || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap  text-black md:text-[16px] text-[16px]">
                      {question.grade} კლასი
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap  text-black md:text-[16px] text-[16px]">
                      {question.round} რაუნდი
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap  text-black md:text-[16px] text-[16px]">
                      {question.points}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap  text-black md:text-[16px] text-[16px]">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => editQuestion(question)}
                          className="bg-[#feb931] text-[16px] hover:bg-[#feb931] text-white px-3 py-1 rounded text-xs font-medium"
                        >
                          რედაქტირება
                        </button>
                        <button
                          onClick={() => openDeleteModal(question.id)}
                          className="bg-red-600 text-[16px] hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-medium"
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
                  {/* Question Type */}
                  <div>
                    <label className="block  font-medium text-black md:text-[18px] text-[16px] mb-2">
                      კითხვის ტიპი *
                    </label>
                    <select
                      name="type"
                      required
                      value={formData.type}
                      onChange={(e) => handleQuestionTypeChange(e.target.value)}
                      className="w-full px-4 text-black placeholder:text-black py-[11px] border border-gray-300 rounded-md focus:outline-none focus:ring-2  md:text-[18px] text-[16px]"
                    >
                      <option className='text-black placeholder:text-black'  value="CLOSED_ENDED">დახურული კითხვა (ხელით)</option>
                      <option className='text-black placeholder:text-black'  value="MATCHING">შესაბამისობა (ავტომატური)</option>
                      <option className='text-black placeholder:text-black'  value="TEXT_ANALYSIS">ტექსტის ანალიზი (ხელით)</option>
                      <option  className='text-black placeholder:text-black' value="MAP_ANALYSIS">რუკის ანალიზი (ხელით)</option>
                      <option className='text-black placeholder:text-black'  value="OPEN_ENDED">ღია კითხვა (ხელით)</option>
                    </select>
                  </div>
                  {/* Question Text */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-black md:text-[18px] text-[16px] mb-2">
                      {formData.type === 'TEXT_ANALYSIS' ? 'ტექსტი *' : 
                       formData.type === 'MAP_ANALYSIS' ? 'რუკის აღწერა *' : 
                       'კითხვის ტექსტი *'}
                    </label>
                    <textarea
                      name="text"
                      required
                      value={formData.text}
                      onChange={handleInputChange}
                      rows={formData.type === 'TEXT_ANALYSIS' || formData.type === 'MAP_ANALYSIS' ? 6 : 4}
                      className="w-full text-black placeholder:text-black px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2  md:text-[18px] text-[16px]"
                      placeholder={formData.type === 'TEXT_ANALYSIS' ? 'შეიყვანეთ ანალიზის ტექსტი...' : 
                                   formData.type === 'MAP_ANALYSIS' ? 'შეიყვანეთ რუკის აღწერა...' : 
                                   'შეიყვანეთ კითხვის ტექსტი...'}
                    />
                  </div>



                  {/* Points */}
                  <div>
                    <label className="block  font-medium text-black md:text-[18px] text-[16px] mb-2">
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
                      className="w-full px-3 py-2 text-black placeholder:text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2  md:text-[18px] text-[16px]"
                    />
                  </div>

                  {/* Max Points for Manual Scoring */}
                  {!formData.isAutoScored && (
                    <div>
                      <label className="block  font-medium text-black md:text-[18px] text-[16px] mb-2">
                        მაქსიმალური ქულები *
                      </label>
                      <input
                        type="number"
                        name="maxPoints"
                        required
                        min="1"
                        max="20"
                        step="0.5"
                        value={formData.maxPoints}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 text-black placeholder:text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2  md:text-[18px] text-[16px]"
                        placeholder="მაგ: 2.5"
                      />
                    </div>
                  )}

                  {/* Subject */}
                  <div>
                    <label className="block  font-medium text-black md:text-[18px] text-[16px] mb-2">
                      საგანი *
                    </label>
                    <select
                      name="subjectId"
                      required
                      value={formData.subjectId}
                      onChange={handleInputChange}
                      className="w-full px-4 text-black placeholder:text-black py-[11px] border border-gray-300 rounded-md focus:outline-none focus:ring-2  md:text-[18px] text-[16px]"
                    >
                      <option value="">აირჩიეთ საგანი</option>
                      {subjects.map(subject => (
                        <option key={subject.id} className='text-black placeholder:text-black' value={subject.id}>{subject.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Grade */}
                  <div>
                    <label className="block  font-medium text-black md:text-[18px] text-[16px] mb-2">
                      კლასი *
                    </label>
                    <select
                      name="grade"
                      required
                      value={formData.grade}
                      onChange={handleInputChange}
                      className="w-full px-4 text-black placeholder:text-black py-[11px] border border-gray-300 rounded-md focus:outline-none focus:ring-2  md:text-[18px] text-[16px]"
                    >
                      {[7, 8, 9, 10, 11, 12].map(grade => (
                        <option key={grade} className='text-black placeholder:text-black' value={grade}>{grade} კლასი</option>
                      ))}
                    </select>
                  </div>

                  {/* Round */}
                  <div>
                    <label className="block  font-medium text-black md:text-[18px] text-[16px] mb-2">
                      რაუნდი *
                    </label>
                    <select
                      name="round"
                      required
                      value={formData.round}
                      onChange={handleInputChange}
                      className="w-full px-4 text-black placeholder:text-black py-[14px] border border-gray-300 rounded-md focus:outline-none focus:ring-2  md:text-[18px] text-[16px]"
                    >
                      <option value={1} className='text-black placeholder:text-black'>1 რაუნდი</option>
                      <option value={2} className='text-black placeholder:text-black'>2 რაუნდი</option>
                      <option value={3} className='text-black placeholder:text-black'>3 რაუნდი</option>
                    </select>
                  </div>

                  {/* Chapter */}
                  <div>
                    <label className="block  font-medium text-black md:text-[18px] text-[16px] mb-2">
                      თავი
                    </label>
                    <input
                      type="text"
                      name="chapterName"
                      value={formData.chapterName}
                      onChange={handleInputChange}
                      className="w-full px-4 text-black placeholder:text-black py-[11px] border border-gray-300 rounded-md focus:outline-none focus:ring-2  md:text-[18px] text-[16px]"
                      placeholder="შეიყვანეთ თავის სახელი..."
                    />
                  </div>

                  {/* Paragraph */}
                  <div>
                    <label className="block  font-medium text-black md:text-[18px] text-[16px] mb-2">
                      პარაგრაფი
                    </label>
                    <input
                      type="text"
                      name="paragraphName"
                      value={formData.paragraphName}
                      onChange={handleInputChange}
                      className="w-full px-4 text-black placeholder:text-black py-[11px] border border-gray-300 rounded-md focus:outline-none focus:ring-2  md:text-[18px] text-[16px]"
                      placeholder="შეიყვანეთ პარაგრაფის სახელი..."
                    />
                  </div>

                  {/* Image URL */}
                  <div className="md:col-span-2">
                    <label className="block  font-medium text-black md:text-[18px] text-[16px] mb-2">
                      სურათის URL (არასავალდებულო)
                    </label>
                    <ImageUpload
                      onChange={(urls) => setFormData(prev => ({ ...prev, image: urls[0] || '' }))}
                      value={formData.image ? [formData.image] : []}
                    />
                  </div>

                  
                </div>

                {/* Options Section */}
                                  {formData.type === 'CLOSED_ENDED' && (
                  <div className=" pt-6 bg-blue-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-lg font-bold text-black md:text-[18px] text-[16px]">
                        პასუხის ვარიანტები (ყველა პასუხი)
                      </h4>
                      <button
                        type="button"
                        onClick={handleAddOption}
                        disabled={formData.options.length >= 6}
                        className="bg-blue-600  hover:bg-blue-700 disabled:bg-gray-400 text-white px-3 py-1 rounded text-[16px] font-medium"
                      >
                        ვარიანტის დამატება
                      </button>
                    </div>

                    <div className="space-y-3">
                      {formData.options.map((option, index) => (
                        <div key={index} className="flex items-center space-x-3 bg-white p-3 rounded border">
                          <span className="text-[18px] font-medium text-black placeholder:text-black min-w-[80px]">
                            ვარიანტი {index + 1}:
                          </span>
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => handleOptionChange(index, e.target.value)}
                            placeholder={`შეიყვანეთ პასუხის ვარიანტი ${index + 1}...`}
                            className="flex-1 px-3 py-2 border text-black placeholder:text-black border-gray-300 rounded-md focus:outline-none focus:ring-2  md:text-[18px] text-[16px]"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveOption(index)}
                            disabled={formData.options.length <= 2}
                            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-3 py-1 rounded text-[16px] font-medium"
                          >
                            წაშლა
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 p-3 bg-yellow-100 rounded text-sm border-l-4 border-yellow-400">
                      <p className="font-medium text-yellow-800"> მნიშვნელოვანი:</p>
                      <p className="text-yellow-700">შეიყვანეთ ყველა პასუხის ვარიანტი (სწორი და არასწორი), შემდეგ აირჩიეთ სწორი პასუხი ქვემოთ</p>
                    </div>
                  </div>
                )}



                {formData.type === 'MATCHING' && (
                  <div className=" pt-6 bg-green-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-lg font-bold text-black md:text-[18px] text-[16px]">
                        შესაბამისობის წყვილები
                      </h4>
                      <button
                        type="button"
                        onClick={handleAddMatchingPair}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-[16px] font-medium"
                      >
                        წყვილის დამატება
                      </button>
                    </div>

                    <div className="space-y-3">
                      {formData.matchingPairs.map((pair, index) => (
                        <div key={index} className="flex items-center space-x-3 bg-white p-3 rounded border">
                          <span className="text-sm font-medium text-gray-600 min-w-[60px]">
                            {String.fromCharCode(65 + index)}:
                          </span>
                          <input
                            type="text"
                            value={pair.left}
                            onChange={(e) => handleMatchingPairChange(index, 'left', e.target.value)}
                            placeholder="მარცხენა მხარე..."
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2  md:text-[18px] text-[16px]"
                          />
                          <span className="text-gray-500">→</span>
                          <input
                            type="text"
                            value={pair.right}
                            onChange={(e) => handleMatchingPairChange(index, 'right', e.target.value)}
                            placeholder="მარჯვენა მხარე..."
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2  md:text-[18px] text-[16px]"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveMatchingPair(index)}
                            disabled={formData.matchingPairs.length <= 1}
                            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-3 py-1 rounded text-[16px] font-medium"
                          >
                            წაშლა
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 p-3 bg-green-100 rounded text-sm border-l-4 border-green-400">
                      <p className="font-medium text-green-800">💡 მნიშვნელოვანი:</p>
                      <p className="text-green-700">შეიყვანეთ შესაბამისობის წყვილები (მაგ: A→1, B→2, C→3)</p>
                    </div>
                  </div>
                )}

              
                {/* Correct Answer - Only for Auto-scored Questions */}
                {formData.isAutoScored && (
                  <div>
                    <label className="block text-sm font-medium text-black md:text-[18px] text-[16px] mb-2">
                      სწორი პასუხი *
                    </label>
                    {formData.type === 'CLOSED_ENDED' ? (
                      <select
                        name="correctAnswer"
                        required
                        value={formData.correctAnswer}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2  md:text-[18px] text-[16px]"
                      >
                        <option value="">აირჩიეთ სწორი პასუხი</option>
                        {formData.options.map((option, index) => (
                          <option key={index} value={option}>
                            {option || `ვარიანტი ${index + 1}`}
                          </option>
                        ))}
                      </select>
                    ) : formData.type === 'MATCHING' ? (
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">შესაბამისობის წყვილები ავტომატურად გაითვლება სწორად</p>
                        <input
                          type="hidden"
                          name="correctAnswer"
                          value="matching"
                        />
                      </div>
                    ) : (
                      <input
                        type="text"
                        name="correctAnswer"
                        required
                        value={formData.correctAnswer}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2  md:text-[18px] text-[16px]"
                        placeholder="შეიყვანეთ სწორი პასუხი..."
                      />
                    )}
                  </div>
                )}

                {/* Manual Scoring Notice */}
                {!formData.isAutoScored && (
                  <div className=" pt-6 bg-orange-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-orange-600 text-xl">⚠️</span>
                      <h4 className="text-lg font-bold text-orange-800 md:text-[18px] text-[16px]">
                        ხელით შეფასება
                      </h4>
                    </div>
                    <p className="text-orange-700 md:text-[16px] text-[14px]">
                      ეს კითხვა საჭიროებს ხელით შეფასებას. სისტემა ავტომატურად ვერ გაითვლის ქულას.
                      გამსწორებელი/მასწავლებელი ხელით მიანიჭებს ქულას შეფასების კრიტერიუმების მიხედვით.
                    </p>
                  </div>
                )}

                {/* Form Actions */}
                <div className="flex space-x-3 pt-6 border-t">
                  <button
                    type="submit"
                    className="flex-1 bg-[#034e64] cursor-pointer text-white px-4 py-2 rounded-md font-bold md:text-[20px] text-[18px]"
                  >
                    {editingQuestion ? 'კითხვის განახლება' : 'კითხვის დამატება'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 bg-red-600 hover:bg-red-700 cursor-pointer text-white px-4 py-2 rounded-md font-bold md:text-[20px] text-[18px]"
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

      {/* Package Creation Modal */}
      {showPackageModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-purple-100 mb-4">
                <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>

              <h3 className="text-lg font-medium text-black md:text-[18px] text-[16px] mb-4 text-center">
                პაკეტის შექმნა
              </h3>

              <div className="mb-6">
                <label className="block text-sm font-medium text-black md:text-[16px] text-[14px] mb-2">
                  პაკეტის სახელი *
                </label>
                <input
                  type="text"
                  value={packageName}
                  onChange={(e) => setPackageName(e.target.value)}
                  placeholder="შეიყვანეთ პაკეტის სახელი..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 md:text-[16px] text-[14px]"
                />
              </div>

              <div className="text-center mb-6">
                <p className="text-sm text-black md:text-[16px] text-[14px] mb-2">
                  <strong>შერჩეული კითხვები:</strong> {selectedQuestions.size}
                </p>
                <p className="text-sm text-black md:text-[16px] text-[14px]">
                  ეს კითხვები შევა პაკეტში
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={createPackage}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md font-medium md:text-[16px] text-[14px]"
                >
                  პაკეტის შექმნა
                </button>
                <button
                  onClick={() => {
                    setShowPackageModal(false)
                    setPackageName('')
                  }}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md font-medium md:text-[16px] text-[14px]"
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
