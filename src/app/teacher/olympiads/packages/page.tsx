'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { TeacherOnly } from '@/components/auth/ProtectedRoute'
import Link from 'next/link'

interface Question {
  id: string
  text: string
  type: string
  subject: {
    name: string
  }
  grade: number
  round: number
}

interface QuestionPackage {
  id: string
  name: string
  description: string
  createdAt: string
  questions: {
    question: Question
    order: number
  }[]
}

function TeacherPackagesContent() {
  const { user } = useAuth()
  const [packages, setPackages] = useState<QuestionPackage[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    selectedQuestions: [] as string[]
  })

  useEffect(() => {
    fetchPackages()
    fetchQuestions()
  }, [])

  const fetchPackages = async () => {
    try {
      const response = await fetch('/api/teacher/question-packages')
      if (response.ok) {
        const data = await response.json()
        setPackages(data.packages)
      }
    } catch (error) {
      console.error('Error fetching packages:', error)
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

  const handleCreatePackage = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || formData.selectedQuestions.length === 0) {
      alert('გთხოვთ შეიყვანოთ პაკეტის სახელი და აირჩიოთ კითხვები')
      return
    }

    try {
      const response = await fetch('/api/teacher/question-packages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          questionIds: formData.selectedQuestions
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setPackages([data.package, ...packages])
        setFormData({
          name: '',
          description: '',
          selectedQuestions: []
        })
        setShowCreateForm(false)
        alert('პაკეტი წარმატებით შეიქმნა')
      } else {
        const error = await response.json()
        alert(error.error || 'შეცდომა პაკეტის შექმნისას')
      }
    } catch (error) {
      console.error('Error creating package:', error)
      alert('შეცდომა პაკეტის შექმნისას')
    }
  }

  const toggleQuestionSelection = (questionId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedQuestions: prev.selectedQuestions.includes(questionId)
        ? prev.selectedQuestions.filter(id => id !== questionId)
        : [...prev.selectedQuestions, questionId]
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-black md:text-[25px] text-[20px]">
                კითხვების პაკეტების მართვა
              </h1>
              <p className="text-black md:text-[18px] text-[16px]">
                მართეთ კითხვების პაკეტები თქვენი საგნისთვის
              </p>
            </div>
            <div className="flex gap-4">
              <Link href="/teacher/olympiads">
                <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md md:text-[18px] text-[16px] font-bold">
                  უკან დაბრუნება
                </button>
              </Link>
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="bg-[#034e64] cursor-pointer text-white px-4 py-2 rounded-md md:text-[20px] text-[16px] font-bold transition-colors hover:bg-[#023a4d]"
              >
                {showCreateForm ? 'გაუქმება' : 'ახალი პაკეტი'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Create Package Form */}
        {showCreateForm && (
          <div className="bg-white shadow rounded-lg p-6 mb-8">
            <h2 className="text-black md:text-[20px] text-[18px] font-semibold mb-4">
              ახალი პაკეტის შექმნა
            </h2>
            <form onSubmit={handleCreatePackage}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-black md:text-[20px] text-[18px] font-medium mb-2">
                    პაკეტის სახელი
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md md:text-[20px] text-[18px] focus:outline-none focus:ring-2 focus:ring-[#034e64]"
                    placeholder="შეიყვანეთ პაკეტის სახელი"
                    required
                  />
                </div>
                <div>
                  <label className="block text-black md:text-[20px] text-[18px] font-medium mb-2">
                    აღწერა (არასავალდებულო)
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md md:text-[20px] text-[18px] focus:outline-none focus:ring-2 focus:ring-[#034e64]"
                    placeholder="შეიყვანეთ აღწერა"
                  />
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-black md:text-[20px] text-[18px] font-medium mb-4">
                  აირჩიეთ კითხვები ({formData.selectedQuestions.length} არჩეული)
                </h3>
                
                {loading ? (
                  <div className="text-center py-8">
                    <p className="text-black md:text-[20px] text-[18px]">იტვირთება...</p>
                  </div>
                ) : questions.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-black md:text-[20px] text-[18px] mb-4">
                      ჯერ არ გაქვთ შექმნილი კითხვები
                    </p>
                    <Link href="/teacher/questions">
                      <button className="bg-[#034e64] cursor-pointer text-white px-4 py-2 rounded-md md:text-[20px] text-[16px] font-bold transition-colors hover:bg-[#023a4d]">
                        კითხვების შექმნა
                      </button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                    {questions.map((question) => (
                      <div
                        key={question.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          formData.selectedQuestions.includes(question.id)
                            ? 'border-[#034e64] bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => toggleQuestionSelection(question.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-black md:text-[20px] text-[18px] font-medium mb-2">
                              {question.text.length > 100 ? `${question.text.substring(0, 100)}...` : question.text}
                            </p>
                            <div className="flex gap-2 text-sm">
                              <span className="bg-gray-200 px-2 py-1 rounded text-black md:text-[16px] text-[14px]">
                                კლასი {question.grade}
                              </span>
                              <span className="bg-gray-200 px-2 py-1 rounded text-black md:text-[16px] text-[14px]">
                                რაუნდი {question.round}
                              </span>
                            </div>
                          </div>
                          <div className={`w-4 h-4 rounded border-2 ml-2 ${
                            formData.selectedQuestions.includes(question.id)
                              ? 'bg-[#034e64] border-[#034e64]'
                              : 'border-gray-300'
                          }`}>
                            {formData.selectedQuestions.includes(question.id) && (
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-6 flex gap-4">
                <button
                  type="submit"
                  className="bg-[#034e64] cursor-pointer text-white px-4 py-2 rounded-md md:text-[20px] text-[16px] font-bold transition-colors hover:bg-[#023a4d]"
                  disabled={formData.selectedQuestions.length === 0}
                >
                  პაკეტის შექმნა
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md md:text-[20px] text-[16px] font-bold"
                >
                  გაუქმება
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Packages List */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-black md:text-[20px] text-[18px] font-semibold">
              თქვენი პაკეტები ({packages.length})
            </h2>
          </div>
          
          <div className="p-6">
            {packages.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <p className="text-black md:text-[20px] text-[18px] mb-4">
                  ჯერ არ გაქვთ შექმნილი პაკეტები
                </p>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-[#034e64] cursor-pointer text-white px-4 py-2 rounded-md md:text-[20px] text-[16px] font-bold transition-colors hover:bg-[#023a4d]"
                >
                  პირველი პაკეტის შექმნა
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {packages.map((pkg) => (
                  <div key={pkg.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="text-black md:text-[20px] text-[18px] font-semibold">
                          {pkg.name}
                        </h3>
                        {pkg.description && (
                          <p className="text-black md:text-[20px] text-[18px] text-gray-600 mt-1">
                            {pkg.description}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-black md:text-[16px] text-[14px] text-gray-500">
                          {new Date(pkg.createdAt).toLocaleDateString('ka-GE')}
                        </p>
                        <p className="text-black md:text-[16px] text-[14px] text-gray-500">
                          {pkg.questions.length} კითხვა
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button className="bg-[#034e64] cursor-pointer text-white px-3 py-1 rounded-md md:text-[16px] text-[14px] font-bold transition-colors hover:bg-[#023a4d]">
                        ნახვა
                      </button>
                      <button className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded-md md:text-[16px] text-[14px] font-bold">
                        რედაქტირება
                      </button>
                      <button className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md md:text-[16px] text-[14px] font-bold">
                        წაშლა
                      </button>
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

export default function TeacherPackagesPage() {
  return (
    <TeacherOnly>
      <TeacherPackagesContent />
    </TeacherOnly>
  )
}
