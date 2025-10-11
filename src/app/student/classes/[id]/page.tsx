'use client'

import React, { useState, useEffect, use } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'


interface ClassStudent {
  id: string
  name: string
  lastname: string
  grade: number
  school: string
  joinedAt: string
}

interface ClassTest {
  id: string
  title: string
  description?: string
  subject: {
    id: string
    name: string
  }
  teacher: {
    id: string
    name: string
    lastname: string
  }
  isActive: boolean
  startDate?: string
  endDate?: string
  duration?: number
  createdAt: string
  questions: Array<{
    id: string
    question: {
      id: string
      text: string
      type: string
    }
  }>
  studentResult?: {
    id: string
    score?: number
    totalPoints?: number
    status: string
    completedAt?: string
  } | null
}

interface ClassDetails {
  id: string
  name: string
  description?: string
  subject: string
  grade: number
  teacher: {
    name: string
    email: string
  }
  students: ClassStudent[]
  totalStudents: number
  createdAt: string
  joinedAt: string
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
  
  return imageMap[subjectName] || '/test/bgimage.jpg'
}

const ClassDetailPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const router = useRouter()
  const { data: session } = useSession()
  const [classDetails, setClassDetails] = useState<ClassDetails | null>(null)
  const [tests, setTests] = useState<ClassTest[]>([])
  const [loading, setLoading] = useState(true)
  const [testsLoading, setTestsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const resolvedParams = use(params)

  useEffect(() => {
    const fetchClassDetails = async () => {
      if (!session?.user?.id) return
      
      try {
        setLoading(true)
        const response = await fetch(`/api/student/classes/${resolvedParams.id}`)
        if (response.ok) {
          const data = await response.json()
          setClassDetails(data.class)
        } else {
          throw new Error('Failed to fetch class details')
        }
        setError(null)
      } catch (err) {
        console.error('Error fetching class details:', err)
        setError('კლასის დეტალების ჩატვირთვა ვერ მოხერხდა')
      } finally {
        setLoading(false)
      }
    }

    const fetchTests = async () => {
      if (!session?.user?.id) return
      
      try {
        setTestsLoading(true)
        const response = await fetch(`/api/student/classes/${resolvedParams.id}/tests`)
        if (response.ok) {
          const data = await response.json()
          setTests(data.tests)
        } else {
          console.error('Failed to fetch tests')
        }
      } catch (err) {
        console.error('Error fetching tests:', err)
      } finally {
        setTestsLoading(false)
      }
    }

    fetchClassDetails()
    fetchTests()
  }, [session, resolvedParams.id])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const georgianMonths = [
      'იანვარი', 'თებერვალი', 'მარტი', 'აპრილი', 'მაისი', 'ივნისი',
      'ივლისი', 'აგვისტო', 'სექტემბერი', 'ოქტომბერი', 'ნოემბერი', 'დეკემბერი'
    ]
    
    const day = date.getDate()
    const month = georgianMonths[date.getMonth()]
    const year = date.getFullYear()
    
    return `${day} ${month}, ${year}`
  }

  const formatDateTime = (dateString: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const georgianMonths = [
      'იანვარი', 'თებერვალი', 'მარტი', 'აპრილი', 'მაისი', 'ივნისი',
      'ივლისი', 'აგვისტო', 'სექტემბერი', 'ოქტომბერი', 'ნოემბერი', 'დეკემბერი'
    ]
    
    const day = date.getDate()
    const month = georgianMonths[date.getMonth()]
    const year = date.getFullYear()
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    
    return `${day} ${month}, ${year} - ${hours}:${minutes}`
  }

  const isTestAvailable = (test: ClassTest) => {
    if (!test.isActive) return false
    if (test.startDate && new Date() < new Date(test.startDate)) return false
    if (test.endDate && new Date() > new Date(test.endDate)) return false
    return true
  }

  const getTestStatus = (test: ClassTest) => {
    if (!test.isActive) return { status: 'inactive', text: 'არააქტიური', color: 'gray' }
    if (test.startDate && new Date() < new Date(test.startDate)) {
      return { status: 'not-started', text: 'ჯერ არ დაწყებულა', color: 'yellow' }
    }
    if (test.endDate && new Date() > new Date(test.endDate)) {
      return { status: 'ended', text: 'დასრულებული', color: 'red' }
    }
    if (test.studentResult?.status === 'COMPLETED') {
      return { status: 'completed', text: 'დასრულებული', color: 'green' }
    }
    return { status: 'available', text: 'ხელმისაწვდომი', color: 'blue' }
  }

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#034e64] mx-auto mb-4"></div>
          <p className="text-black text-[16px]">კლასის დეტალების ჩატვირთვა...</p>
        </div>
      </div>
    )
  }

  if (error || !classDetails) {
    return (
      <div className="bg-gray-50 min-h-screen py-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-[16px] mb-4">{error || 'კლასი ვერ მოიძებნა'}</p>
          <button 
            onClick={() => router.back()} 
            className="bg-[#034e64] text-white px-4 py-2 rounded-md text-[16px] font-bold hover:bg-[#023a4d]"
          >
            უკან დაბრუნება
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4">
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

        {/* Class Header */}
        <motion.div 
          className="bg-white rounded-lg shadow-lg overflow-hidden mb-8"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="h-64 w-full overflow-hidden relative">
            <img 
              src={getSubjectImage(classDetails.subject)}
              alt={classDetails.subject}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div className="absolute bottom-6 left-6 text-white">
              <h1 className="text-3xl font-bold mb-2">{classDetails.name}</h1>
              <p className="text-lg opacity-90">{classDetails.subject} - {classDetails.grade} კლასი</p>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center">
                <div className="bg-blue-100 p-3 rounded-full mr-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600">მასწავლებელი</p>
                  <p className="font-semibold text-gray-900">{classDetails.teacher.name}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="bg-green-100 p-3 rounded-full mr-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600">მოსწავლეები</p>
                  <p className="font-semibold text-gray-900">{classDetails.totalStudents} მოსწავლე</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="bg-purple-100 p-3 rounded-full mr-4">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600">შეუერთდა</p>
                  <p className="font-semibold text-gray-900">{formatDate(classDetails.joinedAt)}</p>
                </div>
              </div>
            </div>
            
            {classDetails.description && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">კლასის აღწერა</h3>
                <p className="text-gray-700 leading-relaxed">{classDetails.description}</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Class Tests */}
        <motion.div 
          className="bg-white rounded-lg shadow-lg p-6 mb-8"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">კლასის ტესტები</h2>
            <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
              {tests.length} ტესტი
            </span>
          </div>
          
          {testsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#034e64] mx-auto mb-4"></div>
              <p className="text-gray-600">ტესტების ჩატვირთვა...</p>
            </div>
          ) : tests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-lg font-medium mb-2">ტესტები არ არის</p>
              <p className="text-sm">ამ კლასისთვის ჯერ არ არის შექმნილი ტესტები</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tests.map((test, index) => {
                const testStatus = getTestStatus(test)
                const available = isTestAvailable(test)
                
                // Debug logging
                console.log('Test:', test.title, 'Status:', test.studentResult?.status, 'Score:', test.studentResult?.score, 'TotalPoints:', test.studentResult?.totalPoints)
                
                return (
                  <motion.div
                    key={test.id}
                    className={`border rounded-lg p-4 transition-colors ${
                      available ? 'border-blue-200 bg-blue-50 hover:bg-blue-100' : 'border-gray-200 bg-gray-50'
                    }`}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    viewport={{ once: true }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{test.title}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            testStatus.color === 'green' ? 'bg-green-100 text-green-800' :
                            testStatus.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                            testStatus.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                            testStatus.color === 'red' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {testStatus.text}
                          </span>
                        </div>
                        
                        {test.description && (
                          <p className="text-gray-600 mb-3">{test.description}</p>
                        )}
                        
                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                          <span> {test.subject.name}</span>
                          <span> {test.teacher.name} {test.teacher.lastname}</span>
                          <span> {test.questions.length} კითხვა</span>
                          {test.duration && <span> {test.duration} წუთი</span>}
                        </div>
                        
                        <div className="text-sm text-gray-500">
                          {test.startDate && (
                            <p><strong>დაწყება:</strong> {formatDateTime(test.startDate)}</p>
                          )}
                          {test.endDate && (
                            <p><strong>დასრულება:</strong> {formatDateTime(test.endDate)}</p>
                          )}
                          {test.studentResult?.status === 'COMPLETED' && (test.studentResult?.score === undefined || test.studentResult?.score === null) ? (
                            <p><strong>ქულა:</strong> მასწავლებელი შეამოწმებს</p>
                          ) : test.studentResult?.status === 'COMPLETED' && test.studentResult?.score !== undefined && test.studentResult?.score !== null ? (
                            <p><strong>ქულა:</strong> {test.studentResult.score}</p>
                          ) : null}
                        </div>
                      </div>
                      
                      <div className="ml-4">
                        {available && test.studentResult?.status !== 'COMPLETED' ? (
                          <button
                            onClick={() => router.push(`/student/class-tests/${test.id}`)}
                            className="bg-[#034e64] text-white px-4 py-2 rounded-lg hover:bg-[#023a4d] transition-colors text-sm font-medium"
                          >
                            ტესტის დაწყება
                          </button>
                        ) : !available ? (
                          <div className="text-right">
                            <div className="text-sm text-gray-500">
                              {testStatus.text}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </motion.div>

        {/* Students List */}
        <motion.div 
          className="bg-white rounded-lg shadow-lg p-6"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">კლასის მოსწავლეები</h2>
            <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
              {classDetails.totalStudents} მოსწავლე
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {classDetails.students.map((student, index) => (
              <motion.div
                key={student.id}
                className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:bg-gray-100 transition-colors"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center">
                  <div className="bg-blue-100 p-2 rounded-full mr-3">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">
                      {student.name} {student.lastname}
                    </h4>
                    <p className="text-sm text-gray-600">{student.grade} კლასი</p>
                    <p className="text-xs text-gray-500">{student.school}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      შეუერთდა: {formatDate(student.joinedAt)}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  )
}

export default ClassDetailPage
