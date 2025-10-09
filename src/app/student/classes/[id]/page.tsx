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
  const [loading, setLoading] = useState(true)
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

    fetchClassDetails()
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

        {/* Contact Teacher */}
        <motion.div 
          className="mt-8 bg-white rounded-lg shadow-lg p-6"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4">მასწავლებელთან კონტაქტი</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-700 mb-1">
                <span className="font-medium">მასწავლებელი:</span> {classDetails.teacher.name}
              </p>
              <p className="text-gray-700">
                <span className="font-medium">ელ-ფოსტა:</span> {classDetails.teacher.email}
              </p>
            </div>
            <a 
              href={`mailto:${classDetails.teacher.email}`}
              className="bg-[#034e64] text-white px-6 py-2 rounded-md text-[16px] font-bold hover:bg-[#023a4d] transition-colors"
            >
              ელ-ფოსტის გაგზავნა
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default ClassDetailPage
