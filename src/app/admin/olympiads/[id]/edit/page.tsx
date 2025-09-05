'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface QuestionPackage {
  id: string
  name: string
  description: string
}

interface OlympiadEvent {
  id: string
  name: string
  description: string
  startDate: string
  endDate: string
  registrationDeadline: string
  maxParticipants: number
  isActive: boolean
  rounds: number
  subjects: string[]
  grades: number[]
  questionTypes: string[]
  questionTypeQuantities?: Record<string, number> | null
  minimumPointsThreshold?: number | null
  packages: QuestionPackage[]
}

export default function EditOlympiadPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const resolvedParams = use(params)
  const [olympiad, setOlympiad] = useState<OlympiadEvent | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    registrationDeadline: '',
    maxParticipants: '',
    isActive: true,
    rounds: 3,
    subjects: [] as string[],
    grades: [] as number[],
    packages: [] as string[],
    questionTypes: [] as string[],
    questionTypeQuantities: {} as Record<string, number>,
    minimumPointsThreshold: ''
  })

  // Available options
  const [availablePackages, setAvailablePackages] = useState<QuestionPackage[]>([])
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([])

  const questionTypeOptions = [
    { value: 'MATCHING', label: 'შესაბამისობა' },
    { value: 'TEXT_ANALYSIS', label: 'ტექსტის ანალიზი' },
    { value: 'MAP_ANALYSIS', label: 'რუკის ანალიზი' },
    { value: 'OPEN_ENDED', label: 'ღია კითხვა' },
    { value: 'CLOSED_ENDED', label: 'დახურული კითხვა' }
  ]

  const gradeOptions = [7, 8, 9, 10, 11, 12]

  useEffect(() => {
    fetchOlympiad()
    fetchAvailableData()
  }, [resolvedParams.id])

  const fetchOlympiad = async () => {
    try {
      const response = await fetch(`/api/admin/olympiads/${resolvedParams.id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch olympiad')
      }
      const data = await response.json()
      setOlympiad(data.olympiad)
      
      // Populate form data
      setFormData({
        name: data.olympiad.name,
        description: data.olympiad.description,
        startDate: new Date(data.olympiad.startDate).toISOString().slice(0, 16),
        endDate: new Date(data.olympiad.endDate).toISOString().slice(0, 16),
        registrationDeadline: new Date(data.olympiad.registrationDeadline).toISOString().slice(0, 16),
        maxParticipants: data.olympiad.maxParticipants.toString(),
        isActive: data.olympiad.isActive,
        rounds: data.olympiad.rounds,
        subjects: data.olympiad.subjects,
        grades: data.olympiad.grades,
        packages: data.olympiad.packages.map((pkg: QuestionPackage) => pkg.id),
        questionTypes: data.olympiad.questionTypes,
        questionTypeQuantities: data.olympiad.questionTypeQuantities || {},
        minimumPointsThreshold: data.olympiad.minimumPointsThreshold?.toString() || ''
      })
    } catch (err) {
      setError('ოლიმპიადის ჩატვირთვისას შეცდომა მოხდა')
      console.error('Error fetching olympiad:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchAvailableData = async () => {
    try {
      // Fetch packages
      const packagesResponse = await fetch('/api/admin/question-packages')
      if (packagesResponse.ok) {
        const packagesData = await packagesResponse.json()
        setAvailablePackages(packagesData.packages || [])
      }

      // Fetch subjects
      const subjectsResponse = await fetch('/api/subjects')
      if (subjectsResponse.ok) {
        const subjectsData = await subjectsResponse.json()
        setAvailableSubjects(subjectsData.subjects?.map((s: any) => s.name) || [])
      }
    } catch (err) {
      console.error('Error fetching available data:', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError('')
    setSuccessMessage('')

    try {
      const response = await fetch(`/api/admin/olympiads/${resolvedParams.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (response.ok) {
        setSuccessMessage('ოლიმპიადა წარმატებით განახლდა!')
        setTimeout(() => {
          router.push('/admin/olympiads/manage')
        }, 2000)
      } else {
        setError(result.error || 'ოლიმპიადის განახლებისას შეცდომა მოხდა')
      }
    } catch (err) {
      setError('სისტემური შეცდომა მოხდა')
      console.error('Error updating olympiad:', err)
    } finally {
      setIsSaving(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleArrayChange = (field: string, value: string | number, checked: boolean) => {
    setFormData(prev => {
      const currentArray = prev[field as keyof typeof prev] as (string | number)[]
      if (checked) {
        return { ...prev, [field]: [...currentArray, value] }
      } else {
        return { ...prev, [field]: currentArray.filter(item => item !== value) }
      }
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#034e64] mx-auto mb-4"></div>
              <p className="text-black md:text-[20px] text-[18px]">იტვირთება...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!olympiad) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">ოლიმპიადა ვერ მოიძებნა</h1>
            <Link
              href="/admin/olympiads/manage"
              className="bg-[#034e64] text-white px-4 py-2 rounded-md"
            >
              უკან დაბრუნება
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-black md:text-[20px] text-[18px] font-bold">
              ოლიმპიადის რედაქტირება
            </h1>
            <Link
              href="/admin/olympiads/manage"
              className="bg-gray-500 text-white px-4 py-2 rounded-md md:text-[20px] text-[16px] font-bold transition-colors hover:bg-gray-600"
            >
              უკან დაბრუნება
            </Link>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-800">{successMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="md:col-span-2">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">ძირითადი ინფორმაცია</h2>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ოლიმპიადის სახელი *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#034e64]"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                აღწერა *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#034e64]"
                required
              />
            </div>

            {/* Dates */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                დაწყების თარიღი *
              </label>
              <input
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#034e64]"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                დასრულების თარიღი *
              </label>
              <input
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#034e64]"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                რეგისტრაციის ვადა *
              </label>
              <input
                type="datetime-local"
                value={formData.registrationDeadline}
                onChange={(e) => handleInputChange('registrationDeadline', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#034e64]"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                მაქსიმალური მონაწილეების რაოდენობა *
              </label>
              <input
                type="number"
                value={formData.maxParticipants}
                onChange={(e) => handleInputChange('maxParticipants', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#034e64]"
                min="1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                რაუნდების რაოდენობა *
              </label>
              <input
                type="number"
                value={formData.rounds}
                onChange={(e) => handleInputChange('rounds', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#034e64]"
                min="1"
                max="5"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                მინიმალური ქულის ზღვარი
              </label>
              <input
                type="number"
                value={formData.minimumPointsThreshold}
                onChange={(e) => handleInputChange('minimumPointsThreshold', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#034e64]"
                min="0"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => handleInputChange('isActive', e.target.checked)}
                className="h-4 w-4 text-[#034e64] focus:ring-[#034e64] border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                აქტიური
              </label>
            </div>

            {/* Subjects */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                საგნები *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {availableSubjects.map((subject) => (
                  <label key={subject} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.subjects.includes(subject)}
                      onChange={(e) => handleArrayChange('subjects', subject, e.target.checked)}
                      className="h-4 w-4 text-[#034e64] focus:ring-[#034e64] border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-900">{subject}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Grades */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                კლასები *
              </label>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                {gradeOptions.map((grade) => (
                  <label key={grade} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.grades.includes(grade)}
                      onChange={(e) => handleArrayChange('grades', grade, e.target.checked)}
                      className="h-4 w-4 text-[#034e64] focus:ring-[#034e64] border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-900">{grade}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Question Packages */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                კითხვების პაკეტები *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {availablePackages.map((pkg) => (
                  <label key={pkg.id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.packages.includes(pkg.id)}
                      onChange={(e) => handleArrayChange('packages', pkg.id, e.target.checked)}
                      className="h-4 w-4 text-[#034e64] focus:ring-[#034e64] border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-900">{pkg.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Question Types */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                კითხვების ტიპები *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {questionTypeOptions.map((type) => (
                  <label key={type.value} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.questionTypes.includes(type.value)}
                      onChange={(e) => handleArrayChange('questionTypes', type.value, e.target.checked)}
                      className="h-4 w-4 text-[#034e64] focus:ring-[#034e64] border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-900">{type.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-8 flex justify-end space-x-4">
            <Link
              href="/admin/olympiads/manage"
              className="bg-gray-500 text-white px-6 py-2 rounded-md font-medium hover:bg-gray-600 transition-colors"
            >
              გაუქმება
            </Link>
            <button
              type="submit"
              disabled={isSaving}
              className="bg-[#034e64] text-white px-6 py-2 rounded-md font-medium hover:bg-[#023a4d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'შენახვა...' : 'შენახვა'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
