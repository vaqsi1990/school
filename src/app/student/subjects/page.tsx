'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import toast from 'react-hot-toast'


interface Subject {
  id: string
  name: string
  description?: string
}

interface OlympiadResult {
  id: string
  olympiadId: string
  olympiadTitle: string
  olympiadDescription: string
  subjects: string[]
  grades: number[]
  startDate: string
  endDate: string
  status: string
  score: number
  maxScore: number
  percentage: number
  totalQuestions: number
  completedAt: string
}

// Function to get subject image based on name
const getSubjectImage = (subjectName: string): string => {
  const imageMap: { [key: string]: string } = {
    'მათემატიკა': '/test/მათემატიკა.jpg',
    'ქართული ენა': '/test/ქართული.jpg',
    'ინგლისური ენა': '/test/ინგლისური.jpg',
    'ფიზიკა': '/test/ფიზიკა.jpg',
    'ქიმია': '/test/ქიმია.jpg',
    'ბიოლოგია': '/test/ბიოლოგია.jpg',
    'ისტორია': '/test/ისტორია.jpg',
    'გეოგრაფია': '/test/გეოგრაფია.jpg',
    'ერთიანი ეროვნული გამოცდები': '/test/ეროვნული.jpg'
  }
  
  return imageMap[subjectName]  // fallback image
}

const StudentSubjectsPage = () => {
  const router = useRouter()
  const { data: session } = useSession()
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selecting, setSelecting] = useState<string | null>(null)
  const [olympiadResults, setOlympiadResults] = useState<Record<string, OlympiadResult[]>>({})
  const [loadingResults, setLoadingResults] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch subjects
        const subjectsResponse = await fetch('/api/subjects')
        if (!subjectsResponse.ok) {
          throw new Error('Failed to fetch subjects')
        }
        const subjectsData = await subjectsResponse.json()
        setSubjects(subjectsData.subjects || [])
        
        // Fetch selected subjects for this student
        if (session?.user?.id) {
          const selectedResponse = await fetch(`/api/student/selected-subjects?userId=${session.user.id}`)
          if (selectedResponse.ok) {
            const selectedData = await selectedResponse.json()
            setSelectedSubjects(selectedData.selectedSubjects || [])
          }
        }
        
        setError(null)
      } catch (err) {
        console.error('Error fetching data:', err)
        setError('მონაცემების ჩატვირთვა ვერ მოხერხდა')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [session])

  const handleSubjectSelection = async (subjectId: string) => {
    if (!session?.user?.id) return
    
    try {
      setSelecting(subjectId)
      const response = await fetch('/api/student/select-subject', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: session.user.id,
          subjectId: subjectId
        })
      })
      
      if (response.ok) {
        // Add to selected subjects
        setSelectedSubjects(prev => [...prev, subjectId])
        // Show success message
        toast.success('საგანი წარმატებით აირჩია!')
      } else {
        const errorData = await response.json()
        toast.error(`შეცდომა: ${errorData.error || 'საგნის არჩევა ვერ მოხერხდა'}`)
      }
    } catch (error) {
      console.error('Error selecting subject:', error)
      toast.error('საგნის არჩევა ვერ მოხერხდა')
    } finally {
      setSelecting(null)
    }
  }

  const fetchOlympiadResults = async (subjectName: string) => {
    try {
      setLoadingResults(prev => ({ ...prev, [subjectName]: true }))
      
      const response = await fetch(`/api/student/olympiad-results-by-subject?subjectName=${encodeURIComponent(subjectName)}`)
      
      if (response.ok) {
        const data = await response.json()
        setOlympiadResults(prev => ({
          ...prev,
          [subjectName]: data.results || []
        }))
      } else {
        const errorData = await response.json()
        console.error('Error fetching olympiad results for subject:', subjectName, errorData)
        setOlympiadResults(prev => ({
          ...prev,
          [subjectName]: []
        }))
      }
    } catch (error) {
      console.error('Error fetching olympiad results:', error)
      setOlympiadResults(prev => ({
        ...prev,
        [subjectName]: []
      }))
    } finally {
      setLoadingResults(prev => ({ ...prev, [subjectName]: false }))
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'დასრულებულია'
      case 'DISQUALIFIED':
        return 'დისკვალიფიცირებული'
      default:
        return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800'
      case 'DISQUALIFIED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ka-GE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Filter out already selected subjects
  const availableSubjects = subjects.filter(subject => !selectedSubjects.includes(subject.id))

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#034e64] mx-auto mb-4"></div>
          <p className="text-black text-[16px]">საგნების ჩატვირთვა...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-gray-50 min-h-screen py-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-[16px] mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-[#034e64] text-white px-4 py-2 rounded-md text-[16px] font-bold hover:bg-[#023a4d]"
          >
            ხელახლა ცდა
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <button
            onClick={() => router.back()}
            className="flex items-center text-[#034e64] hover:text-[#023a4d] transition-colors mb-6"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-[16px] font-bold">უკან დაბრუნება</span>
          </button>
        </motion.div>

        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h1 className="text-3xl font-bold text-black mb-4">საგნები</h1>

        </motion.div>

        {availableSubjects.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-black text-[16px]">
              {subjects.length === 0 
                ? 'საგნები ჯერ არ არის დამატებული' 
                : 'ყველა საგანი უკვე აირჩიეთ'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {availableSubjects.map((subject, index) => (
              <motion.div
                key={subject.id}
                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10, scale: 1.02 }}
              >
                {/* Subject Image */}
                <div className="h-72 w-full overflow-hidden">
                  <img 
                    src={getSubjectImage(subject.name)}
                    alt={subject.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-black mb-3">
                    {subject.name}
                  </h3>
                  {subject.description && (
                    <p className="text-black text-[16px] mb-4">
                      {subject.description}
                    </p>
                  )}

                  {/* Olympiad Results Section */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-700">ოლიმპიადის შედეგები</h4>
                      <button
                        onClick={() => fetchOlympiadResults(subject.name)}
                        disabled={loadingResults[subject.name]}
                        className="text-xs text-[#034e64] hover:text-[#023a4d] font-medium"
                      >
                        {loadingResults[subject.name] ? 'ჩატვირთვა...' : 'ჩატვირთვა'}
                      </button>
                    </div>
                    
                    {olympiadResults[subject.name] && olympiadResults[subject.name].length > 0 ? (
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {olympiadResults[subject.name].map((result) => (
                          <div key={result.id} className="bg-gray-50 rounded p-2 text-xs">
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-medium text-gray-800 truncate">
                                {result.olympiadTitle}
                              </span>
                              <span className={`px-2 py-1 rounded text-xs ${getStatusColor(result.status)}`}>
                                {getStatusText(result.status)}
                              </span>
                            </div>
                            <div className="text-gray-600">
                              ქულა: {result.score}/{result.maxScore} ({result.percentage}%)
                            </div>
                            <div className="text-gray-500">
                              {formatDate(result.completedAt)}
                            </div>
                            <button
                              onClick={() => router.push(`/student/olympiads/${result.olympiadId}/results`)}
                              className="text-[#034e64] hover:text-[#023a4d] text-xs font-medium mt-1"
                            >
                              დეტალური შედეგები →
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : olympiadResults[subject.name] && olympiadResults[subject.name].length === 0 ? (
                      <p className="text-xs text-gray-500">ოლიმპიადის შედეგები არ არის</p>
                    ) : (
                      <p className="text-xs text-gray-400">ღილაკზე დაჭერით ჩატვირთეთ შედეგები</p>
                    )}
                  </div>

                  <button 
                    onClick={() => handleSubjectSelection(subject.id)}
                    disabled={selecting === subject.id}
                    className="w-full bg-[#034e64] cursor-pointer text-white px-4 py-2 rounded-md text-[16px] font-bold transition-colors hover:bg-[#023a4d] disabled:opacity-50"
                  >
                    {selecting === subject.id ? 'არჩევა...' : 'არჩევა'}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default StudentSubjectsPage