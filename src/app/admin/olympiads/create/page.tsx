'use client'

import { useAuth } from '@/hooks/useAuth'
import { AdminOnly } from '@/components/auth/ProtectedRoute'
import Link from 'next/link'
import { useState } from 'react'

interface OlympiadFormData {
  name: string
  description: string
  startDate: string
  endDate: string
  registrationDeadline: string
  maxParticipants: number
  isActive: boolean
  subjects: string[]
  grades: number[]
  rounds: number
}

function CreateOlympiadContent() {
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<OlympiadFormData>({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    registrationDeadline: '',
    maxParticipants: 100,
    isActive: true,
    subjects: [],
    grades: [7, 8, 9, 10, 11, 12],
    rounds: 3
  })

  const availableSubjects = [
    'მათემატიკა',
    'ფიზიკა',
    'ქიმია',
    'ბიოლოგია',
    'ისტორია',
    'გეოგრაფია',
    'ქართული ენა',
    'ინგლისური ენა'
  ]

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

    setIsSubmitting(true)
    
    try {
      // Here you would typically send the data to your API
      console.log('Creating olympiad:', formData)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      alert('ოლიმპიადა წარმატებით შეიქმნა!')
      // Reset form or redirect
      setFormData({
        name: '',
        description: '',
        startDate: '',
        endDate: '',
        registrationDeadline: '',
        maxParticipants: 100,
        isActive: true,
        subjects: [],
        grades: [7, 8, 9, 10, 11, 12],
        rounds: 3
      })
    } catch (error) {
      console.error('Error creating olympiad:', error)
      alert('შეცდომა მოხდა ოლიმპიადის შექმნისას')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      registrationDeadline: '',
      maxParticipants: 100,
      isActive: true,
      subjects: [],
      grades: [7, 8, 9, 10, 11, 12],
      rounds: 3
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col h-full">
                <label className="block text-sm font-medium text-black md:text-[18px] text-[16px] mb-2">
                  დაწყების თარიღი *
                </label>
                <input
                  type="date"
                  name="startDate"
                  required
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#034e64] text-black md:text-[18px] text-[16px] h-[42px]"
                />
              </div>

              <div className="flex flex-col h-full">
                <label className="block text-sm font-medium text-black md:text-[18px] text-[16px] mb-2">
                  დასრულების თარიღი *
                </label>
                <input
                  type="date"
                  name="endDate"
                  required
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#034e64] text-black md:text-[18px] text-[16px] h-[42px]"
                />
              </div>

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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col h-full">
                <label className="block text-sm font-medium text-black md:text-[18px] text-[16px] mb-2">
                  რაუნდების რაოდენობა *
                </label>
                <select
                  name="rounds"
                  required
                  value={formData.rounds}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#034e64] text-black md:text-[18px] text-[16px] h-[42px]"
                >
                  <option value={1}>1 რაუნდი</option>
                  <option value={2}>2 რაუნდი</option>
                  <option value={3}>3 რაუნდი</option>
                </select>
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
