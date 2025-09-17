'use client'

import { useAuth } from '@/hooks/useAuth'
import { AdminOnly } from '@/components/auth/ProtectedRoute'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import ImageUpload from '@/component/CloudinaryUploader'
import ImageModal from '@/components/ImageModal'
import { numberToGeorgianLetter, numberToGeorgianQuestionNumber, numberToGeorgianOptionLabel } from '@/utils/georgianLetters'

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
  answerTemplate?: string
  points: number
  maxPoints?: number
  image?: string[]
  matchingPairs?: Array<{ left: string, leftImage?: string, right: string, rightImage?: string }>
  leftSide?: Array<{ left: string, leftImage?: string }>
  rightSide?: Array<{ right: string, rightImage?: string }>
  subjectId: string
  subject?: {
    id: string
    name: string
  }
  chapterId?: string
  paragraphId?: string
  chapterName?: string
  paragraphName?: string
  grade: number
  round: number
  isAutoScored: boolean
  createdAt: string
  subQuestions?: SubQuestion[] // Add this field
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
  answerTemplate?: string
  points: number
  maxPoints?: number
  isAutoScored: boolean
  image?: string
}

function AdminQuestionsContent() {
  const { user } = useAuth()
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Helper function to display subject name with abbreviation
  const getDisplaySubjectName = (subjectName: string) => {
    if (subjectName === 'ერთიანი ეროვნული გამოცდები') {
      return 'ე.ე.გ'
    }
    return subjectName
  }
  const [showAddForm, setShowAddForm] = useState(false)
  const [activeTab, setActiveTab] = useState<'all' | 'matching' | 'text-analysis' | 'map-analysis' | 'open-ended' | 'closed-ended'>('all')
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
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 30

  // Form state
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
    matchingPairs: Array<{ left: string, leftImage?: string, right: string, rightImage?: string }>
    leftSide: Array<{ left: string, leftImage?: string }>
    rightSide: Array<{ right: string, rightImage?: string }>
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
    answerTemplate: '',
    points: 1,
    maxPoints: 1,
    image: [],
    matchingPairs: [{ left: '', leftImage: undefined, right: '', rightImage: undefined }],
    leftSide: [{ left: '', leftImage: undefined}],
    rightSide: [{ right: '', rightImage: undefined}],
    subjectId: '',
    chapterName: '',
    paragraphName: '',
    grade: 7,
    round: 1,
    isAutoScored: false,
    subQuestions: []
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

  

  const editQuestion = (question: Question) => {
    setEditingQuestion(question)
    setFormData({
      text: question.text,
      type: question.type,
      options: question.options,
      imageOptions: question.imageOptions || ['', '', '', ''],
      useImageOptions: !!(question.imageOptions && question.imageOptions.length > 0 && question.imageOptions.some((img: string) => img !== '')),
      correctAnswer: question.correctAnswer || '',
      answerTemplate: question.answerTemplate || '',
      points: question.points,
      maxPoints: question.maxPoints || question.points,
      image: question.image || [],
      matchingPairs: question.matchingPairs?.map(pair => ({
        left: pair.left,
        leftImage: pair.leftImage,
        right: pair.right,
        rightImage: pair.rightImage
      })) || [{ left: '', leftImage: undefined, right: '', rightImage: undefined }],
      leftSide: question.leftSide || [{ left: '', leftImage: undefined}],
      rightSide: question.rightSide || [{ right: '', rightImage: undefined}],
      subjectId: question.subjectId,
      chapterName: question.chapterName || '',
      paragraphName: question.paragraphName || '',
      grade: question.grade,
      round: question.round,
      isAutoScored: question.isAutoScored,
      subQuestions: question.subQuestions || []
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

 
  const handleAddLeftSide = () => {
    setFormData(prev => ({
      ...prev,
      leftSide: [...prev.leftSide, { left: '', leftImage: undefined }]
    }))
  }

  const handleAddRightSide = () => {
    setFormData(prev => ({
      ...prev,
      rightSide: [...prev.rightSide, { right: '', rightImage: undefined }]
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
    const newSubQuestion: SubQuestion = {
      id: `temp-${Date.now()}`,
      text: '',
      type: formData.type === 'OPEN_ENDED' ? 'OPEN_ENDED' : 'CLOSED_ENDED',
      options: ['', '', '', ''],
      correctAnswer: '',
      answerTemplate: '',
      points: 1,
      maxPoints: 1,
      isAutoScored: false,
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
      // For MATCHING questions, clear correctAnswer to allow manual input
      correctAnswer: type === 'MATCHING' ? '' : prev.correctAnswer,
      // Clear sub-questions if switching away from TEXT_ANALYSIS, MAP_ANALYSIS, or OPEN_ENDED
      subQuestions: (type === 'TEXT_ANALYSIS' || type === 'MAP_ANALYSIS' || type === 'OPEN_ENDED') ? prev.subQuestions : []
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
        alert('ტექსტის ანალიზის და რუკის ანალიზის კითხვებს უნდა ჰქონდეთ მინიმუმ ერთი ქვეკითხვა')
        return
      }

      // Validate OPEN_ENDED questions - sub-questions are optional
      // No validation needed for OPEN_ENDED questions - they can exist without sub-questions

      // Validate MATCHING questions
      if (formData.type === 'MATCHING') {
        if (!formData.leftSide || formData.leftSide.length === 0 || !formData.rightSide || formData.rightSide.length === 0) {
          alert('შესაბამისობის კითხვებს უნდა ჰქონდეთ მინიმუმ ერთი მარცხენა და ერთი მარჯვენა მნიშვნელობა')
          return
        }
    
        if (!formData.correctAnswer || formData.correctAnswer.trim() === '') {
          alert('შესაბამისობის კითხვებს უნდა ჰქონდეთ სწორი პასუხი')
          return
        }
        
        const pairs = formData.correctAnswer.split(',').filter(pair => pair.trim() !== '')
        const leftCount = formData.leftSide.length
        const rightCount = formData.rightSide.length
        
        // Allow partial answers - not all left items need to have answers
        if (pairs.length === 0) {
          alert('სწორი პასუხი უნდა შეიცავდეს მინიმუმ ერთ წყვილს. გთხოვთ აირჩიოთ პასუხები dropdown-ებიდან')
          return
        }
        
        // Allow duplicate right side answers (multiple left items can match to same right item)
        // This is valid for matching questions where multiple left items can have the same right answer
        
        // Validate that all pairs have correct format
        for (let i = 0; i < pairs.length; i++) {
          const pair = pairs[i].trim()
          
          // Check if pair contains colon
          if (!pair.includes(':')) {
            alert(`წყვილი ${i + 1} არასწორი ფორმატისაა. გთხოვთ აირჩიოთ პასუხები dropdown-ებიდან\n\nმიმდინარე: "${pair}"`)
            return
          }
          
          const parts = pair.split(':')
          if (parts.length !== 2) {
            alert(`წყვილი ${i + 1} არასწორი ფორმატისაა. გთხოვთ აირჩიოთ პასუხები dropdown-ებიდან\n\nმიმდინარე: "${pair}"`)
            return
          }
          
          const leftPart = parts[0].trim()
          const rightPart = parts[1].trim()
          
          if (!leftPart || !rightPart) {
            alert(`წყვილი ${i + 1} არასწორი ფორმატისაა. გთხოვთ აირჩიოთ პასუხები dropdown-ებიდან\n\nმიმდინარე: "${pair}"`)
            return
          }
          
          // Check if left part exists in the left side options
          const leftExists = formData.leftSide.some(leftItem => leftItem.left === leftPart)
          if (!leftExists) {
            alert(`წყვილი ${i + 1}: მარცხენა მხარე "${leftPart}" არ არსებობს მარცხენა მხარის ვარიანტებში. გთხოვთ აირჩიოთ პასუხები dropdown-ებიდან`)
            return
          }
          
          // Check if right part exists in the right side options
          const rightExists = formData.rightSide.some(rightItem => rightItem.right === rightPart)
          if (!rightExists) {
            alert(`წყვილი ${i + 1}: მარჯვენა პასუხი "${rightPart}" არ არსებობს მარჯვენა მხარის ვარიანტებში. გთხოვთ აირჩიოთ პასუხები dropdown-ებიდან`)
            return
          }
        }
        
        // Check for duplicate left side letters (each left item should only appear once in correct answer)
        const leftLetters = pairs.map(pair => pair.split(':')[0].trim()).filter(letter => letter)
        const uniqueLeftLetters = new Set(leftLetters)
        if (leftLetters.length !== uniqueLeftLetters.size) {
          alert('მარცხენა მხარეებში არ უნდა იყოს გამეორებული ასოები სწორ პასუხში. გთხოვთ აირჩიოთ პასუხები dropdown-ებიდან')
          return
        }
        
        // Check if all left letters are valid Georgian letters
        for (const letter of leftLetters) {
          const georgianLetterCode = letter.charCodeAt(0)
          if (georgianLetterCode < 4304 || georgianLetterCode > 4336) {
            alert(`მარცხენა მხარე "${letter}" არ არის ვალიდური ქართული ასო. გთხოვთ აირჩიოთ პასუხები dropdown-ებიდან`)
            return
          }
        }
        
        // Validate left side items
        const leftValues = new Set()
        console.log('Validating left side items:', formData.leftSide)
        for (let i = 0; i < formData.leftSide.length; i++) {
          const leftPair = formData.leftSide[i]
          console.log(`Left side item ${i + 1}:`, leftPair)
          if (!leftPair.left.trim() && !leftPair.leftImage) {
            alert(`მარცხენა მხარე ${i + 1} უნდა ჰქონდეს ტექსტი ან სურათი`)
            return
          }
          
          // Check for duplicates in left side
          const leftValue = leftPair.left.trim() || leftPair.leftImage
          console.log(`Left side value ${i + 1}:`, leftValue)
          console.log('Current left values:', Array.from(leftValues))
          if (leftValues.has(leftValue)) {
            alert(`მარცხენა მხარე ${i + 1} არ უნდა იყოს ერთნაირი სხვა მარცხენა მხარეებთან`)
            return
          }
          leftValues.add(leftValue)
        }
        
        // Validate right side items
        const rightValues = new Set()
        console.log('Validating right side items:', formData.rightSide)
        for (let i = 0; i < formData.rightSide.length; i++) {
          const rightPair = formData.rightSide[i]
          console.log(`Right side item ${i + 1}:`, rightPair)
          if (!rightPair.right.trim() && !rightPair.rightImage) {
            alert(`მარჯვენა მხარე ${i + 1} უნდა ჰქონდეს ტექსტი ან სურათი`)
            return
          }
          
          // Check for duplicates in right side
          const rightValue = rightPair.right.trim() || rightPair.rightImage
          console.log(`Right side value ${i + 1}:`, rightValue)
          console.log('Current right values:', Array.from(rightValues))
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
          
          // For OPEN_ENDED sub-questions, answer template is optional
          // No validation needed for answer template
        }
      }

      // Validate auto-scored questions (MATCHING validation is handled above)
      if (formData.isAutoScored && !formData.correctAnswer && formData.type !== 'MATCHING') {
        alert('ავტომატურად შეფასებულ კითხვებს უნდა ჰქონდეთ სწორი პასუხი')
        return
      }

      const url = editingQuestion
        ? `/api/admin/questions/${editingQuestion.id}`
        : '/api/admin/questions'

      const method = editingQuestion ? 'PUT' : 'POST'

    

      console.log('Submitting form data:', formData)
      console.log('Form data type:', formData.type)
      console.log('Form data leftSide:', formData.leftSide)
      console.log('Form data rightSide:', formData.rightSide)
      console.log('Form data correctAnswer:', formData.correctAnswer)

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      console.log('Response status:', response.status)
      console.log('Response headers:', Object.fromEntries(response.headers.entries()))
      console.log('Response ok:', response.ok)

      if (response.ok) {
        const message = editingQuestion ? 'კითხვა წარმატებით განახლდა!' : 'კითხვა წარმატებით დაემატა!'
        alert(message)
        setShowAddForm(false)
        resetForm()
        fetchQuestions()
      } else {
        const responseText = await response.text()
        console.log('Response text length:', responseText.length)
        console.log('Response text (first 500 chars):', responseText.substring(0, 500))
        console.log('Response text (last 500 chars):', responseText.substring(Math.max(0, responseText.length - 500)))
        
        let error
        try {
          if (responseText.trim() === '') {
            error = { message: `HTTP ${response.status}: Empty response from server` }
          } else if (responseText.startsWith('<!DOCTYPE') || responseText.startsWith('<html')) {
            error = { message: `HTTP ${response.status}: Server returned HTML instead of JSON. This usually means a server error.` }
          } else {
            error = JSON.parse(responseText)
          }
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError)
          console.error('Raw response text:', responseText)
          error = { message: `HTTP ${response.status}: Invalid response format - ${responseText.substring(0, 100)}...` }
        }
        
        console.error('API Error:', error)
        alert(`შეცდომა: ${error.message || 'Unknown error'}`)
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
      matchingPairs: [{ left: '', leftImage: undefined, right: '', rightImage: undefined }],
      leftSide: [{ left: '', leftImage: undefined}],
      rightSide: [{ right: '', rightImage: undefined}],
      subjectId: '',
      chapterName: '',
      paragraphName: '',
      grade: 7,
      round: 1,
      isAutoScored: false,
      subQuestions: []
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
    const currentPageQuestionIds = currentQuestions.map(q => q.id)
    const allCurrentSelected = currentPageQuestionIds.every(id => selectedQuestions.has(id))
    
    if (allCurrentSelected) {
      // Deselect all current page questions
      setSelectedQuestions(prev => {
        const newSet = new Set(prev)
        currentPageQuestionIds.forEach(id => newSet.delete(id))
        return newSet
      })
    } else {
      // Select all current page questions
      setSelectedQuestions(prev => {
        const newSet = new Set(prev)
        currentPageQuestionIds.forEach(id => newSet.add(id))
        return newSet
      })
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
    // Search filtering
    let matchesSearch = true
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim()
      
      // Simple and robust search across all fields
      matchesSearch =
        // Question text
        question.text.toLowerCase().includes(searchLower) ||
        
        // Subject name (including abbreviation)
        (question.subject?.name || '').toLowerCase().includes(searchLower) ||
        getDisplaySubjectName(question.subject?.name || '').toLowerCase().includes(searchLower) ||
        
        // Teacher name (first name, last name, or full name)
        (question.createdByTeacher?.name || '').toLowerCase().includes(searchLower) ||
        (question.createdByTeacher?.lastname || '').toLowerCase().includes(searchLower) ||
        `${question.createdByTeacher?.name || ''} ${question.createdByTeacher?.lastname || ''}`.toLowerCase().includes(searchLower) ||
        
        // Teacher school
        (question.createdByTeacher?.school || '').toLowerCase().includes(searchLower) ||
        
        // Teacher subject
        (question.createdByTeacher?.subject || '').toLowerCase().includes(searchLower) ||
        
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

      // Debug logging for search
      console.log(`Searching for: "${searchLower}"`)
      console.log(`Question: "${question.text.substring(0, 50)}..."`)
      console.log(`Search matches: ${matchesSearch}`)
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
      
      // Debug logging for tab filtering
      console.log(`Tab filtering: ${activeTab}, Question type: ${question.type}, matchesType: ${matchesType}`)
    }

    // Other filters
    const matchesSubject = !selectedSubject || question.subjectId === selectedSubject
    const matchesGrade = !selectedGrade || question.grade === parseInt(selectedGrade)
    const matchesRound = !selectedRound || question.round === parseInt(selectedRound)

    const finalResult = matchesSearch && matchesType && matchesSubject && matchesGrade && matchesRound
    
    // Debug logging for final result
    if (activeTab !== 'all' || searchTerm.trim()) {
      console.log(`Question "${question.text.substring(0, 30)}..." - Final result: ${finalResult}`)
      console.log(`  Search: ${matchesSearch}, Type: ${matchesType}, Subject: ${matchesSubject}, Grade: ${matchesGrade}, Round: ${matchesRound}`)
    }
    
    return finalResult
  })

  // Pagination logic
  const totalPages = Math.ceil(filteredQuestions.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentQuestions = filteredQuestions.slice(startIndex, endIndex)

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedSubject, selectedGrade, selectedRound, activeTab])

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
 console.log(questions);
 
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className=" mx-auto px-4 sm:px-6 lg:px-8">
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

      <div className=" mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Search */}
        <div className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                                 <input
                   type="text"
                   placeholder="მოძებნა: კითხვა, საგანი, მასწავლებელი, სკოლა, თავი (მაგ: 2), პარაგრაფი (მაგ: 1.2), კლასი (მაგ: 10 კლასი), რაუნდი (მაგ: 1 რაუნდი), ქულები, ტიპი..."
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   className="w-full md:text-[16px] text-[14px] text-black placeholder:text-black px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2  md:text-[18px] text-[16px]"
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
                value={selectedSubject || ''}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full md:text-[16px] text-[14px] text-black placeholder:text-black px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2  md:text-[18px] text-[16px]"
              >
                <option value="">ყველა საგანი</option>
                {subjects.map(subject => (
                  <option key={subject.id} value={subject.id}>{getDisplaySubjectName(subject.name)}</option>
                ))}
              </select>
            </div>
            <div>
              <select
                value={selectedGrade || ''}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="w-full md:text-[16px] text-[14px] text-black placeholder:text-black px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2  md:text-[18px] text-[16px]"
              >
                <option value="">ყველა კლასი</option>
                {[7, 8, 9, 10, 11, 12].map(grade => (
                  <option key={grade} value={grade}>{grade} კლასი</option>
                ))}
              </select>
            </div>
            <div>
              <select
                value={selectedRound || ''}
                onChange={(e) => setSelectedRound(e.target.value)}
                className="w-full md:text-[16px] text-[14px] text-black placeholder:text-black px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2  md:text-[18px] text-[16px]"
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
              onClick={() => {
                console.log('Tab clicked: all')
                setActiveTab('all')
              }}
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
                    მოქმედებები
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentQuestions.map((question) => (
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
                           {(() => {
                             const words = question.text.split(' ')
                             if (words.length > 3) {
                               return `${words.slice(0, 3).join(' ')}...`
                             }
                             return question.text
                           })()}
                         </div>
                         {question.image && question.image.length > 0 && (
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
                      {getDisplaySubjectName(question.subject?.name || 'უცნობი')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap  text-black md:text-[16px] text-[16px]">
                      {question.chapterName || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap  text-black md:text-[16px] text-[16px]">
                      {question.paragraphName || '-'}
                    </td>
                  
                  
                    <td className="px-6 py-4 whitespace-nowrap  text-black md:text-[16px] text-[16px]">
                      {question.grade}
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

          {/* Pagination */}
          {filteredQuestions.length > 0 && totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  წინა
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  შემდეგი
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    ნაჩვენებია <span className="font-medium">{startIndex + 1}</span> - <span className="font-medium">{Math.min(endIndex, filteredQuestions.length)}</span> 
                    {' '}ყველა <span className="font-medium">{filteredQuestions.length}</span> კითხვიდან
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">წინა</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    
                    {/* Page numbers */}
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNumber;
                      if (totalPages <= 5) {
                        pageNumber = i + 1;
                      } else if (currentPage <= 3) {
                        pageNumber = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNumber = totalPages - 4 + i;
                      } else {
                        pageNumber = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => setCurrentPage(pageNumber)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === pageNumber
                              ? 'z-10 bg-[#034e64] border-[#034e64] text-white'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">შემდეგი</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
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
                      onChange={(urls) => setFormData(prev => ({ ...prev, image: urls }))}
                      value={formData.image}
                    />
                  </div>

                  {/* Sub-questions Section for TEXT_ANALYSIS, MAP_ANALYSIS, and OPEN_ENDED */}
                  {(formData.type === 'TEXT_ANALYSIS' || formData.type === 'MAP_ANALYSIS' || formData.type === 'OPEN_ENDED') && (
                    <div className="md:col-span-2 pt-6 bg-purple-50 p-4 rounded-lg">
                      {/* Helpful notice */}
                      <div className="mb-4 p-3 bg-blue-100 border border-blue-300 rounded-lg">
                        <div className="flex items-start space-x-2">
                          <span className="text-blue-600 text-lg">💡</span>
                          <div>
                            <p className="text-sm font-medium text-blue-800 md:text-[14px] text-[12px]">
                              {formData.type === 'TEXT_ANALYSIS' ? 'ტექსტის ანალიზის' : 
                               formData.type === 'MAP_ANALYSIS' ? 'რუკის ანალიზის' : 
                               'ღია კითხვის'} კითხვისთვის საჭიროა:
                            </p>
                            <ul className="text-xs text-blue-700 mt-1 list-disc list-inside space-y-1">
                              {formData.type === 'OPEN_ENDED' ? (
                                <>
                                  <li>ღია კითხვებს შეუძლია ჰქონდეთ ქვეკითხვები ან მარტო პასუხის შაბლონი</li>
                                  <li>თუ ქვეკითხვებს დაამატებთ, პასუხის შაბლონი ავტომატურად დაიმალება</li>
                                  <li>ღია კითხვების ქვეკითხვები მხოლოდ ღია კითხვებია</li>
                                  <li>თითოეულ ქვეკითხვას უნდა ჰქონდეს ტექსტი, ქულები და პასუხის შაბლონი</li>
                                </>
                              ) : (
                                <>
                                  <li>მინიმუმ ერთი ქვეკითხვა</li>
                                  <li>თითოეულ ქვეკითხვას უნდა ჰქონდეს ტექსტი და ქულები</li>
                                  <li>დახურული კითხვებისთვის - პასუხის ვარიანტები და სწორი პასუხი</li>
                                </>
                              )}
                            </ul>
                          </div>
                        </div>
                      </div>

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
                                className="w-full text-black placeholder:text-black px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 md:text-[16px] text-[14px]"
                              >
                                {formData.type === 'OPEN_ENDED' ? (
                                  <option value="OPEN_ENDED">ღია კითხვა</option>
                                ) : (
                                  <>
                                    <option value="CLOSED_ENDED">1. დახურული კითხვა</option>
                                    <option value="OPEN_ENDED">2. ღია კითხვა</option>
                                  </>
                                )}
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
                                className="w-full px-3 py-2 text-black placeholder:text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 md:text-[16px] text-[14px]"
                              />
                            </div>

                            {/* Image Upload for Sub-Question */}
                            <div className="mb-3">
                              <label className="block text-sm font-medium text-black md:text-[16px] text-[14px] mb-2">
                                სურათი (არასავალდებულო)
                              </label>
                              <div className="space-y-2">
                                {subQuestion.image ? (
                                  <div className="relative">
                                    <img 
                                      src={subQuestion.image} 
                                      alt="Sub-question image" 
                                      className="w-full max-w-full sm:max-w-md h-auto rounded-lg border border-gray-300"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => handleSubQuestionChange(index, 'image', '')}
                                      className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
                                    >
                                      ×
                                    </button>
                                  </div>
                                ) : (
                                  <ImageUpload
                                    onChange={(urls) => handleSubQuestionChange(index, 'image', urls[0] || '')}
                                    value={subQuestion.image ? [subQuestion.image] : []}
                                  />
                                )}
                              </div>
                            </div>

                            {/* Points */}
                            <div className="mb-3">
                              <label className="block text-sm font-medium text-black md:text-[16px] text-[14px] mb-2">
                                ქულები *
                              </label>
                              <input
                                type="number"
                                value={subQuestion.points}
                                onChange={(e) => handleSubQuestionChange(index, 'points', parseInt(e.target.value) || 1)}
                                min="1"
                                className="w-full px-3 py-2 text-black placeholder:text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 md:text-[16px] text-[14px]"
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
                                    className="w-full text-black placeholder:text-black px-2 py-1 text-black placeholder:text-black border border-blue-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  >
                                    <option className="text-black" value="">აირჩიეთ სწორი პასუხი</option>
                                    {(subQuestion.options || ['', '', '', '']).map((option, optionIndex) => (
                                      <option className="text-black" key={optionIndex} value={option}>
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
                                  className="w-full text-black placeholder:text-black px-3 py-2 text-black placeholder:text-black border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 md:text-[16px] text-[14px]"
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

                  
                </div>

                {/* Options Section */}
                {formData.type === 'CLOSED_ENDED' && (
                  <div className="pt-6 bg-blue-50 p-4 rounded-lg">
                    {/* Image Options Toggle */}
                    <div className="mb-4 p-3 bg-white rounded border">
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={formData.useImageOptions}
                          onChange={(e) => setFormData(prev => ({ ...prev, useImageOptions: e.target.checked }))}
                          className="h-4 w-4 md:text-[16px] text-[14px] text-black placeholder:text-black border-gray-300 rounded"
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
                                    className="w-full max-w-full sm:max-w-md h-auto rounded-lg border border-gray-300"
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
                            className="w-full text-black placeholder:text-black px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 md:text-[16px] text-[14px]"
                          >
                            <option className="text-black" value="">აირჩიეთ სწორი სურათი</option>
                            {formData.imageOptions.map((imageOption, index) => (
                              <option className="text-black" key={index} value={imageOption}>
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
                  </div>
                )}



                {formData.type === 'MATCHING' && (
                  <div className=" pt-6 bg-green-50 p-4 rounded-lg">
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
                           onClick={handleAddLeftSide}
                           className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-[16px] font-medium"
                         >
                           მარცხენა მხარის დამატება
                         </button>
                         <button
                           type="button"
                           onClick={handleAddRightSide}
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
                                       className="w-full px-3 text-black placeholder:text-black py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 md:text-[16px] text-[14px]"
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
                                       className="w-full px-3 text-black placeholder:text-black py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 md:text-[16px] text-[14px]"
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

                     {/* Correct Answer Selection for MATCHING */}
                     <div className="mt-4">
                       <label className="block text-sm font-medium text-green-800 mb-2">
                         სწორი პასუხი *
                       </label>
                       <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                         <p className="text-sm text-green-700 mb-2">
                           შესაბამისობის კითხვებისთვის სწორი პასუხი ავტომატურად დაყენებულია:
                         </p>
                         <div className="bg-white p-2 rounded border">
                           <code className="text-green-800 font-mono text-sm">
                             {formData.leftSide.map((leftPair, index) => {
                               const rightPair = formData.rightSide[index]
                               return `${String.fromCharCode(4304 + index)} → ${rightPair?.right || '?'}`
                             }).join(', ')}
                           </code>
                         </div>
                         <p className="text-xs text-green-600 mt-2">
                           სისტემა ავტომატურად შეამოწმებს სტუდენტის პასუხს ამ წყვილების მიხედვით
                         </p>
                         
                         {/* View Correct Answer Button */}
                         <div className="mt-3 pt-3 border-t border-green-200">
                           <button
                             type="button"
                             onClick={() => {
                               const pairs = formData.leftSide
                                 .map((leftPair, index) => {
                                   const rightPair = formData.rightSide[index]
                                   return `${String.fromCharCode(4304 + index)} → ${rightPair?.right || '?'}`
                                 })
                                 .filter(pair => pair.includes('→') && !pair.includes('→ ?'))
                                 .join('\n')
                               
                               if (pairs) {
                                 alert(`✅ სწორი პასუხი:\n\n${pairs}\n\nსისტემა ავტომატურად შეამოწმებს ამ წყვილების მიხედვით!`)
                               } else {
                                 alert('⚠️ გთხოვთ შეიყვანოთ შესაბამისობის წყვილები!')
                               }
                             }}
                             className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-medium"
                           >
                             👁️ სწორი პასუხის ნახვა
                           </button>
                           <p className="text-xs text-green-600 mt-1">
                             დააჭირეთ ღილაკს რომ დაინახოთ სწორი პასუხი
                           </p>
                         </div>
                       </div>
                     </div>

                     {/* Scoring Information */}
                     <div className="mt-4 p-3 bg-yellow-100 rounded text-sm border-l-4 border-yellow-400">
                       <p className="font-medium text-yellow-800">📊 ქულების გამოთვლა:</p>
                       <p className="text-yellow-700">ქულები გამოითვლება პროპორციულად სწორი პასუხების რაოდენობისა</p>
                       <div className="mt-2 text-xs text-yellow-600">
                         <p>• {Math.min(formData.leftSide.length, formData.rightSide.length)} სწორი = {formData.points} ქულა (100%)</p>
                         <p>• {Math.ceil(Math.min(formData.leftSide.length, formData.rightSide.length) / 2)} სწორი = {Math.ceil(formData.points / 2)} ქულა (50%)</p>
                         <p>• 1 სწორი = 1 ქულა ({(1 / Math.min(formData.leftSide.length, formData.rightSide.length) * 100).toFixed(1)}%)</p>
                       </div>
                     </div>
                   </div>
                 )}

              
                {/* Correct Answer Selection */}
                {formData.type === 'CLOSED_ENDED' && !formData.useImageOptions && (
                  <div>
                    <label className="block text-sm font-medium text-black md:text-[18px] text-[16px] mb-2">
                      სწორი პასუხი *
                    </label>
                    <select
                      name="correctAnswer"
                      required
                      value={formData.correctAnswer}
                      onChange={handleInputChange}
                      className="w-full text-black placeholder:text-black px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2  md:text-[18px] text-[16px]"
                    >
                      <option className="text-black" value="">აირჩიეთ სწორი პასუხი</option>
                      {formData.options.map((option, index) => (
                        <option className="text-black" key={index} value={option}>
                          {option || `ვარიანტი ${index + 1}`}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Correct Answer - Only for Auto-scored Questions (other types) */}
                {formData.isAutoScored && formData.type !== 'CLOSED_ENDED' && (
                  <div>
                    <label className="block text-sm font-medium text-black md:text-[18px] text-[16px] mb-2">
                      სწორი პასუხი *
                    </label>
                    {formData.type === 'MATCHING' ? (
                      <div className="space-y-4">
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <h5 className="font-medium text-blue-800 mb-3">სწორი პასუხის მითითება შესაბამისობისთვის:</h5>
                          <p className="text-sm text-blue-700 mb-3">
                            აირჩიეთ თითოეული მარცხენა მხარისთვის შესაბამისი მარჯვენა პასუხი
                            <br />
                            <span className="text-xs text-blue-600">
                              💡 შეიძლება გამეორებული პასუხები (მაგ: &quot;ა&quot; და &quot;ბ&quot; ორივე შეიძლება ჰქონდეს პასუხი &quot;1&quot;)
                              <br />
                              💡 შეიძლება ნებისმიერი წყვილი
                            </span>
                          </p>
                          <div className="space-y-3">
                            {formData.leftSide.map((leftItem, index) => (
                              <div key={index} className="flex items-center space-x-3 p-3 bg-white rounded-lg border">
                                <span className="text-sm font-medium text-gray-600 min-w-[30px]">
                                  {index + 1}:
                                </span>
                                <span className="text-gray-900 flex-1">
                                  {leftItem.left || `მარცხენა ${index + 1}`}
                                </span>
                                <span className="text-gray-500">→</span>
                                <select
                                  value={(() => {
                                    const leftText = formData.leftSide[index]?.left
                                    if (!leftText || !formData.correctAnswer) return ''
                                    const pair = formData.correctAnswer.split(',').find(p => p.startsWith(leftText + ':'))
                                    if (pair) {
                                      const rightText = pair.split(':')[1]
                                      const rightIndex = formData.rightSide.findIndex(right => right.right === rightText)
                                      return rightIndex >= 0 ? (rightIndex + 1).toString() : ''
                                    }
                                    return ''
                                  })()}
                                  onChange={(e) => {
                                    const currentAnswer = formData.correctAnswer || ''
                                    const leftText = formData.leftSide[index]?.left
                                    const pairs = currentAnswer ? currentAnswer.split(',').filter(pair => !pair.startsWith(leftText + ':')) : []
                                    if (e.target.value) {
                                      const rightText = formData.rightSide[parseInt(e.target.value) - 1]?.right
                                      if (leftText && rightText) {
                                        pairs.push(`${leftText}:${rightText}`)
                                      }
                                    }
                                    setFormData(prev => ({
                                      ...prev,
                                      correctAnswer: pairs.join(',')
                                    }))
                                  }}
                                  className="px-3 py-2 text-black placeholder:text-black border border-gray-300 rounded text-sm min-w-[120px]"
                                >
                                  <option className="text-black" value="">აირჩიეთ პასუხი</option>
                                  {formData.rightSide.map((rightItem, rightIndex) => (
                                    <option className="text-black" key={rightIndex} value={rightIndex + 1}>
                                      {rightIndex + 1}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            ))}
                          </div>
                          <div className="mt-4 p-3 bg-white rounded border">
                            <label className="block  font-medium text-black md:text-[16px] text-[14px] text-gray-600 mb-2">
                              სწორი პასუხი (ავტომატური):
                            </label>
                            <div className="text-black placeholder:text-black md:text-[16px] text-[14px] font-mono bg-gray-50 p-2 rounded border">
                              {formData.correctAnswer ? formData.correctAnswer.replace(/:/g, ' → ').replace(/,/g, ', ') : 'ჯერ არ არის არჩეული'}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <input
                        type="text"
                        name="correctAnswer"
                        required
                        value={formData.correctAnswer}
                        onChange={handleInputChange}
                        className="w-full text-black placeholder:text-black px-3 py-2 text-black placeholder:text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2  md:text-[18px] text-[16px]"
                        placeholder="შეიყვანეთ სწორი პასუხი..."
                      />
                    )}
                  </div>
                )}

                {/* Answer Template for Open-ended Questions (only when no sub-questions) */}
                {formData.type === 'OPEN_ENDED' && (!formData.subQuestions || formData.subQuestions.length === 0) && (
                  <div className="mt-4">
                    <label className="block text-black md:text-[18px] text-[16px] font-medium text-purple-800 mb-2">
                      პასუხის შაბლონი (მასწავლებლებისთვის) *
                    </label>
                    <textarea
                      name="answerTemplate"
                     
                      value={formData.answerTemplate}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full text-black placeholder:text-black px-3 py-2 text-black placeholder:text-black border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 md:text-[16px] text-[14px]"
                      placeholder="შეიყვანეთ პასუხის შაბლონი ან მაგალითი, რომელიც დაეხმარება მასწავლებლებს შეფასებაში..."
                    />
                    <p className="text-xs text-purple-600 mt-1">
                      ეს შაბლონი მხოლოდ მასწავლებლებს და ადმინებს ჩანს ტესტების შეფასებისას
                    </p>
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
                                             გამსწორებელი ან მასწავლებელი ხელით მიანიჭებს ქულას შეფასების კრიტერიუმების მიხედვით.
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
