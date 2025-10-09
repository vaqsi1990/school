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

interface AppealNotification {
  id: string
  type: 'success' | 'error'
  title: string
  message: string
  adminComment?: string
  processedAt: string
  olympiadName: string
  reason: string
}

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
  
  return imageMap[subjectName] || '/test/bgimage.jpg' // fallback image
}
function StudentDashboardContent() {
  const { user, logout } = useAuth()
  const [selectedSubjects, setSelectedSubjects] = useState<Subject[]>([])
  const [loadingSubjects, setLoadingSubjects] = useState(true)
  const [notifications, setNotifications] = useState<AppealNotification[]>([])
  const [loadingNotifications, setLoadingNotifications] = useState(true)
  const [showNotifications, setShowNotifications] = useState(false)
  const [studentClasses, setStudentClasses] = useState<StudentClass[]>([])
  const [loadingClasses, setLoadingClasses] = useState(true)

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

    const fetchNotifications = async () => {
      if (!user?.id) return
      
      try {
        setLoadingNotifications(true)
        const response = await fetch('/api/student/appeal-notifications')
        if (response.ok) {
          const data = await response.json()
          setNotifications(data.notifications || [])
        }
      } catch (error) {
        console.error('Error fetching notifications:', error)
      } finally {
        setLoadingNotifications(false)
      }
    }

    const fetchStudentClasses = async () => {
      if (!user?.id) return
      
      try {
        setLoadingClasses(true)
        const response = await fetch('/api/student/classes')
        if (response.ok) {
          const data = await response.json()
          setStudentClasses(data.classes || [])
        }
      } catch (error) {
        console.error('Error fetching student classes:', error)
      } finally {
        setLoadingClasses(false)
      }
    }

    fetchSelectedSubjects()
    fetchNotifications()
    fetchStudentClasses()
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
       
      </motion.div>

      <div className=" mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Profile Information - Left Column */}
          <motion.div 
            className="lg:col-span-1 bg-white overflow-hidden shadow rounded-lg flex flex-col h-[500px] transition-all duration-300"
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
                  <span className="text-white md:text-[18px] text-[14px]">სახელი:</span>
                  <span className="md:text-[16px] text-[14px] font-medium text-white">
                    {user?.student?.name || 'არ არის მითითებული'}
                  </span>
                </motion.div>

              
                <motion.div
                  className="flex justify-between transition-all duration-300 p-2 rounded"
                
                >
                  <span className="md:text-[18px] text-[14px] text-white">გვარი:</span>
                  <span className="md:text-[18px] text-[14px] font-medium text-white">
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

          {/* Right Column - All Other Sections */}
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Olympiads Card */}
       

          {/* Results Section */}
          <motion.div 
            className=" overflow-hidden rounded-lg flex flex-col h-auto transition-all duration-300"
            variants={cardVariants}
          
            whileTap={{ scale: 0.95 }}
          >
            <div className="p-4 bg-white flex flex-col">
              <div className="flex items-center">
               
                <div className="ml-4">
                  <motion.h3 
                    className="text-black md:text-[20px] text-[16px]"
                  >
                    შედეგები
                  </motion.h3>
                </div>
              </div>
              <div className="mt-3 flex flex-col">
                    <motion.p 
                      className="text-black md:text-[17px] text-[14px]"
                    >
                  იხილეთ თქვენი ოლიმპიადების შედეგები და სტატისტიკა
                </motion.p>
                <motion.button 
                  className="mt-3 w-[70%] mx-auto cursor-pointer bg-[#f06905] text-white px-4 py-2 rounded-md md:text-[18px] text-[16px] font-bold"
                 
                  whileTap={{ scale: 0.95 }}
                >
                  <Link href="/student/results" className="block  md:text-[20px] text-[16px] w-full h-auto">
                    შედეგების ნახვა
                  </Link>
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Appeals Section */}
          <motion.div 
            className=" overflow-hidden rounded-lg flex flex-col h-auto transition-all duration-300"
            variants={cardVariants}
          
            whileTap={{ scale: 0.95 }}
          >
            <div className="p-4 bg-white flex flex-col">
              <div className="flex items-center justify-between">
                <div className="ml-4">
                  <motion.h3 
                    className="text-black md:text-[20px] text-[16px]"
                  >
                    გასაჩივრებები
                  </motion.h3>
                </div>
                {!loadingNotifications && notifications.length > 0 && (
                  <div className="flex items-center">
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      {notifications.length}
                    </span>
                  </div>
                )}
              </div>
              <div className="mt-3 flex flex-col">
                    <motion.p 
                      className="text-black md:text-[17px] text-[14px]"
                    >
                  ნახეთ თქვენი გასაჩივრებების სტატუსი და ადმინის პასუხები
                </motion.p>
                <motion.button 
                  className="mt-3 w-[70%] mx-auto cursor-pointer bg-[#dc2626] text-white px-4 py-2 rounded-md md:text-[18px] text-[16px] font-bold"
                 
                  whileTap={{ scale: 0.95 }}
                >
                  <Link href="/student/appeals" className="block  md:text-[20px] text-[16px] w-full h-auto">
                    გასაჩივრებების ნახვა
                  </Link>
                </motion.button>
                {notifications.length > 0 && (
                  <motion.button 
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="mt-2 w-[70%] mx-auto cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-md md:text-[16px] text-[14px] font-bold"
                    whileTap={{ scale: 0.95 }}
                  >
                    {showNotifications ? 'ნოთიფიკაციების დამალვა' : 'ნოთიფიკაციების ნახვა'}
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>

          {/* Notifications Section */}
          {showNotifications && notifications.length > 0 && (
            <motion.div 
              className="overflow-hidden rounded-lg flex flex-col h-auto"
              variants={cardVariants}
              initial="hidden"
              animate="visible"
            >
              <div className="p-4 bg-white flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-black md:text-[20px] text-[16px] font-bold">
                    გასაჩივრებების გადაწყვეტილებები
                  </h3>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-gray-500"
                  >
                    ✕
                  </button>
                </div>
                <div className="space-y-3">
                  {notifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      className={`p-3 rounded-lg border-l-4 ${
                        notification.type === 'success' 
                          ? 'bg-green-50 border-green-400' 
                          : 'bg-red-50 border-red-400'
                      }`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className={`font-semibold text-sm ${
                            notification.type === 'success' ? 'text-green-800' : 'text-red-800'
                          }`}>
                            {notification.title}
                          </h4>
                          <p className="text-gray-700 text-sm mt-1">
                            {notification.message}
                          </p>
                          {notification.adminComment && (
                            <div className="mt-2 p-2 bg-gray-100 rounded text-sm">
                              <p className="font-medium text-gray-600">ადმინის კომენტარი:</p>
                              <p className="text-gray-700">{notification.adminComment}</p>
                            </div>
                          )}
                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(notification.processedAt).toLocaleDateString('ka-GE', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Classes Section - Only show if student has classes */}
          {!loadingClasses && studentClasses.length > 0 && (
            <motion.div 
              className="overflow-hidden rounded-lg flex flex-col h-auto transition-all duration-300"
              variants={cardVariants}
           
            >
              <div className="p-4 bg-white flex flex-col">
                <div className="flex items-center">
                  <div className="ml-4">
                    <motion.h3 
                      className="text-black md:text-[20px] text-[16px]"
                    >
                      ჩემი კლასები
                    </motion.h3>
                  </div>
                </div>
                <div className="mt-3 flex flex-col">
                  <motion.p 
                    className="text-black md:text-[17px] text-[14px]"
                  >
                    კლასები სადაც თქვენ იმყოფებით
                  </motion.p>
                  
                  <motion.button 
                  className="mt-3 w-[70%] mx-auto cursor-pointer bg-green-600 text-white px-4 py-2 rounded-md md:text-[18px] text-[16px] font-bold"
                
                 
                >
                  <Link href="/student/classes" className="block bg-green-600 md:text-[20px] text-[16px] w-full h-auto">
                კლასების ნახვა
                  </Link>
                </motion.button>
                  
                </div>
              </div>
            </motion.div>
          )}

          {/* Class Tests Section */}
          <motion.div 
            className="overflow-hidden rounded-lg flex flex-col h-auto transition-all duration-300"
            variants={cardVariants}
            whileTap={{ scale: 0.95 }}
          >
            <div className="p-4 bg-white flex flex-col">
              <div className="flex items-center">
                <div className="ml-4">
                  <motion.h3 
                    className="text-black md:text-[20px] text-[16px]"
                  >
                    კლასის ტესტები
                  </motion.h3>
                </div>
              </div>
              <div className="mt-3 flex flex-col">
                <motion.p 
                  className="text-black md:text-[17px] text-[14px]"
                >
                  შეასრულეთ თქვენი კლასების ტესტები
                </motion.p>
                <motion.button 
                  className="mt-3 w-[70%] mx-auto cursor-pointer bg-orange-600 text-white px-4 py-2 rounded-md md:text-[18px] text-[16px] font-bold"
                  whileTap={{ scale: 0.95 }}
                >
                  <Link href="/student/class-tests" className="block md:text-[20px] text-[16px] w-full h-auto">
                    ტესტების ნახვა
                  </Link>
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Subject Selection Card */}
          <motion.div 
            className=" overflow-hidden rounded-lg flex flex-col h-auto  transition-all duration-300"
            variants={cardVariants}
         
           
          >
            <div className="p-4 bg-white flex flex-col">
              <div className="flex items-center">
               
                <div className="ml-4">
                  <motion.h3 
                    className="text-black md:text-[20px] text-[16px]"
               
                  >
                    საგნის არჩევა
                  </motion.h3>
                </div>
              </div>
              <div className="mt-3 flex flex-col">
                <motion.p 
                  className="text-black md:text-[17px] text-[14px]"
               
                >
                  აქ შეგიძლიათ საგნის არჩევა
                </motion.p>
               

                <motion.button 
                  className="mt-3 w-[70%] mx-auto cursor-pointer bg-green-600 text-white px-4 py-2 rounded-md md:text-[18px] text-[16px] font-bold"
                
                 
                >
                  <Link href="/student/subjects" className="block bg-green-600 md:text-[20px] text-[16px] w-full h-auto">
                 საგნის არჩევა
                  </Link>
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Selected Subjects Section */}
          {selectedSubjects.length > 0 && (
            <motion.div 
              className="md:col-span-2 overflow-hidden rounded-lg flex flex-col h-auto transition-all duration-300"
              variants={cardVariants}
           
            >
              <div className="p-4 bg-white flex flex-col">
                <div className="flex items-center">
                  <div className="ml-4">
                    <motion.h3 
                      className="text-black text-lg "
                   
                    >
                      არჩეული საგნები
                    </motion.h3>
                  </div>
                </div>
                <div className="mt-3 flex flex-col">
                  <motion.p 
                    className="text-black text-lg mb-4"
                  
                  >
                    თქვენი არჩეული საგნები:
                  </motion.p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedSubjects.map((subject) => (
                      <motion.div 
                        key={subject.id}
                        className="flex flex-col bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden transition-all duration-300"
                       
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
                                className="w-full bg-[#034e64] cursor-pointer text-white px-4 py-2 rounded-lg text-[16px] font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-[#034e64] focus:ring-offset-2"
                                whileTap={{ scale: 0.95 }}
                              >
                                დაწყება
                              </motion.button>
                            </Link>
                            <motion.button 
                              onClick={() => handleDeleteSubject(subject.id)}
                              className="bg-red-500 cursor-pointer text-white px-3 py-2 rounded-lg text-[16px] font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
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

          </div> {/* End of Right Column */}

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
