'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { TeacherOnly } from '@/components/auth/ProtectedRoute'
import { useRouter } from 'next/navigation'
import ImageUpload from '@/component/CloudinaryUploader'
import ImageModal from '@/components/ImageModal'
import { numberToGeorgianLetter, numberToGeorgianQuestionNumber, numberToGeorgianOptionLabel } from '@/utils/georgianLetters'

interface Question {
  id: string
  text: string
  type: string
  subject: {
    name: string
  }
  grade: number
  round: number
  createdAt: string
  isReported?: boolean
  reportReason?: string
  chapterName?: string
  paragraphName?: string
  options?: string[]
  imageOptions?: string[]
  correctAnswer?: string
  points?: number
  maxPoints?: number
  image?: string[]
  
  leftSide?: Array<{ left: string, leftImage?: string }>
  rightSide?: Array<{ right: string, rightImage?: string }>
  isAutoScored?: boolean
  subQuestions?: Array<{
    id: string
    text: string
    type: 'CLOSED_ENDED' | 'OPEN_ENDED'
    options?: string[]
    correctAnswer?: string
    answerTemplate?: string
    points: number
    maxPoints?: number
    isAutoScored: boolean
    image?: string[]
  }>
}

interface TeacherProfile {
  id: string
  name: string
  lastname: string
  email: string
  subject: string
  school: string
  phone: string
  isVerified: boolean
  canCreateQuestions: boolean
  createdAt: string
  updatedAt: string
}

function TeacherQuestionsContent() {
  const { user } = useAuth()
  const [questions, setQuestions] = useState<Question[]>([])
  const [profile, setProfile] = useState<TeacherProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showSubmitForm, setShowSubmitForm] = useState(false)
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'all' | 'matching' | 'text-analysis' | 'map-analysis' | 'open-ended' | 'closed-ended'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGrade, setSelectedGrade] = useState('')
  const router = useRouter()
  const [selectedRound, setSelectedRound] = useState('')
  const [formData, setFormData] = useState<{
    text: string
    type: 'CLOSED_ENDED' | 'MATCHING' | 'TEXT_ANALYSIS' | 'MAP_ANALYSIS' | 'OPEN_ENDED'
    options: string[]
    imageOptions: string[]
    useImageOptions: boolean
    correctAnswer: string
    answerTemplate: string
    points: number
    maxPoints: number
    image: string[]
    leftSide:  Array<{ left: string, leftImage?: string }>
    rightSide:  Array<{ right: string, rightImage?: string }>
    
    grade: number
    round: number
    isAutoScored: boolean
    subQuestions: Array<{
      id: string
      text: string
      type: 'CLOSED_ENDED' | 'OPEN_ENDED'
      options?: string[]
      correctAnswer?: string
      answerTemplate?: string
      points: number
      maxPoints?: number
      isAutoScored: boolean
      image?: string[]
    }>
    chapterName: string
    paragraphName: string
  }>({
    text: '',
    type: 'CLOSED_ENDED',
    options: ['', '', '', ''],
    imageOptions: ['', '', '', ''],
    useImageOptions: false,
    correctAnswer: '',
    answerTemplate: '',
    points: 1,
    maxPoints: 1,
    image: [],
    leftSide: [{ left: '', leftImage: undefined}],
    rightSide: [{ right: '', rightImage: undefined}],
    grade: 7,
    round: 1,
    isAutoScored: false,
    subQuestions: [],
    chapterName: '',
    paragraphName: ''
  })

  useEffect(() => {
    fetchProfile()
    fetchQuestions()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/teacher/profile')
      if (response.ok) {
        const data = await response.json()
        setProfile(data.profile)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  const fetchQuestions = async () => {
    try {
      const response = await fetch('/api/teacher/questions')
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

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.text || formData.options.some(opt => !opt.trim())) {
      alert('გთხოვთ შეიყვანოთ ყველა საჭირო ველი')
      return
    }

    try {
      const response = await fetch('/api/teacher/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const data = await response.json()
        setQuestions([data.question, ...questions])
        setFormData({
          text: '',
          type: 'CLOSED_ENDED',
          options: ['', '', '', ''],
          imageOptions: ['', '', '', ''],
          useImageOptions: false,
          correctAnswer: '',
          answerTemplate: '',
          points: 1,
          maxPoints: 1,
          image: [],
          leftSide: [{ left: '', leftImage: undefined}],
          rightSide: [{ right: '', rightImage: undefined}],
          grade: 7,
          round: 1,
          isAutoScored: false,
          subQuestions: [],
          chapterName: '',
          paragraphName: ''
        })
        setShowCreateForm(false)
        alert('კითხვა წარმატებით დაემატა')
      } else {
        const error = await response.json()
        alert(error.error || 'შეცდომა კითხვის დამატებისას')
      }
    } catch (error) {
      console.error('Error creating question:', error)
      alert('შეცდომა კითხვის დამატებისას')
    }
  }

  const handleSubmitQuestion = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.text || formData.options.some(opt => !opt.trim())) {
      alert('გთხოვთ შეიყვანოთ ყველა საჭირო ველი')
      return
    }

    try {
      const response = await fetch('/api/teacher/submit-question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const data = await response.json()
        setFormData({
          text: '',
          type: 'CLOSED_ENDED',
          options: ['', '', '', ''],
          imageOptions: ['', '', '', ''],
          useImageOptions: false,
          correctAnswer: '',
          answerTemplate: '',
          points: 1,
          maxPoints: 1,
          image: [],
          leftSide: [{ left: '', leftImage: undefined}],
          rightSide: [{ right: '', rightImage: undefined}],
          grade: 7,
          round: 1,
          isAutoScored: false,
          subQuestions: [],
          chapterName: '',
          paragraphName: ''
        })
        setShowSubmitForm(false)
        alert('კითხვა წარმატებით გაიგზავნა ადმინისტრატორთან განსახილველად')
      } else {
        const error = await response.json()
        alert(error.error || 'შეცდომა კითხვის გაგზავნისას')
      }
    } catch (error) {
      console.error('Error submitting question:', error)
      alert('შეცდომა კითხვის გაგზავნისას')
    }
  }

  const handleReportQuestion = async (questionId: string, reason: string) => {
    try {
      const response = await fetch('/api/teacher/report-question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionId,
          reason
        }),
      })

      if (response.ok) {
        alert('კითხვა წარმატებით დარეპორტდა')
        fetchQuestions() // Refresh the list
      } else {
        const error = await response.json()
        alert(error.error || 'შეცდომა კითხვის დარეპორტებისას')
      }
    } catch (error) {
      console.error('Error reporting question:', error)
      alert('შეცდომა კითხვის დარეპორტებისას')
    }
  }

  const handleEditQuestion = async (questionId: string) => {
    // Find the question to edit
    const questionToEdit = questions.find(q => q.id === questionId)
    if (!questionToEdit) {
      alert('კითხვა ვერ მოიძებნა')
      return
    }

    // Populate form with question data
    setFormData({
      text: questionToEdit.text,
      type: questionToEdit.type as 'CLOSED_ENDED' | 'MATCHING' | 'TEXT_ANALYSIS' | 'MAP_ANALYSIS' | 'OPEN_ENDED',
      options: questionToEdit.options || ['', '', '', ''],
      imageOptions: questionToEdit.imageOptions || ['', '', '', ''],
      useImageOptions: false, // You might want to detect this from the question data
      correctAnswer: questionToEdit.correctAnswer || '',
      answerTemplate: '',
      points: questionToEdit.points || 1,
      maxPoints: questionToEdit.maxPoints || 1,
      image: questionToEdit.image || [],
      leftSide: questionToEdit.leftSide|| [{ left: '', leftImage: undefined}],
      rightSide: questionToEdit.rightSide|| [{ right: '', rightImage: undefined}],
      grade: questionToEdit.grade,
      round: questionToEdit.round,
      isAutoScored: questionToEdit.isAutoScored || false,
      subQuestions: questionToEdit.subQuestions || [],
      chapterName: questionToEdit.chapterName || '',
      paragraphName: questionToEdit.paragraphName || ''
    })

    // Set edit mode
    setEditingQuestionId(questionId)
    setShowCreateForm(true)
  }

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm('ნამდვილად გსურთ ამ კითხვის წაშლა?')) {
      return
    }

    try {
      const response = await fetch(`/api/teacher/questions?id=${questionId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        alert('კითხვა წარმატებით წაიშალა')
        fetchQuestions() // Refresh the list
      } else {
        const error = await response.json()
        alert(error.error || 'შეცდომა კითხვის წაშლისას')
      }
    } catch (error) {
      console.error('Error deleting question:', error)
      alert('შეცდომა კითხვის წაშლისას')
    }
  }

  // Helper functions for form handling
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
    if (field === 'left' || field === 'leftImage') {
      const newLeftSide = [...formData.leftSide]
      newLeftSide[index] = { ...newLeftSide[index], [field]: value }
      setFormData(prev => ({
        ...prev,
        leftSide: newLeftSide
      }))
    } else {
      const newRightSide = [...formData.rightSide]
      newRightSide[index] = { ...newRightSide[index], [field]: value }
      setFormData(prev => ({
        ...prev,
        rightSide: newRightSide
      }))
    }
  }

// მარცხენა მხარის ცვლილება
const handleLeftSideChange = (index: number, field: 'left' | 'leftImage', value: string) => {
  setFormData(prev => {
    const updated = [...prev.leftSide]
    updated[index] = { ...updated[index], [field]: value }
    return { ...prev, leftSide: updated }
  })
}

// მარჯვენა მხარის ცვლილება
const handleRightSideChange = (index: number, field: 'right' | 'rightImage', value: string) => {
  setFormData(prev => {
    const updated = [...prev.rightSide]
    updated[index] = { ...updated[index], [field]: value }
    return { ...prev, rightSide: updated }
  })
}


  


  const handleRemoveLeftSide = () => {
    if (formData.leftSide.length > 1) {
      const newLeftSide = formData.leftSide.filter((_, index) => index !== formData.leftSide.length - 1)
      setFormData(prev => ({
        ...prev,
        leftSide: newLeftSide
      }))
    }
  }

  const handleRemoveRightSide = () => {
    if (formData.rightSide.length > 1) {
      const newRightSide = formData.rightSide.filter((_, index) => index !== formData.rightSide.length - 1)
      setFormData(prev => ({
        ...prev,
        rightSide: newRightSide
      }))
    }
  }

  // Sub-questions functions
  const handleAddSubQuestion = () => {
    const newSubQuestion = {
      id: `temp-${Date.now()}`,
      text: '',
      type: 'CLOSED_ENDED' as 'CLOSED_ENDED' | 'OPEN_ENDED',
      options: ['', '', '', ''],
      correctAnswer: '',
      answerTemplate: '',
      points: 1,
      maxPoints: 1,
      isAutoScored: false,
      image: []
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

  const handleSubQuestionChange = (index: number, field: string, value: string | number | boolean) => {
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
    const isAutoScored = ['MATCHING', 'CLOSED_ENDED'].includes(type)
    setFormData(prev => ({
      ...prev,
      type: type as 'CLOSED_ENDED' | 'MATCHING' | 'TEXT_ANALYSIS' | 'MAP_ANALYSIS' | 'OPEN_ENDED',
      isAutoScored,
      maxPoints: isAutoScored ? prev.points : prev.maxPoints,
      correctAnswer: type === 'MATCHING' ? 'matching' : prev.correctAnswer,
      subQuestions: (type === 'TEXT_ANALYSIS' || type === 'MAP_ANALYSIS') ? prev.subQuestions : []
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // Basic validation
      if (!formData.text || formData.text.trim() === '') {
        alert('გთხოვთ შეიყვანოთ კითხვის ტექსტი')
        return
      }

      // Validate that TEXT_ANALYSIS and MAP_ANALYSIS questions have sub-questions
      if ((formData.type === 'TEXT_ANALYSIS' || formData.type === 'MAP_ANALYSIS') && 
          (!formData.subQuestions || formData.subQuestions.length === 0)) {
        alert('ტექსტის ანალიზის და რუკის ანალიზის კითხვებს უნდა ჰქონდეთ მინიმუმ ერთი ქვეკითხვა')
        return
      }

      // Validate MATCHING questions
      if (formData.type === 'MATCHING') {
        if (!formData.leftSide || formData.leftSide.length === 0 || !formData.rightSide || formData.rightSide.length === 0) {
          alert('შესაბამისობის კითხვებს უნდა ჰქონდეთ მინიმუმ ერთი მარცხენა და ერთი მარჯვენა მნიშვნელობა')
          return
        }
        
        // Validate left side items
        const leftValues = new Set()
        for (let i = 0; i < formData.leftSide.length; i++) {
          const leftPair = formData.leftSide[i]
          if (!leftPair.left.trim() && !leftPair.leftImage) {
            alert(`მარცხენა მხარე ${i + 1} უნდა ჰქონდეს ტექსტი ან სურათი`)
            return
          }
          
          // Check for duplicates in left side
          const leftValue = leftPair.left.trim() || leftPair.leftImage
          if (leftValues.has(leftValue)) {
            alert(`მარცხენა მხარე ${i + 1} არ უნდა იყოს ერთნაირი სხვა მარცხენა მხარეებთან`)
            return
          }
          leftValues.add(leftValue)
        }
        
        // Validate right side items
        const rightValues = new Set()
        for (let i = 0; i < formData.rightSide.length; i++) {
          const rightPair = formData.rightSide[i]
          if (!rightPair.right.trim() && !rightPair.rightImage) {
            alert(`მარჯვენა მხარე ${i + 1} უნდა ჰქონდეს ტექსტი ან სურათი`)
            return
          }
          
          // Check for duplicates in right side
          const rightValue = rightPair.right.trim() || rightPair.rightImage
          if (rightValues.has(rightValue)) {
            alert(`მარჯვენა მხარე ${i + 1} არ უნდა იყოს ერთნაირი სხვა მარჯვენა მხარეებთან`)
            return
          }
          rightValues.add(rightValue)
        }
      }

      // Validate sub-questions if they exist
      if (formData.subQuestions && formData.subQuestions.length > 0) {
        for (let i = 0; i < formData.subQuestions.length; i++) {
          const sq = formData.subQuestions[i]
          if (!sq.text.trim()) {
            alert(`ქვეკითხვა ${numberToGeorgianLetter(i)} უნდა ჰქონდეს ტექსტი`)
            return
          }
          if (sq.points < 1) {
            alert(`ქვეკითხვა ${numberToGeorgianLetter(i)} უნდა ჰქონდეს მინიმუმ 1 ქულა`)
            return
          }
          
          if (sq.type === 'CLOSED_ENDED' && sq.isAutoScored) {
            if (!sq.options || sq.options.filter(opt => opt.trim()).length < 2) {
              alert(`ქვეკითხვა ${numberToGeorgianLetter(i)} უნდა ჰქონდეს მინიმუმ 2 პასუხის ვარიანტი ავტომატური შეფასებისთვის`)
              return
            }
            if (!sq.correctAnswer || sq.correctAnswer.trim() === '') {
              alert(`ქვეკითხვა ${numberToGeorgianLetter(i)} უნდა ჰქონდეს სწორი პასუხი ავტომატური შეფასებისთვის`)
              return
            }
          }
        }
      }

      // Validate CLOSED_ENDED questions
      if (formData.type === 'CLOSED_ENDED') {
        if (formData.useImageOptions) {
          if (!formData.imageOptions || formData.imageOptions.filter(opt => opt.trim()).length === 0) {
            alert('გთხოვთ დაამატოთ მინიმუმ ერთი სურათი პასუხის ვარიანტად')
            return
          }
          if (!formData.correctAnswer || formData.correctAnswer.trim() === '') {
            alert('გთხოვთ აირჩიოთ სწორი სურათი')
            return
          }
        } else {
          if (!formData.options || formData.options.filter(opt => opt.trim()).length < 2) {
            alert('გთხოვთ დაამატოთ მინიმუმ 2 პასუხის ვარიანტი')
            return
          }
          if (!formData.correctAnswer || formData.correctAnswer.trim() === '') {
            alert('გთხოვთ აირჩიოთ სწორი პასუხი')
            return
          }
        }
      }

      const url = profile?.canCreateQuestions ? '/api/teacher/questions' : '/api/teacher/submit-question'
      const method = editingQuestionId ? 'PUT' : 'POST'

    

      const requestBody = editingQuestionId 
        ? { ...formData, questionId: editingQuestionId }
        : formData

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (response.ok) {
        const message = editingQuestionId 
          ? 'კითხვა წარმატებით განახლდა!' 
          : (profile?.canCreateQuestions ? 'კითხვა წარმატებით შეიქმნა!' : 'კითხვა წარმატებით გაიგზავნა ადმინისტრატორთან განსახილველად!')
        alert(message)
        setShowCreateForm(false)
        setShowSubmitForm(false)
        setEditingQuestionId(null)
        resetForm()
        fetchQuestions()
      } else {
        const errorData = await response.json()
        console.error('API Error:', errorData)
        alert(`შეცდომა: ${errorData.error || errorData.message || 'Unknown error'}`)
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
      imageOptions: ['', '', '', ''],
      useImageOptions: false,
      correctAnswer: '',
      answerTemplate: '',
      points: 1,
      maxPoints: 1,
      image: [],
      leftSide: [{ left: '', leftImage: undefined}],
      rightSide: [{ right: '', rightImage: undefined}],
      grade: 7,
      round: 1,
      isAutoScored: false,
      subQuestions: [],
      chapterName: '',
      paragraphName: ''
    })
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

  const filteredQuestions = questions.filter(question => {
    // Search filtering
    let matchesSearch = true
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim()
      
      matchesSearch =
        question.text.toLowerCase().includes(searchLower) ||
        question.grade.toString().includes(searchLower) ||
        question.round.toString().includes(searchLower) ||
        question.type.toLowerCase().includes(searchLower) ||
        getQuestionTypeLabel(question.type).toLowerCase().includes(searchLower)
    }

    // Tab filtering logic
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

    // Other filters
    const matchesGrade = !selectedGrade || question.grade === parseInt(selectedGrade)
    const matchesRound = !selectedRound || question.round === parseInt(selectedRound)

    return matchesSearch && matchesType && matchesGrade && matchesRound
  })

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
                  {profile?.canCreateQuestions 
                    ? 'დაამატეთ და მართეთ კითხვები ადმინისტრატორის დადასტურებისთვის'
                    : 'შემოგვთავაზეთ კითხვები განსახილველად'
                  }
               </p>
               {profile?.subject && (
                 <div className="mt-2">
                   <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 md:text-[16px] text-[14px]">
                     <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                     </svg>
                     საგანი: {profile.subject}
                   </span>
                 </div>
               )}
            </div>
            <div className="flex gap-4">
            <button
              onClick={() => router.back()}
              className="bg-[#034e64] cursor-pointer text-white px-4 py-2 rounded-md md:text-[20px] text-[16px] font-bold transition-colors hover:bg-[#023a4d]"
            >
              უკან დაბრუნება
            </button>
              {profile?.canCreateQuestions ? (
                <button
                  onClick={() => setShowCreateForm(!showCreateForm)}
                  className="bg-[#034e64] cursor-pointer text-white px-4 py-2 rounded-md md:text-[20px] text-[16px] font-bold transition-colors hover:bg-[#023a4d]"
                >
                  {showCreateForm ? 'გაუქმება' : 'ახალი კითხვა'}
                </button>
              ) : (
                <button
                  onClick={() => setShowSubmitForm(!showSubmitForm)}
                  className="bg-[#034e64] cursor-pointer text-white px-4 py-2 rounded-md md:text-[20px] text-[16px] font-bold transition-colors hover:bg-[#023a4d]"
                >
                  {showSubmitForm ? 'გაუქმება' : 'კითხვის გაგზავნა'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

             <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
         {/* Filters and Search */}
         <div className="mb-6">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
             <div className="lg:col-span-2">
               <div className="relative">
                 <input
                   type="text"
                   placeholder="მოძებნა: კითხვა, კლასი, რაუნდი, ტიპი..."
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 md:text-[18px] text-[16px]"
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
                 value={selectedGrade}
                 onChange={(e) => setSelectedGrade(e.target.value)}
                 className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 md:text-[18px] text-[16px]"
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
                 className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 md:text-[18px] text-[16px]"
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
               className={`px-4 py-2 rounded-md font-medium md:text-[20px] text-[18px] ${activeTab === 'all'
                   ? 'bg-black text-white'
                   : 'bg-gray-200 text-black hover:bg-gray-300'
                 }`}
             >
               ყველა ({questions.length})
             </button>
             <button
               onClick={() => setActiveTab('closed-ended')}
               className={`px-4 py-2 rounded-md font-medium md:text-[20px] text-[18px] ${activeTab === 'closed-ended'
                   ? 'bg-black text-white'
                   : 'bg-gray-200 text-black hover:bg-gray-300'
                 }`}
             >
               დახურული კითხვები ({questions.filter(q => q.type === 'CLOSED_ENDED').length})
             </button>
             <button
               onClick={() => setActiveTab('matching')}
               className={`px-4 py-2 rounded-md font-medium md:text-[20px] text-[18px] ${activeTab === 'matching'
                   ? 'bg-black text-white'
                   : 'bg-gray-200 text-black hover:bg-gray-300'
                 }`}
             >
               შესაბამისობა ({questions.filter(q => q.type === 'MATCHING').length})
             </button>
             <button
               onClick={() => setActiveTab('text-analysis')}
               className={`px-4 py-2 rounded-md font-medium md:text-[20px] text-[18px] ${activeTab === 'text-analysis'
                   ? 'bg-black text-white'
                   : 'bg-gray-200 text-black hover:bg-gray-300'
                 }`}
             >
               ტექსტის ანალიზი ({questions.filter(q => q.type === 'TEXT_ANALYSIS').length})
             </button>
             <button
               onClick={() => setActiveTab('map-analysis')}
               className={`px-4 py-2 rounded-md font-medium md:text-[20px] text-[18px] ${activeTab === 'map-analysis'
                   ? 'bg-black text-white'
                   : 'bg-gray-200 text-black hover:bg-gray-300'
                 }`}
             >
               რუკის ანალიზი ({questions.filter(q => q.type === 'MAP_ANALYSIS').length})
             </button>
             <button
               onClick={() => setActiveTab('open-ended')}
               className={`px-4 py-2 rounded-md font-medium md:text-[20px] text-[18px] ${activeTab === 'open-ended'
                   ? 'bg-black text-white'
                   : 'bg-gray-200 text-black hover:bg-gray-300'
                 }`}
             >
               ღია კითხვა ({questions.filter(q => q.type === 'OPEN_ENDED').length})
             </button>
           </div>
         </div>

         {/* Status Information */}
         <div className="mb-8">
          <div className={`p-4 rounded-lg ${profile?.canCreateQuestions ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
            <div className="flex items-center">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${profile?.canCreateQuestions ? 'bg-green-500' : 'bg-yellow-500'}`}>
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                                 <h3 className={`text-lg font-medium ${profile?.canCreateQuestions ? 'text-green-800' : 'text-yellow-800'}`}>
                   {profile?.canCreateQuestions ? 'კითხვის დასმის უფლება' : 'ვერიფიკაციის პროცესში'}
                 </h3>
                                 <p className={`text-sm ${profile?.canCreateQuestions ? 'text-green-700' : 'text-yellow-700'}`}>
                   {profile?.canCreateQuestions 
                     ? 'თქვენ შეგიძლიათ დაამატოთ კითხვები ადმინისტრატორის დადასტურებისთვის'
                     : 'თქვენი კითხვები გაიგზავნება ადმინისტრატორთან განსახილველად'
                   }
                 </p>
                 {profile?.subject && (
                   <p className={`text-sm ${profile?.canCreateQuestions ? 'text-green-600' : 'text-yellow-600'} font-medium mt-1`}>
                     საგანი: <span className="font-semibold">{profile.subject}</span>
                   </p>
                 )}
              </div>
            </div>
          </div>
        </div>

       

        {/* Create/Submit Question Form */}
        {(showCreateForm || showSubmitForm) && (
          <div className="bg-white shadow rounded-lg p-6 mb-8">
            <h2 className="text-black md:text-[20px] text-[18px] font-semibold mb-4">
              {editingQuestionId 
                ? 'კითხვის რედაქტირება' 
                : (profile?.canCreateQuestions ? 'ახალი კითხვის დამატება' : 'კითხვის გაგზავნა')}
            </h2>
                         <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-black md:text-[20px] text-[18px] font-medium mb-2">
                    კითხვის ტიპი
                  </label>
                                     <select
                     value={formData.type}
                     onChange={(e) => handleQuestionTypeChange(e.target.value)}
                     className="w-full px-3 py-2 border border-gray-300 rounded-md md:text-[20px] text-[18px] focus:outline-none focus:ring-2 focus:ring-[#034e64]"
                     required
                   >
                                         <option value="CLOSED_ENDED">დახურული კითხვა (ხელით)</option>
                     <option value="MATCHING">შესაბამისობა (ავტომატური)</option>
                     <option value="TEXT_ANALYSIS">ტექსტის ანალიზი (ხელით)</option>
                     <option value="MAP_ANALYSIS">რუკის ანალიზი (ხელით)</option>
                     <option value="OPEN_ENDED">ღია კითხვა (ხელით)</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-black md:text-[20px] text-[18px] font-medium mb-2">
                    კითხვის ტექსტი
                  </label>
                  <textarea
                    value={formData.text}
                    onChange={(e) => setFormData(prev => ({ ...prev, text: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md md:text-[20px] text-[18px] focus:outline-none focus:ring-2 focus:ring-[#034e64]"
                    placeholder="შეიყვანეთ კითხვის ტექსტი"
                    rows={3}
                    required
                  />
                </div>
                <div>
                  <label className="block text-black md:text-[20px] text-[18px] font-medium mb-2">
                    კლასი
                  </label>
                  <select
                    value={formData.grade}
                    onChange={(e) => setFormData(prev => ({ ...prev, grade: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md md:text-[20px] text-[18px] focus:outline-none focus:ring-2 focus:ring-[#034e64]"
                    required
                  >
                                         {[7, 8, 9, 10, 11, 12].map(grade => (
                       <option key={grade} value={grade}>{grade} კლასი</option>
                     ))}
                  </select>
                </div>
                                 <div>
                   <label className="block text-black md:text-[20px] text-[18px] font-medium mb-2">
                     ქულა
                   </label>
                   <input
                     type="number"
                     name="points"
                     required
                     min="1"
                     value={formData.points}
                     onChange={(e) => setFormData(prev => ({ ...prev, points: parseInt(e.target.value) || 1 }))}
                     className="w-full px-3 py-2 border border-gray-300 rounded-md md:text-[20px] text-[18px] focus:outline-none focus:ring-2 focus:ring-[#034e64]"
                   />
                 </div>
                 <div>
                   <label className="block text-black md:text-[20px] text-[18px] font-medium mb-2">
                     რაუნდი
                   </label>
                   <select
                     value={formData.round}
                     onChange={(e) => setFormData(prev => ({ ...prev, round: parseInt(e.target.value) || 1 }))}
                     className="w-full px-3 py-2 border border-gray-300 rounded-md md:text-[20px] text-[18px] focus:outline-none focus:ring-2 focus:ring-[#034e64]"
                     required
                   >
                     {[1, 2, 3].map(round => (
                       <option key={round} value={round}>{round} რაუნდი</option>
                     ))}
                   </select>
                                  </div>

                 {/* Chapter */}
                 <div>
                   <label className="block text-black md:text-[20px] text-[18px] font-medium mb-2">
                     თავი
                   </label>
                   <input
                     type="text"
                     name="chapterName"
                     value={formData.chapterName}
                     onChange={handleInputChange}
                     className="w-full px-3 py-2 border border-gray-300 rounded-md md:text-[20px] text-[18px] focus:outline-none focus:ring-2 focus:ring-[#034e64]"
                     placeholder="შეიყვანეთ თავის სახელი..."
                   />
                 </div>

                 {/* Paragraph */}
                 <div>
                   <label className="block text-black md:text-[20px] text-[18px] font-medium mb-2">
                     პარაგრაფი
                   </label>
                   <input
                     type="text"
                     name="paragraphName"
                     value={formData.paragraphName}
                     onChange={handleInputChange}
                     className="w-full px-3 py-2 border border-gray-300 rounded-md md:text-[20px] text-[18px] focus:outline-none focus:ring-2 focus:ring-[#034e64]"
                     placeholder="შეიყვანეთ პარაგრაფის სახელი..."
                   />
                 </div>
               </div>

               {/* Image URL */}
               <div className="md:col-span-2">
                 <label className="block text-black md:text-[20px] text-[18px] font-medium mb-2">
                   სურათის URL (არასავალდებულო)
                 </label>
                 <ImageUpload
                   onChange={(urls) => setFormData(prev => ({ ...prev, image: urls }))}
                   value={formData.image}
                 />
               </div>

          

          
          

                                                           {/* Options Section for CLOSED_ENDED */}
                {formData.type === 'CLOSED_ENDED' && (
                  <div className="pt-6 bg-blue-50 p-4 rounded-lg">
                    {/* Image Options Toggle */}
                    <div className="mb-4">
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
                                  <ImageModal 
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

                    <div className="mt-4 p-3 bg-yellow-100 rounded text-sm border-l-4 border-yellow-400">
                      <p className="font-medium text-yellow-800">მნიშვნელოვანი:</p>
                      <p className="text-yellow-700">შეიყვანეთ ყველა პასუხის ვარიანტი (სწორი და არასწორი), შემდეგ აირჩიეთ სწორი პასუხი ქვემოთ</p>
                    </div>

                    {/* Correct Answer Selection */}
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-black md:text-[18px] text-[16px] mb-2">
                        სწორი პასუხი *
                      </label>
                      <select
                        name="correctAnswer"
                        required
                        value={formData.correctAnswer}
                        onChange={(e) => setFormData(prev => ({ ...prev, correctAnswer: e.target.value }))}
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

                             {formData.type === 'MATCHING' && (
                 <div className="pt-6 bg-green-50 p-4 rounded-lg">
                   <div className="mb-4">
                     <h4 className="text-lg font-bold text-black md:text-[18px] text-[16px] mb-4">
                       შესაბამისობის მარცხენა და მარჯვენა მხარეები (შეიძლება იყოს სხვადასხვა რაოდენობა)
                     </h4>
                     <div className="mb-2 text-sm text-gray-600">
                       Left Side Count: {formData.leftSide.length} | Right Side Count: {formData.rightSide.length}
                     </div>
                     <div className="flex gap-3">
                       <button
                         type="button"
                         onClick={() => {
                           setFormData(prev => {
                             const newLeftSide = [...prev.leftSide, { left: '', leftImage: undefined }]
                             return {
                               ...prev,
                               leftSide: newLeftSide
                             }
                           })
                         }}
                         className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-[16px] font-medium"
                       >
                         მარცხენა მხარის დამატება
                       </button>
                       <button
                         type="button"
                         onClick={() => {
                           setFormData(prev => {
                             const newRightSide = [...prev.rightSide, { right: '', rightImage: undefined }]
                             return {
                               ...prev,
                               rightSide: newRightSide
                             }
                           })
                         }}
                         className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-[16px] font-medium"
                       >
                         მარჯვენა მხარის დამატება
                       </button>
                     </div>
                   </div>

                   <div className="space-y-6">
                     {/* Left Side Items */}
                     <div className="bg-white p-4 rounded border">
                       <h4 className="text-lg font-semibold text-gray-900 mb-4">მარცხენა მხარე</h4>
                       <div className="space-y-3">
                         {formData.leftSide.map((pair, index) => (
                           <div key={index} className="flex items-center space-x-3">
                             <span className="text-sm font-medium text-gray-600 min-w-[30px]">
                               {String.fromCharCode(4304 + index)}:
                             </span>
                             <div className="flex-1">
                               {pair.leftImage ? (
                                 <div className="relative">
                                   <img 
                                     src={pair.leftImage} 
                                     alt="Left side image" 
                                     className="w-full max-w-xs h-auto rounded-lg border border-gray-300"
                                   />
                                   <button
                                     type="button"
                                     onClick={() => handleLeftSideChange(index, 'leftImage', '')}
                                     className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
                                   >
                                     ×
                                   </button>
                                 </div>
                               ) : (
                                 <div className="space-y-2">
                                   <input
                                     type="text"
                                     value={pair.left}
                                     onChange={(e) => handleLeftSideChange(index, 'left', e.target.value)}
                                     placeholder="ტექსტი ან სურათი..."
                                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 md:text-[16px] text-[14px]"
                                   />
                                   <div className="text-center">
                                     <span className="text-xs text-gray-500">ან</span>
                                   </div>
                                   <ImageUpload
                                     onChange={(urls) => handleLeftSideChange(index, 'leftImage', urls[0] || '')}
                                     value={pair.leftImage ? [pair.leftImage] : []}
                                   />
                                 </div>
                               )}
                             </div>
                           </div>
                         ))}
                       </div>
                     </div>

                     {/* Right Side Items */}
                     <div className="bg-white p-4 rounded border">
                       <h4 className="text-lg font-semibold text-gray-900 mb-4">მარჯვენა მხარე</h4>
                       <div className="space-y-3">
                         {formData.rightSide.map((pair, index) => (
                           <div key={index} className="flex items-center space-x-3">
                             <span className="text-sm font-medium text-gray-600 min-w-[30px]">
                               {index + 1}:
                             </span>
                             <div className="flex-1">
                               {pair.rightImage ? (
                                 <div className="relative">
                                   <img 
                                     src={pair.rightImage} 
                                     alt="Right side image" 
                                     className="w-full max-w-xs h-auto rounded-lg border border-gray-300"
                                   />
                                   <button
                                     type="button"
                                     onClick={() => handleRightSideChange(index, 'rightImage', '')}
                                     className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
                                   >
                                     ×
                                   </button>
                                 </div>
                               ) : (
                                 <div className="space-y-2">
                                   <input
                                     type="text"
                                     value={pair.right}
                                     onChange={(e) => handleRightSideChange(index, 'right', e.target.value)}
                                     placeholder="ტექსტი ან სურათი..."
                                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 md:text-[16px] text-[14px]"
                                   />
                                   <div className="text-center">
                                     <span className="text-xs text-gray-500">ან</span>
                                   </div>
                                   <ImageUpload
                                     onChange={(urls) => handleRightSideChange(index, 'rightImage', urls[0] || '')}
                                     value={pair.rightImage ? [pair.rightImage] : []}
                                   />
                                 </div>
                               )}
                             </div>
                           </div>
                         ))}
                       </div>
                     </div>
                   </div>

                   {/* Remove Buttons */}
                   <div className="flex justify-end gap-3">
                     <button
                       type="button"
                       onClick={handleRemoveLeftSide}
                       disabled={formData.leftSide.length <= 1}
                       className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-3 py-1 rounded text-sm font-medium"
                     >
                       მარცხენა მხარის წაშლა
                     </button>
                     <button
                       type="button"
                       onClick={handleRemoveRightSide}
                       disabled={formData.rightSide.length <= 1}
                       className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-3 py-1 rounded text-sm font-medium"
                     >
                       მარჯვენა მხარის წაშლა
                     </button>
                   </div>

                   <div className="mt-4 p-3 bg-green-100 rounded text-sm border-l-4 border-green-400">
                     <p className="font-medium text-green-800">💡 მნიშვნელოვანი:</p>
                     <p className="text-green-700">მარცხენა და მარჯვენა მხარეები შეიძლება იყოს სხვადასხვა რაოდენობა. ყოველი ელემენტი უნდა იყოს უნიკალური (არ უნდა იყოს ერთნაირი სხვა ელემენტებთან).</p>
                   </div>

                   {/* Correct Answer Display for MATCHING */}
                   <div className="mt-4 p-3 bg-blue-100 rounded text-sm border-l-4 border-blue-400">
                     <p className="font-medium text-blue-800">✅ სწორი პასუხი:</p>
                     <p className="text-blue-700">შესაბამისობის წყვილები ავტომატურად გაითვლება სწორად</p>
                     <p className="text-blue-600 text-xs mt-1">სისტემა ავტომატურად ადგენს სწორ პასუხს თქვენი შეყვანილი წყვილების მიხედვით</p>
                   </div>
                 </div>
               )}



                             {/* Sub-questions Section for TEXT_ANALYSIS and MAP_ANALYSIS */}
               {(formData.type === 'TEXT_ANALYSIS' || formData.type === 'MAP_ANALYSIS') && (
                 <div className="md:col-span-2 pt-6 bg-purple-50 p-4 rounded-lg">
                   <div className="flex justify-between items-center mb-4">
                     <h4 className="text-lg font-bold text-black md:text-[18px] text-[16px]">
                       კითხვის დამატება
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

                         {/* Question Type Selection */}
                         <div className="mb-3">
                           <label className="block text-sm font-medium text-black md:text-[16px] text-[14px] mb-2">
                             კითხვის სახეობა
                           </label>
                           <select
                             value={subQuestion.type}
                             onChange={(e) => handleSubQuestionChange(index, 'type', e.target.value)}
                             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 md:text-[16px] text-[14px]"
                           >
                             <option value="CLOSED_ENDED">1. დახურული კითხვა</option>
                             <option value="OPEN_ENDED">2. ღია კითხვა</option>
                           </select>
                         </div>

                         {/* Question Text */}
                         <div className="mb-3">
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

                         {/* Points */}
                         <div className="mb-3">
                           <label className="block text-sm font-medium text-black md:text-[16px] text-[14px] mb-2">
                             ქულა *
                           </label>
                           <input
                             type="number"
                             value={subQuestion.points}
                             onChange={(e) => handleSubQuestionChange(index, 'points', parseInt(e.target.value) || 1)}
                             min="1"
                             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 md:text-[16px] text-[14px]"
                           />
                         </div>


                         {/* Options for CLOSED_ENDED questions */}
                         {subQuestion.type === 'CLOSED_ENDED' && (
                           <div className="bg-blue-50 p-3 rounded border border-blue-200">
                             <div className="flex justify-between items-center mb-3">
                               <h6 className="text-sm font-medium text-blue-800 md:text-[14px] text-[12px]">
                                 პასუხის ვარიანტები
                               </h6>
                               <button
                                 type="button"
                                 onClick={() => handleAddSubQuestionOption(index)}
                                 disabled={(subQuestion.options?.length || 0) >= 6}
                                 className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-2 py-1 rounded text-xs font-medium"
                               >
                                 ვარიანტის დამატება
                               </button>
                             </div>

                             <div className="space-y-2">
                               {(subQuestion.options || ['', '', '', '']).map((option, optionIndex) => (
                                 <div key={optionIndex} className="flex items-center space-x-2">
                                   <span className="text-xs text-blue-700 min-w-[60px]">
                                     ვარიანტი {optionIndex + 1}:
                                   </span>
                                   <input
                                     type="text"
                                     value={option}
                                     onChange={(e) => handleSubQuestionOptionChange(index, optionIndex, e.target.value)}
                                     placeholder={`შეიყვანეთ პასუხის ვარიანტი ${optionIndex + 1}...`}
                                     className="flex-1 px-2 py-1 border border-blue-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                   />
                                   <button
                                     type="button"
                                     onClick={() => handleRemoveSubQuestionOption(index, optionIndex)}
                                     disabled={(subQuestion.options?.length || 0) <= 2}
                                     className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white px-2 py-1 rounded text-[16px] font-medium"
                                   >
                                     წაშლა
                                   </button>
                                 </div>
                               ))}
                             </div>

                             {/* Correct Answer Selection */}
                             <div className="mt-3">
                               <label className="block text-sm font-medium text-blue-800 md:text-[14px] text-[12px] mb-2">
                                 სწორი პასუხი *
                               </label>
                               <select
                                 value={subQuestion.correctAnswer}
                                 onChange={(e) => handleSubQuestionChange(index, 'correctAnswer', e.target.value)}
                                 className="w-full px-2 py-1 border border-blue-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                               >
                                 <option value="">აირჩიეთ სწორი პასუხი</option>
                                 {(subQuestion.options || ['', '', '', '']).map((option, optionIndex) => (
                                   <option key={optionIndex} value={option}>
                                     {option || `ვარიანტი ${optionIndex + 1}`}
                                   </option>
                                 ))}
                               </select>
                             </div>
                           </div>
                         )}

                         {/* Answer Template for Open-ended Sub-questions */}
                         {subQuestion.type === 'OPEN_ENDED' && (
                           <div className="mt-3">
                             <label className="block text-sm font-medium text-purple-800 mb-2">
                               პასუხის შაბლონი (მასწავლებლებისთვის) *
                             </label>
                             <textarea
                               value={subQuestion.answerTemplate || ''}
                               onChange={(e) => handleSubQuestionChange(index, 'answerTemplate', e.target.value)}
                               rows={3}
                               className="w-full px-3 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 md:text-[16px] text-[14px]"
                               placeholder="შეიყვანეთ პასუხის შაბლონი ან მაგალითი, რომელიც დაეხმარება მასწავლებლებს შეფასებაში..."
                             />
                             <p className="text-xs text-purple-600 mt-1">
                               ეს შაბლონი მხოლოდ მასწავლებლებს და ადმინებს ჩანს ტესტების შეფასებისას
                             </p>
                           </div>
                         )}
                       </div>
                     ))}
                   </div>

                   {formData.subQuestions.length === 0 && (
                     <div className="text-center py-6 text-gray-500">
                       <p className="md:text-[16px] text-[14px]">
                         ქვეკითხვები ჯერ არ არის დამატებული
                       </p>
                       <p className="text-sm mt-1">
                         დააჭირეთ ქვეკითხვის დამატება ღილაკს
                       </p>
                     </div>
                   )}
                 </div>
               )}

               {/* Answer Template for Open-ended Questions */}
               {formData.type === 'OPEN_ENDED' && (
                 <div className="mt-4">
                   <label className="block text-sm font-medium text-purple-800 mb-2">
                     პასუხის შაბლონი (მასწავლებლებისთვის) *
                   </label>
                   <textarea
                     name="answerTemplate"
                     value={formData.answerTemplate}
                     onChange={handleInputChange}
                     rows={4}
                     className="w-full px-3 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 md:text-[16px] text-[14px]"
                     placeholder="შეიყვანეთ პასუხის შაბლონი ან მაგალითი, რომელიც დაეხმარება მასწავლებლებს შეფასებაში..."
                   />
                   <p className="text-xs text-purple-600 mt-1">
                     ეს შაბლონი მხოლოდ მასწავლებლებს და ადმინებს ჩანს ტესტების შეფასებისას
                   </p>
                 </div>
               )}

              <div className="mt-6 flex gap-4">
                <button
                  type="submit"
                  className="bg-[#034e64] cursor-pointer text-white px-4 py-2 rounded-md md:text-[20px] text-[16px] font-bold transition-colors hover:bg-[#023a4d]"
                >
                                     {editingQuestionId 
                     ? 'კითხვის განახლება' 
                     : (profile?.canCreateQuestions ? 'კითხვის შექმნა' : 'კითხვის გაგზავნა')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false)
                    setShowSubmitForm(false)
                    setEditingQuestionId(null)
                    resetForm()
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md md:text-[20px] text-[16px] font-bold"
                >
                  გაუქმება
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Questions List */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
                         <h2 className="text-black md:text-[20px] text-[18px] font-semibold">
               {profile?.canCreateQuestions ? 'თქვენი კითხვები' : 'გაგზავნილი კითხვები'} ({filteredQuestions.length})
             </h2>
          </div>
          
          <div className="p-6">
            {loading ? (
              <div className="text-center py-8">
                <p className="text-black md:text-[20px] text-[18px]">იტვირთება...</p>
              </div>
                         ) : filteredQuestions.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                                 <p className="text-black md:text-[20px] text-[18px] mb-4">
                   {profile?.canCreateQuestions ? 'ჯერ არ გაქვთ მიმდინარე კითხვები' : 'ჯერ არ გაქვთ გაგზავნილი კითხვები'}
                 </p>
                <button
                  onClick={() => profile?.canCreateQuestions ? setShowCreateForm(true) : setShowSubmitForm(true)}
                  className="bg-[#034e64] cursor-pointer text-white px-4 py-2 rounded-md md:text-[20px] text-[16px] font-bold transition-colors hover:bg-[#023a4d]"
                >
                  {profile?.canCreateQuestions ? 'პირველი კითხვის დამატება' : 'პირველი კითხვის გაგზავნა'}
                </button>
              </div>
            ) : (
                             <div className="space-y-4">
                 {filteredQuestions.map((question) => (
                  <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-black md:text-[20px] text-[18px] font-semibold mb-2">
                          {question.text}
                        </h3>
                                                 <div className="flex gap-2 text-sm mb-2">
                           <span className="bg-gray-200 px-2 py-1 rounded text-black md:text-[16px] text-[14px]">
                             {getQuestionTypeLabel(question.type)}
                           </span>
                           <span className="bg-gray-200 px-2 py-1 rounded text-black md:text-[16px] text-[14px]">
                             კლასი {question.grade}
                           </span>
                           <span className="bg-gray-200 px-2 py-1 rounded text-black md:text-[16px] text-[14px]">
                             რაუნდი {question.round}
                           </span>
                           {question.chapterName && (
                             <span className="bg-blue-200 px-2 py-1 rounded text-blue-800 md:text-[16px] text-[14px]">
                               {question.chapterName}
                             </span>
                           )}
                           {question.paragraphName && (
                             <span className="bg-green-200 px-2 py-1 rounded text-green-800 md:text-[16px] text-[14px]">
                               {question.paragraphName}
                             </span>
                           )}
                           {question.isReported && (
                             <span className="bg-red-200 px-2 py-1 rounded text-red-800 md:text-[16px] text-[14px]">
                               დარეპორტებული
                             </span>
                           )}
                         </div>
                        <p className="text-black md:text-[16px] text-[14px] text-gray-500">
                          {new Date(question.createdAt).toLocaleDateString('ka-GE')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      {profile?.canCreateQuestions && !question.isReported && (
                        <>
                          <button 
                            onClick={() => handleEditQuestion(question.id)}
                            className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded-md md:text-[16px] text-[14px] font-bold"
                          >
                            რედაქტირება
                          </button>
                          <button 
                            onClick={() => handleDeleteQuestion(question.id)}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md md:text-[16px] text-[14px] font-bold"
                          >
                            წაშლა
                          </button>
                        </>
                      )}
                      {!question.isReported && (
                        <button 
                          onClick={() => {
                            const reason = prompt('შეიყვანეთ რეპორტის მიზეზი:')
                            if (reason) {
                              handleReportQuestion(question.id, reason)
                            }
                          }}
                          className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded-md md:text-[16px] text-[14px] font-bold"
                        >
                          რეპორტი
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function TeacherQuestionsPage() {
  return (
    <TeacherOnly>
      <TeacherQuestionsContent />
    </TeacherOnly>
  )
}
