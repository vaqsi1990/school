'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

interface StudentClass {
  id: string
  name: string
  description?: string
  subject: string
  grade: number
  teacherName: string
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

const StudentClassesPage = () => {
  const router = useRouter()
  const { data: session } = useSession()
  const [studentClasses, setStudentClasses] = useState<StudentClass[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStudentClasses = async () => {
      if (!session?.user?.id) return
      
      try {
        setLoading(true)
        const response = await fetch('/api/student/classes')
        if (response.ok) {
          const data = await response.json()
          setStudentClasses(data.classes || [])
        } else {
          throw new Error('Failed to fetch classes')
        }
        setError(null)
      } catch (err) {
        console.error('Error fetching student classes:', err)
        setError('კლასების ჩატვირთვა ვერ მოხერხდა')
      } finally {
        setLoading(false)
      }
    }

    fetchStudentClasses()
  }, [session])

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
          <p className="text-black text-[16px]">კლასების ჩატვირთვა...</p>
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
          <h1 className="text-3xl font-bold text-black mb-4">ჩემი კლასები</h1>
          <p className="text-gray-600 text-[16px]">კლასები სადაც თქვენ იმყოფებით</p>
        </motion.div>

        {studentClasses.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">კლასები არ მოიძებნა</h3>
              <p className="text-gray-600 text-[16px] mb-6">
                თქვენ არ ხართ არცერთ კლასში. მასწავლებელმა უნდა დაგამატოს კლასში.
              </p>
              <Link href="/student/dashboard">
                <button className="bg-[#034e64] text-white px-6 py-2 rounded-md text-[16px] font-bold hover:bg-[#023a4d] transition-colors">
                  დაბრუნება დეშბორდზე
                </button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {studentClasses.map((classItem, index) => (
              <motion.div
                key={classItem.id}
                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10, scale: 1.02 }}
              >
            
                <div className="p-6">
                  <div className="mb-4">
                    <h3 className="text-xl font-semibold text-black mb-2">
                      {classItem.name}
                    </h3>
                    <div className="flex items-center text-gray-600 text-sm mb-2">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      <span>{classItem.subject}</span>
                    </div>
                    <div className="flex items-center text-gray-600 text-sm mb-2">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span>{classItem.grade} კლასი</span>
                    </div>
                    <div className="flex items-center text-gray-600 text-sm mb-2">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>მასწავლებელი: {classItem.teacherName}</span>
                    </div>
                    <div className="flex items-center text-gray-600 text-sm mb-4">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>შეუერთდა: {formatDate(classItem.joinedAt)}</span>
                    </div>
                  </div>

                  {classItem.description && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">აღწერა:</h4>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {classItem.description}
                      </p>
                    </div>
                  )}

                   <div className="flex space-x-3">
                     <Link href={`/student/classes/${classItem.id}`} className="flex-1">
                       <button className="w-full bg-[#034e64] text-white px-4 py-2 rounded-md text-[20px] cursor-pointer font-bold transition-colors hover:bg-[#023a4d]">
                         კლასის დეტალები
                       </button>
                     </Link>
                   </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default StudentClassesPage
