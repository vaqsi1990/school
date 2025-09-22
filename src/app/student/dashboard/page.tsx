'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { StudentOnly } from '@/components/auth/ProtectedRoute'
import Link from 'next/link';
import { motion } from 'framer-motion';
interface Subject {
  id: string
  name: string
  description: string
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
  
  return imageMap[subjectName] || '/test/bgimage.jpg' // fallback image
}
function StudentDashboardContent() {
  const { user, logout } = useAuth()
  const [selectedSubjects, setSelectedSubjects] = useState<Subject[]>([])
  const [loadingSubjects, setLoadingSubjects] = useState(true)

  useEffect(() => {
    const fetchSelectedSubjects = async () => {
      if (!user?.id) return
      
      try {
        setLoadingSubjects(true)
        const response = await fetch(`/api/student/selected-subjects?userId=${user.id}`)
        if (response.ok) {
          const data = await response.json()
          setSelectedSubjects(data.subjects || [])
        }
      } catch (error) {
        console.error('Error fetching selected subjects:', error)
      } finally {
        setLoadingSubjects(false)
      }
    }

    fetchSelectedSubjects()
  }, [user?.id])

  const handleDeleteSubject = async (subjectId: string) => {
    if (!user?.id) return
    
    try {
      const response = await fetch('/api/student/delete-subject', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          subjectId: subjectId
        })
      })
      
      if (response.ok) {
        // Remove from selected subjects
        setSelectedSubjects(prev => prev.filter(subject => subject.id !== subjectId))
        alert('საგანი წარმატებით წაიშალა!')
      } else {
        const errorData = await response.json()
        alert(`შეცდომა: ${errorData.error || 'საგნის წაშლა ვერ მოხერხდა'}`)
      }
    } catch (error) {
      console.error('Error deleting subject:', error)
      alert('საგნის წაშლა ვერ მოხერხდა')
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  }

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 50,
      scale: 0.9
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6
      }
    }
  }

  const headerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.8
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <motion.div 
        className="bg-white shadow"
        variants={headerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <motion.div
              variants={headerVariants}
              initial="hidden"
              animate="visible"
            >
              <h1 className="text-2xl font-bold text-black md:text-[25px] text-[20px]">
                მოსწავლის პროფილი
              </h1>
              <p className="text-black md:text-[18px] text-[16px]">
                კეთილი იყოს თქვენი მობრძანება, {user?.student?.name || user?.email} {user?.student?.lastname || ''}
              </p>
              <p className="text-black md:text-[18px] text-[16px]">
                როლი: მოსწავლე
              </p>
            </motion.div>
            
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 grid-cols-1 md:grid-cols-3 sm:px-6 lg:px-8 py-8">
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Enhanced Student Info Card */}

      
          <motion.div 
            className="bg-white  overflow-hidden shadow rounded-lg flex flex-col h-[500px] hover:shadow-xl hover:scale-105 transition-all duration-300"
            variants={cardVariants}
            style={{
              backgroundImage: 'url(/test/dafa.jpeg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="p-10 flex flex-col">
              <div className="flex items-center">
               
                <div className="ml-4">
                  <motion.h3 
                    className="text-white md:text-[18px] text-[16px]"
                  
                  >
                    პროფილის ინფორმაცია
                  </motion.h3>
                </div>
              </div>
              <div className="mt-3 space-y-2">
                <motion.div 
                  className="flex justify-between transition-all duration-300  p-2 rounded"
                
                >
                  <span className="text-white md:text-[16px] text-[14px]">სახელი:</span>
                  <span className="md:text-[16px] text-[14px] font-medium text-white">
                    {user?.student?.name || 'არ არის მითითებული'}
                  </span>
                </motion.div>

                <motion.div 
                  className="flex justify-between transition-all duration-300  p-2 rounded"
                
                >
                  <span className="text-white md:text-[16px] text-[14px]">სტატუსი:</span>
                  <span className="md:text-[16px] text-[14px] font-medium text-white">
                 მოსწავლე
                  </span>
                </motion.div>
                <motion.div 
                  className="flex justify-between transition-all duration-300 p-2 rounded"
                
                >
                  <span className="md:text-[16px] text-[14px] text-white">გვარი:</span>
                  <span className="md:text-[16px] text-[14px] font-medium text-white">
                    {user?.student?.lastname || 'არ არის მითითებული'}
                  </span>
                </motion.div>
                <motion.div 
                  className="flex justify-between transition-all duration-300  p-2 rounded"
                 
                >
                  <span className="md:text-[16px] text-[14px] text-white">კლასი:</span>
                  <span className="md:text-[16px] text-[14px] font-medium text-white">
                    {user?.student?.grade || 'არ არის მითითებული'}
                  </span>
                </motion.div>
                <motion.div 
                  className="flex justify-between transition-all duration-300 p-2 rounded"
                 
                >
                  <span className="md:text-[16px] text-[14px] text-white">სკოლა:</span>
                  <span className="md:text-[16px] text-[14px] font-medium text-white">
                    {user?.student?.school || 'არ არის მითითებული'}
                  </span>
                </motion.div>
                <motion.div 
                  className="flex justify-between transition-all duration-300  p-2 rounded"
                
                >
                  <span className="md:text-[16px] text-[14px] text-white">ტელეფონი:</span>
                  <span className="md:text-[16px] text-[14px] font-medium text-white">
                    {user?.student?.phone || 'არ არის მითითებული'}
                  </span>
                </motion.div>
                <motion.div 
                  className="flex justify-between transition-all duration-300  p-2 rounded"
                
                >
                  <span className="md:text-[16px] text-[14px] text-white">კოდი:</span>
                  <span className="md:text-[16px] text-[14px] font-medium text-white">
                    {user?.student?.code || 'არ არის მითითებული'}
                  </span>
                </motion.div>
                <motion.div 
                  className="flex justify-between transition-all duration-300  p-2 rounded"
                 
                >
                  <span className="md:text-[16px] text-[14px] text-white">ელ-ფოსტა:</span>
                  <span className="md:text-[15px] text-[14px] font-medium text-white">
                    {user?.email || 'არ არის მითითებული'}
                  </span>
                </motion.div>
                
              </div>

              
            </div>
          </motion.div>

          {/* Olympiads Card */}
          <motion.div 
            className=" overflow-hidden rounded-lg flex flex-col h-auto  hover:scale-105 transition-all duration-300"
            variants={cardVariants}
          
            whileTap={{ scale: 0.95 }}
          >
            <div className="p-4 bg-white flex flex-col">
              <div className="flex items-center">
               
                <div className="ml-4">
                  <motion.h3 
                    className="text-black md:text-[18px] text-[16px]"
                    whileHover={{ scale: 1.05 }}
                  >
                ჩანიშნული    ოლიმპიადები
                  </motion.h3>
                </div>
              </div>
              <div className="mt-3 flex flex-col">
                <motion.p 
                  className="text-black md:text-[16px] text-[14px]"
                 
                >
                  აქ შეგიძლიათ ნახოთ  ჩანიშნული ოლიმპიადების სია
                </motion.p>
                <motion.button 
                  className="mt-3 w-full cursor-pointer bg-[#034e64] text-white px-4 py-2 rounded-md md:text-[18px] text-[16px] font-bold"
               
                  whileTap={{ scale: 0.95 }}
                >
                  <Link href="/student/registered" className="block bg-[#034e64] w-full h-auto">
                  ჩანიშნული ოლიმპიადების ნახვა
                  </Link>
                </motion.button>

               
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            className=" overflow-hidden rounded-lg flex flex-col h-auto  hover:scale-105 transition-all duration-300"
            variants={cardVariants}
         
            whileTap={{ scale: 0.95 }}
          >
            <div className="p-4 h-44 bg-white flex flex-col">
              <div className="flex items-center">
               
                <div className="ml-4">
                  <motion.h3 
                    className="text-black md:text-[18px] text-[16px]"
               
                  >
                    საგნის არჩევა
                  </motion.h3>
                </div>
              </div>
              <div className="mt-3 flex flex-col">
                <motion.p 
                  className="text-black md:text-[16px] text-[14px]"
                  whileHover={{ scale: 1.02 }}
                >
                  აქ შეგიძლიათ საგნის არჩევა.
                </motion.p>
               

                <motion.button 
                  className="mt-9 w-full cursor-pointer bg-[#034e64] text-white px-4 py-2 rounded-md md:text-[18px] text-[16px] font-bold"
                
                  whileTap={{ scale: 0.95 }}
                >
                  <Link href="/student/subjects" className="block bg-[#034e64] w-full h-auto">
                 საგნის არჩევა
                  </Link>
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Selected Subjects Section */}
          {selectedSubjects.length > 0 && (
            <motion.div 
              className="overflow-hidden rounded-lg flex flex-col h-auto hover:scale-105 transition-all duration-300 md:col-span-2"
              variants={cardVariants}
              whileTap={{ scale: 0.95 }}
            >
              <div className="p-4 bg-white flex flex-col">
                <div className="flex items-center">
                  <div className="ml-4">
                    <motion.h3 
                      className="text-black md:text-[18px] text-[16px]"
                      whileHover={{ scale: 1.05 }}
                    >
                      არჩეული საგნები
                    </motion.h3>
                  </div>
                </div>
                <div className="mt-3 flex flex-col">
                  <motion.p 
                    className="text-black md:text-[16px] text-[14px] mb-4"
                    whileHover={{ scale: 1.02 }}
                  >
                    თქვენი არჩეული საგნები:
                  </motion.p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedSubjects.map((subject) => (
                      <motion.div 
                        key={subject.id}
                        className="flex flex-col bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300"
                        whileHover={{ scale: 1.02, y: -2 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        {/* Subject Image */}
                        <div className="w-full h-48 relative overflow-hidden">
                          <img 
                            src={getSubjectImage(subject.name)}
                            alt={subject.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                        </div>
                        
                        {/* Card Content */}
                        <div className="p-4 flex-1 flex flex-col">
                          <h3 className="text-gray-900 font-semibold text-lg mb-3 line-clamp-2">
                            {subject.name}
                          </h3>
                          
                          {/* Action Buttons */}
                          <div className="mt-auto flex space-x-2">
                            <Link href={`/student/subjects/${subject.id}`} className="flex-1">
                              <motion.button 
                                className="w-full bg-[#034e64] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-[#023a4d] focus:outline-none focus:ring-2 focus:ring-[#034e64] focus:ring-offset-2"
                                whileTap={{ scale: 0.95 }}
                              >
                                დაწყება
                              </motion.button>
                            </Link>
                            <motion.button 
                              onClick={() => handleDeleteSubject(subject.id)}
                              className="bg-red-500 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                              whileTap={{ scale: 0.95 }}
                            >
                              წაშლა
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
         
          <motion.div 
            className=" overflow-hidden rounded-lg flex flex-col h-auto  hover:scale-105 transition-all duration-300"
            variants={cardVariants}
          
            whileTap={{ scale: 0.95 }}
          >
            <div className="p-4 bg-white flex flex-col">
              <div className="flex items-center">
               
                <div className="ml-4">
                  <motion.h3 
                    className="text-black md:text-[18px] text-[16px]"
                    whileHover={{ scale: 1.05 }}
                  >
                    შედეგები
                  </motion.h3>
                </div>
              </div>
              <div className="mt-3 flex flex-col">
                    <motion.p 
                      className="text-black md:text-[16px] text-[14px]"
                      whileHover={{ scale: 1.02 }}
                    >
                  იხილეთ თქვენი ოლიმპიადების შედეგები და სტატისტიკა.
                </motion.p>
                <motion.button 
                  className="mt-3 w-full cursor-pointer bg-[#f06905] text-white px-4 py-2 rounded-md md:text-[18px] text-[16px] font-bold"
                 
                  whileTap={{ scale: 0.95 }}
                >
                  <Link href="/student/results" className="block  w-full h-auto">
                    შედეგების ნახვა
                  </Link>
                </motion.button>
              </div>
            </div>
          </motion.div>


        </motion.div>
      </div>
    </div>
  )
}

export default function StudentDashboardPage() {
  return (
    <StudentOnly>
      <StudentDashboardContent />
    </StudentOnly>
  )
}
