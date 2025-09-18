'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion } from 'framer-motion'

interface Subject {
  id: string
  name: string
  description?: string
  image: string
}

const TestQuestionsForAll = () => {
  const router = useRouter()
  const [subjects, setSubjects] = useState<Subject[]>([])

  // Set predefined subjects
  useEffect(() => {
    const predefinedSubjects = [
      { id: 'history', name: 'ისტორია', image: '/test/ისტორია.jpg' },
      { id: 'geography', name: 'გეოგრაფია', image: '/test/გეოგრაფია.jpg' },
      { id: 'georgian', name: 'ქართული ენა და ლიტერატურა', image: '/test/ქართული.jpg' }
    ]
    setSubjects(predefinedSubjects)
  }, [])

  const handleSubjectSelect = (subjectId: string) => {
    router.push(`/test/${subjectId}`)
  }

  return (
    <div className="bg-gray-50 md:py-16 py-5 ">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div 
          className="text-center mb-4"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <motion.h1 
            className="text-4xl font-bold text-black mb-4"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            სცადე!
          </motion.h1>
         
        </motion.div>

        <div className="rounded-lg p-4">
          <div>
           
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-center max-w-4xl mx-auto">
              {subjects.map((subject, index) => (
                <motion.div 
                  key={subject.id} 
                  className="flex flex-col items-center justify-center"
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -10 }}
                >
                
                <motion.div 
                  className="relative w-48 h-48 mb-4"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  <Image 
                    className="object-cover shadow-lg rounded-full" 
                    src={subject.image} 
                    alt={subject.name} 
                    fill
                  />
                </motion.div>
                <motion.button
                  key={subject.id}
                  onClick={() => handleSubjectSelect(subject.id)}
                  className="bg-[#034e64] cursor-pointer text-white px-4 py-2 rounded-md md:text-[20px] text-[16px] font-bold transition-colors hover:bg-[#023a4d]"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="font-medium text-white text-lg">{subject.name}</span>
                </motion.button>
                
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TestQuestionsForAll