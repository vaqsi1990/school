'use client'

import { AdminOnly } from '@/components/auth/ProtectedRoute'
import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'react-hot-toast'
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
  imageOptions?: string[]
  correctAnswer?: string
  points: number
  maxPoints?: number
  image?: string
  matchingPairs?: Array<{ left: string, leftImage?: string, right: string, rightImage?: string }>
  subjectId: string
  subject?: {
    id: string
    name: string
  }
  chapterName?: string
  paragraphName?: string
  grade: number
  round: number
  isAutoScored: boolean
  createdByTeacher?: {
    name: string
    lastname: string
    subject: string
    school: string
  }
}

interface SubQuestion {
  id: string
  text: string
  type: 'CLOSED_ENDED' | 'OPEN_ENDED'
  options?: string[]
  correctAnswer?: string
  points: number
  maxPoints?: number
  isAutoScored: boolean
  image?: string
}

function EditTeacherQuestionContent({ questionId }: { questionId: string }) {
  const router = useRouter()
  const [question, setQuestion] = useState<Question | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [subjects, setSubjects] = useState<Subject[]>([])

  // Form state
  const [formData, setFormData] = useState<{
    text: string
    type: 'CLOSED_ENDED' | 'MATCHING' | 'TEXT_ANALYSIS' | 'MAP_ANALYSIS' | 'OPEN_ENDED'
    options: string[]
    imageOptions: string[]
    useImageOptions: boolean
    correctAnswer: string
    points: number
    maxPoints: number
    image: string
    matchingPairs: Array<{ left: string, leftImage?: string, right: string, rightImage?: string }>
    subjectId: string
    chapterName: string
    paragraphName: string
    grade: number
    round: number
    isAutoScored: boolean
    subQuestions: SubQuestion[]
  }>({
    text: '',
    type: 'CLOSED_ENDED',
    options: ['', '', '', ''],
    imageOptions: ['', '', '', ''],
    useImageOptions: false,
    correctAnswer: '',
    points: 1,
    maxPoints: 1,
    image: '',
    matchingPairs: [{ left: '', leftImage: undefined, right: '', rightImage: undefined }],
    subjectId: '',
    chapterName: '',
    paragraphName: '',
    grade: 7,
    round: 1,
    isAutoScored: false,
    subQuestions: []
  })

  useEffect(() => {
    fetchQuestion()
    fetchSubjects()
  }, [questionId])

  const fetchQuestion = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/teacher-questions/${questionId}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch question')
      }

      const data = await response.json()
      const questionData = data.question

      setQuestion(questionData)
      setFormData({
        text: questionData.text,
        type: questionData.type as 'CLOSED_ENDED' | 'MATCHING' | 'TEXT_ANALYSIS' | 'MAP_ANALYSIS' | 'OPEN_ENDED',
        options: questionData.options || ['', '', '', ''],
        imageOptions: questionData.imageOptions || ['', '', '', ''],
        useImageOptions: !!(questionData.imageOptions && questionData.imageOptions.length > 0 && questionData.imageOptions.some((img: string) => img !== '')),
        correctAnswer: questionData.correctAnswer || '',
        points: questionData.points,
        maxPoints: questionData.maxPoints || questionData.points,
        image: questionData.image || '',
        matchingPairs: questionData.matchingPairs?.map((pair: any) => ({
          left: pair.left,
          leftImage: pair.leftImage,
          right: pair.right,
          rightImage: pair.rightImage
        })) || [{ left: '', leftImage: undefined, right: '', rightImage: undefined }],
        subjectId: questionData.subjectId,
        chapterName: questionData.chapterName || '',
        paragraphName: questionData.paragraphName || '',
        grade: questionData.grade,
        round: questionData.round,
        isAutoScored: questionData.isAutoScored,
        subQuestions: questionData.subQuestions || []
      })
    } catch (error) {
      console.error('Error fetching question:', error)
      toast.error('კითხვის ჩატვირთვისას შეცდომა მოხდა')
    } finally {
      setLoading(false)
    }
  }

  const fetchSubjects = async () => {
    try {
      const response = await fetch('/api/subjects')
      if (response.ok) {
        const data = await response.json()
        setSubjects(data.subjects)
      }
    } catch (error) {
      console.error('Error fetching subjects:', error)
    }
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

  const handleImageOptionChange = (index: number, value: string) => {
    const newImageOptions = [...formData.imageOptions]
    newImageOptions[index] = value
    setFormData(prev => ({
      ...prev,
      imageOptions: newImageOptions
    }))
  }

  const handleAddImageOption = () => {
    if (formData.imageOptions.length < 6) {
      setFormData(prev => ({
        ...prev,
        imageOptions: [...prev.imageOptions, '']
      }))
    }
  }

  const handleRemoveImageOption = (index: number) => {
    if (formData.imageOptions.length > 2) {
      const newImageOptions = formData.imageOptions.filter((_, i) => i !== index)
      setFormData(prev => ({
        ...prev,
        imageOptions: newImageOptions
      }))
    }
  }

  const handleMatchingPairChange = (index: number, field: 'left' | 'right' | 'leftImage' | 'rightImage', value: string) => {
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
      matchingPairs: [...prev.matchingPairs, { left: '', leftImage: undefined, right: '', rightImage: undefined }]
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

  // Sub-questions functions
  const handleAddSubQuestion = () => {
    const newSubQuestion: SubQuestion = {
      id: `temp-${Date.now()}`,
      text: '',
      type: 'CLOSED_ENDED',
      options: ['', '', '', ''],
      correctAnswer: '',
      points: 1,
      maxPoints: 1,
      isAutoScored: true,
      image: ''
    }
    
    setFormData(prev => ({
      ...prev,
      subQuestions: [...prev.subQuestions, newSubQuestion]
    }))
  }

  const handleRemoveSubQuestion = (index: number) => {
    setFormData(prev => ({
      ...prev,
      subQuestions: prev.subQuestions.filter((_, i) => i !== index)
    }))
  }

  const handleSubQuestionChange = (index: number, field: keyof SubQuestion, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      subQuestions: prev.subQuestions.map((sq, i) => 
        i === index ? { ...sq, [field]: value } : sq
      )
    }))
  }

  const handleSubQuestionOptionChange = (subQuestionIndex: number, optionIndex: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      subQuestions: prev.subQuestions.map((sq, i) => 
        i === subQuestionIndex 
          ? { 
              ...sq, 
              options: sq.options?.map((opt, j) => j === optionIndex ? value : opt) || []
            }
          : sq
      )
    }))
  }

  const handleAddSubQuestionOption = (subQuestionIndex: number) => {
    setFormData(prev => ({
      ...prev,
      subQuestions: prev.subQuestions.map((sq, i) => 
        i === subQuestionIndex 
          ? { 
              ...sq, 
              options: [...(sq.options || []), '']
            }
          : sq
      )
    }))
  }

  const handleRemoveSubQuestionOption = (subQuestionIndex: number, optionIndex: number) => {
    setFormData(prev => ({
      ...prev,
      subQuestions: prev.subQuestions.map((sq, i) => 
        i === subQuestionIndex 
          ? { 
              ...sq, 
              options: sq.options?.filter((_, j) => j !== optionIndex) || []
            }
          : sq
      )
    }))
  }

  const handleQuestionTypeChange = (type: string) => {
    const isAutoScored = ['MATCHING'].includes(type)
    setFormData(prev => ({
      ...prev,
      type: type as 'CLOSED_ENDED' | 'MATCHING' | 'TEXT_ANALYSIS' | 'MAP_ANALYSIS' | 'OPEN_ENDED',
      isAutoScored,
      maxPoints: isAutoScored ? prev.points : prev.maxPoints,
      correctAnswer: type === 'MATCHING' ? 'matching' : prev.correctAnswer,
      subQuestions: (type === 'TEXT_ANALYSIS' || type === 'MAP_ANALYSIS') ? prev.subQuestions : []
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
      // Validate that TEXT_ANALYSIS and MAP_ANALYSIS questions have sub-questions
      if ((formData.type === 'TEXT_ANALYSIS' || formData.type === 'MAP_ANALYSIS') && 
          (!formData.subQuestions || formData.subQuestions.length === 0)) {
        toast.error('ტექსტის ანალიზის და რუკის ანალიზის კითხვებს უნდა ჰქონდეთ მინიმუმ ერთი ქვეკითხვა')
        return
      }

      // Validate MATCHING questions
      if (formData.type === 'MATCHING') {
        if (!formData.matchingPairs || formData.matchingPairs.length === 0) {
          toast.error('შესაბამისობის კითხვებს უნდა ჰქონდეთ მინიმუმ ერთი წყვილი')
          return
        }
        
        for (let i = 0; i < formData.matchingPairs.length; i++) {
          const pair = formData.matchingPairs[i]
          if (!pair.left.trim() || !pair.right.trim()) {
            toast.error(`შესაბამისობის წყვილი ${i + 1} უნდა ჰქონდეს მარცხენა და მარჯვენა მნიშვნელობები`)
            return
          }
        }
      }

      // Validate sub-questions if they exist
      if (formData.subQuestions && formData.subQuestions.length > 0) {
        for (let i = 0; i < formData.subQuestions.length; i++) {
          const sq = formData.subQuestions[i]
          if (!sq.text.trim()) {
            toast.error(`ქვეკითხვა ${i + 1} უნდა ჰქონდეს ტექსტი`)
            return
          }
          if (sq.points < 1 || sq.points > 10) {
            toast.error(`ქვეკითხვა ${i + 1} უნდა ჰქონდეს ქულები 1-დან 10-მდე`)
            return
          }
          
          if (sq.type === 'CLOSED_ENDED' && sq.isAutoScored) {
            if (!sq.options || sq.options.filter(opt => opt.trim()).length < 2) {
              toast.error(`ქვეკითხვა ${i + 1} უნდა ჰქონდეს მინიმუმ 2 პასუხის ვარიანტი ავტომატური შეფასებისთვის`)
              return
            }
            if (!sq.correctAnswer || sq.correctAnswer.trim() === '') {
              toast.error(`ქვეკითხვა ${i + 1} უნდა ჰქონდეს სწორი პასუხი ავტომატური შეფასებისთვის`)
              return
            }
          }
        }
      }

      // Validate auto-scored questions
      if (formData.isAutoScored && !formData.correctAnswer && formData.type !== 'MATCHING') {
        toast.error('ავტომატურად შეფასებულ კითხვებს უნდა ჰქონდეთ სწორი პასუხი (გარდა შესაბამისობის კითხვებისა)')
        return
      }

      setSaving(true)

      const response = await fetch(`/api/admin/teacher-questions/${questionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          options: formData.options.filter(option => option.trim() !== ''),
          imageOptions: formData.imageOptions.filter(option => option.trim() !== ''),
          matchingPairs: formData.matchingPairs.filter(pair => pair.left.trim() !== '' && pair.right.trim() !== ''),
          maxPoints: formData.maxPoints || null
        }),
      })

      if (response.ok) {
        toast.success('კითხვა წარმატებით განახლდა')
        router.push('/admin/olympiads/teachers')
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update question')
      }
    } catch (error) {
      console.error('Error updating question:', error)
      toast.error(error instanceof Error ? error.message : 'კითხვის განახლებისას შეცდომა მოხდა')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!question) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">კითხვა ვერ მოიძებნა</h2>
          <Link href="/admin/olympiads/teachers" className="text-blue-600 hover:text-blue-800">
            დაბრუნება
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-black md:text-[25px] text-[20px]">
                კითხვის რედაქტირება
              </h1>
              <p className="text-black md:text-[18px] text-[16px]">
                მასწავლებლის მიერ დამატებული კითხვის რედაქტირება
              </p>
            </div>
            <Link
              href="/admin/olympiads/teachers"
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md md:text-[18px] text-[16px] font-bold"
            >
              დაბრუნება
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Teacher Info */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">მასწავლებლის ინფორმაცია</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">სახელი და გვარი</p>
              <p className="text-sm font-medium text-gray-900">
                {question.createdByTeacher?.name} {question.createdByTeacher?.lastname}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">სკოლა</p>
              <p className="text-sm font-medium text-gray-900">{question.createdByTeacher?.school}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">საგანი</p>
              <p className="text-sm font-medium text-gray-900">{question.createdByTeacher?.subject}</p>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Question Type */}
              <div>
                <label className="block font-medium text-black md:text-[18px] text-[16px] mb-2">
                  კითხვის ტიპი *
                </label>
                <select
                  name="type"
                  required
                  value={formData.type}
                  onChange={(e) => handleQuestionTypeChange(e.target.value)}
                  className="w-full px-4 text-black placeholder:text-black py-[11px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 md:text-[18px] text-[16px]"
                >
                  <option className='text-black placeholder:text-black' value="CLOSED_ENDED">დახურული კითხვა (ხელით)</option>
                  <option className='text-black placeholder:text-black' value="MATCHING">შესაბამისობა (ავტომატური)</option>
                  <option className='text-black placeholder:text-black' value="TEXT_ANALYSIS">ტექსტის ანალიზი (ხელით)</option>
                  <option className='text-black placeholder:text-black' value="MAP_ANALYSIS">რუკის ანალიზი (ხელით)</option>
                  <option className='text-black placeholder:text-black' value="OPEN_ENDED">ღია კითხვა (ხელით)</option>
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
                  className="w-full text-black placeholder:text-black px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 md:text-[18px] text-[16px]"
                  placeholder={formData.type === 'TEXT_ANALYSIS' ? 'შეიყვანეთ ანალიზის ტექსტი...' : 
                               formData.type === 'MAP_ANALYSIS' ? 'შეიყვანეთ რუკის აღწერა...' : 
                               'შეიყვანეთ კითხვის ტექსტი...'}
                />
              </div>

              {/* Points */}
              <div>
                <label className="block font-medium text-black md:text-[18px] text-[16px] mb-2">
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
                  className="w-full px-3 py-2 text-black placeholder:text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 md:text-[18px] text-[16px]"
                />
              </div>

              {/* Max Points for Manual Scoring */}
              {!formData.isAutoScored && (
                <div>
                  <label className="block font-medium text-black md:text-[18px] text-[16px] mb-2">
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
                    className="w-full px-3 py-2 text-black placeholder:text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 md:text-[18px] text-[16px]"
                    placeholder="მაგ: 2.5"
                  />
                </div>
              )}

              {/* Subject */}
              <div>
                <label className="block font-medium text-black md:text-[18px] text-[16px] mb-2">
                  საგანი *
                </label>
                <select
                  name="subjectId"
                  required
                  value={formData.subjectId}
                  onChange={handleInputChange}
                  className="w-full px-4 text-black placeholder:text-black py-[11px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 md:text-[18px] text-[16px]"
                >
                  <option value="">აირჩიეთ საგანი</option>
                  {subjects.map(subject => (
                    <option key={subject.id} className='text-black placeholder:text-black' value={subject.id}>{subject.name}</option>
                  ))}
                </select>
              </div>

              {/* Grade */}
              <div>
                <label className="block font-medium text-black md:text-[18px] text-[16px] mb-2">
                  კლასი *
                </label>
                <select
                  name="grade"
                  required
                  value={formData.grade}
                  onChange={handleInputChange}
                  className="w-full px-4 text-black placeholder:text-black py-[11px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 md:text-[18px] text-[16px]"
                >
                  {[7, 8, 9, 10, 11, 12].map(grade => (
                    <option key={grade} className='text-black placeholder:text-black' value={grade}>{grade} კლასი</option>
                  ))}
                </select>
              </div>

              {/* Round */}
              <div>
                <label className="block font-medium text-black md:text-[18px] text-[16px] mb-2">
                  რაუნდი *
                </label>
                <select
                  name="round"
                  required
                  value={formData.round}
                  onChange={handleInputChange}
                  className="w-full px-4 text-black placeholder:text-black py-[14px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 md:text-[18px] text-[16px]"
                >
                  <option value={1} className='text-black placeholder:text-black'>1 რაუნდი</option>
                  <option value={2} className='text-black placeholder:text-black'>2 რაუნდი</option>
                  <option value={3} className='text-black placeholder:text-black'>3 რაუნდი</option>
                </select>
              </div>

              {/* Chapter */}
              <div>
                <label className="block font-medium text-black md:text-[18px] text-[16px] mb-2">
                  თავი
                </label>
                <input
                  type="text"
                  name="chapterName"
                  value={formData.chapterName}
                  onChange={handleInputChange}
                  className="w-full px-4 text-black placeholder:text-black py-[11px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 md:text-[18px] text-[16px]"
                  placeholder="შეიყვანეთ თავის სახელი..."
                />
              </div>

              {/* Paragraph */}
              <div>
                <label className="block font-medium text-black md:text-[18px] text-[16px] mb-2">
                  პარაგრაფი
                </label>
                <input
                  type="text"
                  name="paragraphName"
                  value={formData.paragraphName}
                  onChange={handleInputChange}
                  className="w-full px-4 text-black placeholder:text-black py-[11px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 md:text-[18px] text-[16px]"
                  placeholder="შეიყვანეთ პარაგრაფის სახელი..."
                />
              </div>

              {/* Image Upload */}
              <div className="md:col-span-2">
                <label className="block font-medium text-black md:text-[18px] text-[16px] mb-2">
                  სურათი (არასავალდებულო)
                </label>
                <ImageUpload
                  onChange={(urls) => setFormData(prev => ({ ...prev, image: urls[0] || '' }))}
                  value={formData.image ? [formData.image] : []}
                />
              </div>
            </div>

            {/* Sub-questions Section for TEXT_ANALYSIS and MAP_ANALYSIS */}
            {(formData.type === 'TEXT_ANALYSIS' || formData.type === 'MAP_ANALYSIS') && (
              <div className="pt-6 bg-purple-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-bold text-black md:text-[18px] text-[16px]">
                    ქვეკითხვები
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddSubQuestion}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-[16px] font-medium"
                  >
                    ქვეკითხვის დამატება
                  </button>
                </div>

                <div className="space-y-4">
                  {formData.subQuestions.map((subQuestion, index) => (
                    <div key={subQuestion.id} className="bg-white p-4 rounded-lg border border-purple-200">
                      <div className="flex justify-between items-center mb-3">
                        <h5 className="text-md font-semibold text-black md:text-[16px] text-[14px]">
                          ქვეკითხვა {index + 1}
                        </h5>
                        <button
                          type="button"
                          onClick={() => handleRemoveSubQuestion(index)}
                          className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-sm font-medium"
                        >
                          წაშლა
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-black md:text-[16px] text-[14px] mb-2">
                            კითხვის ტექსტი *
                          </label>
                          <textarea
                            value={subQuestion.text}
                            onChange={(e) => handleSubQuestionChange(index, 'text', e.target.value)}
                            placeholder="შეიყვანეთ ქვეკითხვის ტექსტი..."
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 md:text-[16px] text-[14px]"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-black md:text-[16px] text-[14px] mb-2">
                            ქულები *
                          </label>
                          <input
                            type="number"
                            value={subQuestion.points}
                            onChange={(e) => handleSubQuestionChange(index, 'points', parseInt(e.target.value))}
                            min="1"
                            max="10"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 md:text-[16px] text-[14px]"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Options Section for CLOSED_ENDED */}
            {formData.type === 'CLOSED_ENDED' && (
              <div className="pt-6 bg-blue-50 p-4 rounded-lg">
                {/* Image Options Toggle */}
                <div className="mb-4 p-3 bg-white rounded border">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.useImageOptions}
                      onChange={(e) => setFormData(prev => ({ ...prev, useImageOptions: e.target.checked }))}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                    <span className="text-black md:text-[16px] text-[14px] font-medium">
                      გამოიყენეთ სურათები პასუხის ვარიანტებად
                    </span>
                  </label>
                  <p className="text-gray-600 text-sm mt-1 ml-7">
                    თუ ჩართულია, მოსწავლეები აირჩევენ სწორ პასუხს სურათზე დაჭერით
                  </p>
                </div>

                {formData.useImageOptions ? (
                  /* Image Options Section */
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-lg font-bold text-black md:text-[18px] text-[16px]">
                        სურათის პასუხის ვარიანტები (აირჩიეთ სწორი სურათი)
                      </h4>
                      <button
                        type="button"
                        onClick={handleAddImageOption}
                        disabled={formData.imageOptions.length >= 6}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-3 py-1 rounded text-[16px] font-medium"
                      >
                        სურათის დამატება
                      </button>
                    </div>

                    <div className="space-y-3">
                      {formData.imageOptions.map((imageOption, index) => (
                        <div key={index} className="bg-white p-3 rounded border">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className="text-[16px] font-medium text-black min-w-[80px]">
                              სურათი {index + 1}:
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveImageOption(index)}
                              disabled={formData.imageOptions.length <= 2}
                              className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-2 py-1 rounded text-sm font-medium"
                            >
                              წაშლა
                            </button>
                          </div>
                          
                          {imageOption ? (
                            <div className="relative">
                              <img 
                                src={imageOption} 
                                alt={`Option ${index + 1}`} 
                                className="w-full max-w-md h-auto rounded-lg border border-gray-300"
                              />
                              <button
                                type="button"
                                onClick={() => handleImageOptionChange(index, '')}
                                className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
                              >
                                ×
                              </button>
                            </div>
                          ) : (
                            <ImageUpload
                              onChange={(urls) => handleImageOptionChange(index, urls[0] || '')}
                              value={imageOption ? [imageOption] : []}
                            />
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 p-3 bg-yellow-100 rounded text-sm border-l-4 border-yellow-400">
                      <p className="font-medium text-yellow-800">მნიშვნელოვანი:</p>
                      <p className="text-yellow-700">აირჩიეთ სწორი სურათი ქვემოთ მოცემული სიიდან</p>
                    </div>

                    {/* Correct Answer Selection for Image Options */}
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-blue-800 mb-2">
                        სწორი სურათი *
                      </label>
                      <select
                        name="correctAnswer"
                        required
                        value={formData.correctAnswer}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 md:text-[16px] text-[14px]"
                      >
                        <option value="">აირჩიეთ სწორი სურათი</option>
                        {formData.imageOptions.map((imageOption, index) => (
                          <option key={index} value={imageOption}>
                            {imageOption ? `სურათი ${index + 1}` : `სურათი ${index + 1} (არ არის ატვირთული)`}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ) : (
                  /* Text Options Section */
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-lg font-bold text-black md:text-[18px] text-[16px]">
                        პასუხის ვარიანტები (ყველა პასუხი)
                      </h4>
                      <button
                        type="button"
                        onClick={handleAddOption}
                        disabled={formData.options.length >= 6}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-3 py-1 rounded text-[16px] font-medium"
                      >
                        ვარიანტის დამატება
                      </button>
                    </div>

                    <div className="space-y-3">
                      {formData.options.map((option, index) => (
                        <div key={index} className="flex items-center space-x-3 bg-white p-3 rounded border">
                          <span className="text-[18px] font-medium text-black min-w-[80px]">
                            ვარიანტი {index + 1}:
                          </span>
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => handleOptionChange(index, e.target.value)}
                            placeholder={`შეიყვანეთ პასუხის ვარიანტი ${index + 1}...`}
                            className="flex-1 px-3 py-2 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 md:text-[18px] text-[16px]"
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

                    {/* Correct Answer Selection for Text Options */}
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-black md:text-[18px] text-[16px] mb-2">
                        სწორი პასუხი *
                      </label>
                      <select
                        name="correctAnswer"
                        required
                        value={formData.correctAnswer}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 md:text-[18px] text-[16px]"
                      >
                        <option value="">აირჩიეთ სწორი პასუხი</option>
                        {formData.options.map((option, index) => (
                          <option key={index} value={option}>
                            {option || `ვარიანტი ${index + 1}`}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Matching Pairs Section */}
            {formData.type === 'MATCHING' && (
              <div className="pt-6 bg-green-50 p-4 rounded-lg">
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
                    <div key={index} className="bg-white p-4 rounded border">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            მარცხენა მხარე
                          </label>
                          <input
                            type="text"
                            value={pair.left}
                            onChange={(e) => handleMatchingPairChange(index, 'left', e.target.value)}
                            placeholder="ტექსტი..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 md:text-[16px] text-[14px]"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            მარჯვენა მხარე
                          </label>
                          <input
                            type="text"
                            value={pair.right}
                            onChange={(e) => handleMatchingPairChange(index, 'right', e.target.value)}
                            placeholder="ტექსტი..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 md:text-[16px] text-[14px]"
                          />
                        </div>
                      </div>
                      
                      <div className="flex justify-end mt-3">
                        <button
                          type="button"
                          onClick={() => handleRemoveMatchingPair(index)}
                          disabled={formData.matchingPairs.length <= 1}
                          className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-3 py-1 rounded text-sm font-medium"
                        >
                          წაშლა
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Manual Scoring Notice */}
            {!formData.isAutoScored && (
              <div className="pt-6 bg-orange-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-orange-600 text-xl">⚠️</span>
                  <h4 className="text-lg font-bold text-orange-800 md:text-[18px] text-[16px]">
                    ხელით შეფასება
                  </h4>
                </div>
                <p className="text-orange-700 md:text-[16px] text-[14px]">
                  ეს კითხვა საჭიროებს ხელით შეფასებას. სისტემა ავტომატურად ვერ გაითვლის ქულას.
                </p>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex space-x-3 pt-6 border-t">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-[#034e64] cursor-pointer text-white px-4 py-2 rounded-md font-bold md:text-[20px] text-[18px] disabled:opacity-50"
              >
                {saving ? 'ინახება...' : 'კითხვის განახლება'}
              </button>
              <Link
                href="/admin/olympiads/teachers"
                className="flex-1 bg-red-600 hover:bg-red-700 cursor-pointer text-white px-4 py-2 rounded-md font-bold md:text-[20px] text-[18px] text-center"
              >
                გაუქმება
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function EditTeacherQuestionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return (
    <AdminOnly>
      <EditTeacherQuestionContent questionId={id} />
    </AdminOnly>
  )
}
