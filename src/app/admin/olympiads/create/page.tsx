'use client'

import { useAuth } from '@/hooks/useAuth'
import { AdminOnly } from '@/components/auth/ProtectedRoute'
import Link from 'next/link'
import { useState, useEffect } from 'react'

interface QuestionPackage {
  id: string
  name: string
  description: string
  questions: {
    question: {
      subject: {
        name: string
      }
      grade: number
    }
  }[]
  createdByUser: {
    name: string
    lastname: string
  }
}

interface OlympiadFormData {
  name: string
  description: string
  startDate: string
  startTime: string
  endDate: string
  endTime: string
  registrationDeadline: string
  maxParticipants: number
  isActive: boolean
  subjects: string[]
  grades: number[]
  rounds: number
  packages: string[] // Array of package IDs
  questionTypes: string[]
  questionTypeQuantities: Record<string, number>
  questionTypeOrder: string[] // Array to store the order of question types
  minimumPointsThreshold: number
}

function CreateOlympiadContent() {
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [packages, setPackages] = useState<QuestionPackage[]>([])
  const [isLoadingPackages, setIsLoadingPackages] = useState(true)
  const [formData, setFormData] = useState<OlympiadFormData>({
    name: '',
    description: '',
    startDate: '',
    startTime: '09:00',
    endDate: '',
    endTime: '17:00',
    registrationDeadline: '',
    maxParticipants: 100,
    isActive: true,
    subjects: [],
    grades: [7, 8, 9, 10, 11, 12],
    rounds: 3,
    packages: [],
    questionTypes: [],
    questionTypeQuantities: {},
    questionTypeOrder: [],
    minimumPointsThreshold: 0
  })

  const availableSubjects = [
    'მათემატიკა',
    'ფიზიკა',
    'ქიმია',
    'ბიოლოგია',
    'ისტორია',
    'გეოგრაფია',
    'ქართული ენა',
    'ინგლისური ენა',
    'ერთიანი ეროვნული გამოცდები'
  ]

  const availableQuestionTypes = [
    { value: 'MATCHING', label: 'შესაბამისობა' },
    { value: 'TEXT_ANALYSIS', label: 'ტექსტის ანალიზი' },
    { value: 'MAP_ANALYSIS', label: 'რუკის ანალიზი' },
    { value: 'OPEN_ENDED', label: 'ღია კითხვა' },
    { value: 'CLOSED_ENDED', label: 'დახურული კითხვა' }
  ]

  // Fetch available packages
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setIsLoadingPackages(true)
        const response = await fetch('/api/admin/question-packages')
        if (response.ok) {
          const data = await response.json()
          setPackages(data.packages || [])
        }
      } catch (error) {
        console.error('Error fetching packages:', error)
      } finally {
        setIsLoadingPackages(false)
      }
    }

    if (user) {
      fetchPackages()
    }
  }, [user])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }))
    } else if (type === 'number') {
      setFormData(prev => ({
        ...prev,
        [name]: parseInt(value) || 0
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleSubjectToggle = (subject: string) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject]
    }))
  }

  const handleGradeToggle = (grade: number) => {
    setFormData(prev => ({
      ...prev,
      grades: prev.grades.includes(grade)
        ? prev.grades.filter(g => g !== grade)
        : [...prev.grades, grade]
    }))
  }

  const handlePackageToggle = (packageId: string) => {
    setFormData(prev => ({
      ...prev,
      packages: prev.packages.includes(packageId)
        ? prev.packages.filter(p => p !== packageId)
        : [...prev.packages, packageId]
    }))
  }

  const handleQuestionTypeToggle = (questionType: string) => {
    setFormData(prev => {
      const isCurrentlySelected = prev.questionTypes.includes(questionType)
      
      if (isCurrentlySelected) {
        // Remove from all arrays
        const newQuantities = { ...prev.questionTypeQuantities }
        delete newQuantities[questionType]
        
        return {
          ...prev,
          questionTypes: prev.questionTypes.filter(qt => qt !== questionType),
          questionTypeQuantities: newQuantities,
          questionTypeOrder: prev.questionTypeOrder.filter(qt => qt !== questionType)
        }
      } else {
        // Add to all arrays
        return {
          ...prev,
          questionTypes: [...prev.questionTypes, questionType],
          questionTypeQuantities: { ...prev.questionTypeQuantities, [questionType]: 1 },
          questionTypeOrder: [...prev.questionTypeOrder, questionType]
        }
      }
    })
  }

  const moveQuestionTypeUp = (index: number) => {
    if (index === 0) return
    setFormData(prev => {
      const newOrder = [...prev.questionTypeOrder]
      const temp = newOrder[index]
      newOrder[index] = newOrder[index - 1]
      newOrder[index - 1] = temp
      return {
        ...prev,
        questionTypeOrder: newOrder
      }
    })
  }

  const moveQuestionTypeDown = (index: number) => {
    setFormData(prev => {
      if (index === prev.questionTypeOrder.length - 1) return prev
      const newOrder = [...prev.questionTypeOrder]
      const temp = newOrder[index]
      newOrder[index] = newOrder[index + 1]
      newOrder[index + 1] = temp
      return {
        ...prev,
        questionTypeOrder: newOrder
      }
    })
  }

  const handleQuantityChange = (questionType: string, quantity: number) => {
    setFormData(prev => ({
      ...prev,
      questionTypeQuantities: {
        ...prev.questionTypeQuantities,
        [questionType]: Math.max(0, quantity)
      }
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.subjects.length === 0) {
      alert('გთხოვთ აირჩიოთ მინიმუმ ერთი საგანი')
      return
    }

    if (formData.grades.length === 0) {
      alert('გთხოვთ აირჩიოთ მინიმუმ ერთი კლასი')
      return
    }

    if (formData.packages.length === 0) {
      alert('გთხოვთ აირჩიოთ მინიმუმ ერთი პაკეტი')
      return
    }

    if (formData.questionTypes.length === 0) {
      alert('გთხოვთ აირჩიოთ მინიმუმ ერთი კითხვის ტიპი')
      return
    }

    // Validate that selected packages match selected subjects and grades
    const selectedPackages = packages.filter(pkg => formData.packages.includes(pkg.id))
    const packageSubjects = new Set(selectedPackages.flatMap(pkg => 
      pkg.questions.map(q => q.question.subject.name)
    ))
    const packageGrades = new Set(selectedPackages.flatMap(pkg => 
      pkg.questions.map(q => q.question.grade)
    ))
    
    const hasMatchingSubjects = formData.subjects.some(subject => packageSubjects.has(subject))
    const hasMatchingGrades = formData.grades.some(grade => packageGrades.has(grade))
    
    if (!hasMatchingSubjects) {
      alert('არჩეული პაკეტები არ შეიცავენ არჩეულ საგნებს. გთხოვთ შეამოწმოთ პაკეტების შინაარსი.')
      return
    }
    
    if (!hasMatchingGrades) {
      alert('არჩეული პაკეტები არ შეიცავენ არჩეულ კლასებს. გთხოვთ შეამოწმოთ პაკეტების შინაარსი.')
      return
    }

    setIsSubmitting(true)
    
    try {
      // Combine date and time for start and end
      const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`).toISOString()
      const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`).toISOString()
      
      const response = await fetch('/api/admin/olympiads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          startDate: startDateTime,
          endDate: endDateTime
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'შეცდომა მოხდა ოლიმპიადის შექმნისას')
      }

      alert('ოლიმპიადა წარმატებით შეიქმნა!')
      
      // Redirect to olympiads list
      window.location.href = '/admin/olympiads'
      
    } catch (error) {
      console.error('Error creating olympiad:', error)
      alert(error instanceof Error ? error.message : 'შეცდომა მოხდა ოლიმპიადის შექმნისას')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      startDate: '',
      startTime: '09:00',
      endDate: '',
      endTime: '17:00',
      registrationDeadline: '',
      maxParticipants: 100,
      isActive: true,
      subjects: [],
      grades: [7, 8, 9, 10, 11, 12],
      rounds: 3,
      packages: [],
      questionTypes: [],
      questionTypeQuantities: {},
      questionTypeOrder: [],
      minimumPointsThreshold: 0
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-black md:text-[25px] text-[20px]">
                ახალი ოლიმპიადის შექმნა
              </h1>
              <p className="text-black md:text-[18px] text-[16px]">
                შექმენით ახალი ოლიმპიადა სისტემაში
              </p>
              {packages.length === 0 && (
                <div className="mt-2">
                  <Link
                    href="/admin/olympiads/packages"
                    className="inline-flex items-center px-3 py-1 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded-md text-sm font-medium"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    პაკეტის შექმნა
                  </Link>
                </div>
              )}
            </div>
            <Link
              href="/admin/olympiads"
              className="bg-[#034e64] cursor-pointer text-white px-4 py-2 rounded-md md:text-[20px] text-[16px] font-bold transition-colors hover:bg-[#023a4d]"
            >
              უკან დაბრუნება
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-black md:text-[22px] text-[18px]">
              ოლიმპიადის ინფორმაცია
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col h-full">
                <label className="block text-sm font-medium text-black md:text-[16px] text-[15px] mb-2">
                  ოლიმპიადის სახელი *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#034e64] text-black md:text-[18px] text-[16px] h-[42px]"
                  placeholder="შეიყვანეთ ოლიმპიადის სახელი..."
                />
              </div>

              <div className="flex flex-col h-full">
                <label className="block text-sm font-medium text-black md:text-[16px] text-[15px] mb-2">
                  მაქსიმალური მონაწილეების რაოდენობა *
                </label>
                <input
                  type="number"
                  name="maxParticipants"
                  required
                  min="1"
                  max="1000"
                  value={formData.maxParticipants}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#034e64] text-black md:text-[18px] text-[16px] h-[42px]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-black md:text-[16px] text-[15px] mb-2">
                აღწერა *
              </label>
              <textarea
                name="description"
                required
                rows={4}
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#034e64] text-black md:text-[18px] text-[16px]"
                placeholder="შეიყვანეთ ოლიმპიადის აღწერა..."
              />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col h-full">
                <label className="block text-sm font-medium text-black md:text-[18px] text-[16px] mb-2">
                  დაწყების თარიღი და დრო *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    name="startDate"
                    required
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#034e64] text-black md:text-[18px] text-[16px] h-[42px]"
                  />
                  <input
                    type="time"
                    name="startTime"
                    required
                    value={formData.startTime}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#034e64] text-black md:text-[18px] text-[16px] h-[42px]"
                  />
                </div>
              </div>

              <div className="flex flex-col h-full">
                <label className="block text-sm font-medium text-black md:text-[18px] text-[16px] mb-2">
                  დასრულების თარიღი და დრო *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    name="endDate"
                    required
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#034e64] text-black md:text-[18px] text-[16px] h-[42px]"
                  />
                  <input
                    type="time"
                    name="endTime"
                    required
                    value={formData.endTime}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#034e64] text-black md:text-[18px] text-[16px] h-[42px]"
                  />
                </div>
              </div>
            </div>

            {/* Registration Deadline */}
            <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
              <div className="flex flex-col h-full">
                <label className="block text-sm font-medium text-black md:text-[16px] text-[15px] mb-2">
                  რეგისტრაციის ბოლო თარიღი *
                </label>
                <input
                  type="date"
                  name="registrationDeadline"
                  required
                  value={formData.registrationDeadline}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#034e64] text-black md:text-[18px] text-[16px] h-[42px]"
                />
              </div>
            </div>

            {/* Settings */}
            <div className="flex flex-col gap-6">
              <div className="flex flex-col h-full">
                <label className="block text-sm font-medium text-black md:text-[18px] text-[16px] mb-2">
                  რაუნდების რაოდენობა *
                </label>
                <select
                  name="rounds"
                  required
                  value={formData.rounds || 1}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#034e64] text-black md:text-[18px] text-[16px] h-[42px]"
                >
                  <option value={1}>1 რაუნდი</option>
                  <option value={2}>2 რაუნდი</option>
                  <option value={3}>3 რაუნდი</option>
                </select>
              </div>

              <div className="flex flex-col h-full">
                <label className="block text-sm font-medium text-black md:text-[18px] text-[16px] mb-2">
                  მინიმალური ქულის ზღვარი (არასავალდებულო)
                </label>
                <input
                  type="number"
                  name="minimumPointsThreshold"
                  min="0"
                  max="100"
                  value={formData.minimumPointsThreshold}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#034e64] text-black md:text-[18px] text-[16px] h-[42px]"
                  placeholder="0"
                />
                <p className="text-xs text-gray-500 mt-1">
                  თუ მითითებულია, მოსწავლეები ავტომატურად გაივლიან ოლიმპიადას
                </p>
              </div>

              <div className="flex items-center h-full">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-[#034e64] focus:ring-[#034e64] border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-black md:text-[18px] text-[16px]">
                  ოლიმპიადა არის აქტიური
                </label>
              </div>
            </div>

            {/* Packages */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="block text-sm font-medium text-black md:text-[18px] text-[16px]">
                  პაკეტები *
                </label>
                <Link
                  href="/admin/olympiads/packages"
                  className="text-[#034e64] hover:text-[#023a4d] text-sm underline"
                >
                  პაკეტების მართვა
                </Link>
              </div>
              
              {isLoadingPackages ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#034e64] mx-auto"></div>
                  <p className="text-black md:text-[16px] text-[14px] mt-2">პაკეტების ჩატვირთვა...</p>
                </div>
              ) : packages.length === 0 ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-800 md:text-[16px] text-[14px]">
                        <strong>ყურადღება:</strong> მინიმუმ ერთი პაკეტი საჭიროა ოლიმპიადის შექმნასთან ერთად.
                      </p>
                      <div className="mt-2">
                        <Link
                          href="/admin/olympiads/packages"
                          className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-3 py-1 rounded-md text-sm font-medium"
                        >
                          პაკეტის შექმნა
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {packages.map((pkg) => (
                    <div key={pkg.id} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50">
                      <label className="flex items-start space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.packages.includes(pkg.id)}
                          onChange={() => handlePackageToggle(pkg.id)}
                          className="h-4 w-4 text-[#034e64] focus:ring-[#034e64] border-gray-300 rounded mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-black md:text-[16px] text-[14px] font-medium">
                              {pkg.name}
                            </span>
                                                       <span className="text-sm text-gray-500">
                             {pkg.questions.length} კითხვა
                           </span>
                         </div>
                         {pkg.description && (
                           <p className="text-sm text-gray-600 mt-1">
                             {pkg.description}
                           </p>
                         )}
                         <div className="flex flex-wrap gap-2 mt-2">
                           {Array.from(new Set(pkg.questions.map(q => q.question.subject.name))).map((subject, index) => (
                             <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                               {subject}
                             </span>
                           ))}
                           {Array.from(new Set(pkg.questions.map(q => q.question.grade))).map((grade, index) => (
                             <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                               {grade} კლასი
                             </span>
                           ))}
                         </div>
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              )}
              
              {formData.packages.length > 0 && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm text-blue-800 md:text-[16px] text-[14px]">
                    <strong>არჩეული პაკეტები:</strong> {formData.packages.length} პაკეტი
                  </p>
                </div>
              )}
            </div>

                         {/* Question Types */}
             <div>
               <label className="block text-sm font-medium text-black md:text-[18px] text-[16px] mb-3">
                 კითხვების ტიპები და რაოდენობა *
               </label>
               
               {/* Question Type Selection */}
               <div className="space-y-4 mb-6">
                 {availableQuestionTypes.map((questionType) => (
                   <div key={questionType.value} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                     <div className="flex items-center">
                       <input
                         type="checkbox"
                         checked={formData.questionTypes.includes(questionType.value)}
                         onChange={() => handleQuestionTypeToggle(questionType.value)}
                         className="h-4 w-4 text-[#034e64] focus:ring-[#034e64] border-gray-300 rounded"
                       />
                       <span className="ml-2 text-black md:text-[16px] text-[14px] font-medium">{questionType.label}</span>
                     </div>
                     {formData.questionTypes.includes(questionType.value) && (
                       <div className="flex items-center space-x-2">
                         <label className="text-sm text-gray-600">რაოდენობა:</label>
                         <input
                           type="number"
                           min="1"
                           max="50"
                           value={formData.questionTypeQuantities[questionType.value] || 1}
                           onChange={(e) => handleQuantityChange(questionType.value, parseInt(e.target.value) || 1)}
                           className="w-16 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#034e64] text-black text-sm"
                         />
                       </div>
                     )}
                   </div>
                 ))}
               </div>

               {/* Question Type Order */}
               {formData.questionTypeOrder.length > 1 && (
                 <div className="mb-6">
                   <label className="block text-sm font-medium text-black md:text-[18px] text-[16px] mb-3">
                     კითხვების ტიპების თანმიმდევრობა
                   </label>
                   <div className="space-y-2">
                     {formData.questionTypeOrder.map((questionType, index) => {
                       const typeInfo = availableQuestionTypes.find(t => t.value === questionType)
                       return (
                         <div key={questionType} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50">
                           <div className="flex items-center space-x-3">
                             <span className="text-sm text-gray-500 font-medium">#{index + 1}</span>
                             <span className="text-black md:text-[16px] text-[14px] font-medium">
                               {typeInfo?.label || questionType}
                             </span>
                             <span className="text-sm text-gray-600">
                               ({formData.questionTypeQuantities[questionType] || 1} კითხვა)
                             </span>
                           </div>
                           <div className="flex space-x-1">
                             <button
                               type="button"
                               onClick={() => moveQuestionTypeUp(index)}
                               disabled={index === 0}
                               className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                               title="ზემოთ"
                             >
                               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                               </svg>
                             </button>
                             <button
                               type="button"
                               onClick={() => moveQuestionTypeDown(index)}
                               disabled={index === formData.questionTypeOrder.length - 1}
                               className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                               title="ქვემოთ"
                             >
                               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                               </svg>
                             </button>
                           </div>
                         </div>
                       )
                     })}
                   </div>
                 </div>
               )}

               {formData.questionTypes.length > 0 && (
                 <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                   <p className="text-sm text-blue-800 md:text-[16px] text-[14px]">
                     <strong>სულ კითხვები:</strong> {Object.values(formData.questionTypeQuantities).reduce((sum, qty) => sum + qty, 0)} კითხვა
                   </p>
                   {formData.questionTypeOrder.length > 1 && (
                     <p className="text-sm text-blue-700 mt-1">
                       <strong>თანმიმდევრობა:</strong> {formData.questionTypeOrder.map((type, index) => {
                         const typeInfo = availableQuestionTypes.find(t => t.value === type)
                         return `${index + 1}. ${typeInfo?.label || type}`
                       }).join(' → ')}
                     </p>
                   )}
                 </div>
               )}
             </div>

            {/* Subjects */}
            <div>
              <label className="block text-sm font-medium text-black md:text-[18px] text-[16px] mb-3">
                საგნები *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {availableSubjects.map((subject) => (
                  <label key={subject} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.subjects.includes(subject)}
                      onChange={() => handleSubjectToggle(subject)}
                      className="h-4 w-4 text-[#034e64] focus:ring-[#034e64] border-gray-300 rounded"
                    />
                    <span className="ml-2 text-black md:text-[16px] text-[14px]">{subject}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Grades */}
            <div>
              <label className="block text-sm font-medium text-black md:text-[18px] text-[16px] mb-3">
                კლასები *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                {[7, 8, 9, 10, 11, 12].map((grade) => (
                  <label key={grade} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.grades.includes(grade)}
                      onChange={() => handleGradeToggle(grade)}
                      className="h-4 w-4 text-[#034e64] focus:ring-[#034e64] border-gray-300 rounded"
                    />
                    <span className="ml-2 text-black md:text-[16px] text-[14px]">{grade} კლასი</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex space-x-4 pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-[#034e64] cursor-pointer text-white px-4 py-2 rounded-md md:text-[20px] text-[16px] font-bold transition-colors hover:bg-[#023a4d] disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'იქმნება...' : 'ოლიმპიადის შექმნა'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 bg-gray-500 hover:bg-gray-600 cursor-pointer text-white px-4 py-2 rounded-md md:text-[20px] text-[16px] font-bold transition-colors"
              >
                გაწმენდა
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function CreateOlympiadPage() {
  return (
    <AdminOnly>
      <CreateOlympiadContent />
    </AdminOnly>
  )
}
