'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion } from 'framer-motion'
import TestPageModal from '@/components/TestPageModal'

interface Subject {
  id: string
  name: string
  description?: string
  image: string
}

const TestQuestionsForAll = () => {
  const router = useRouter()
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [showModal, setShowModal] = useState(false)
  const [selectedSubjectId, setSelectedSubjectId] = useState('')

  // Set predefined subjects
  useEffect(() => {
    const predefinedSubjects = [
      { id: 'history', name: 'ისტორია', image: '/test/ისტორია.jpg' },
      { id: 'geography', name: 'გეოგრაფია', image: '/test/გეოგრაფია.jpg' },
      { id: 'georgian', name: 'ქართული ენა', image: '/test/ქართული.jpg' }
    ]
    setSubjects(predefinedSubjects)
  }, [])

  const handleSubjectSelect = (subjectId: string) => {
    setSelectedSubjectId(subjectId)
    setShowModal(true)
  }

  return (
    <div 
      className="md:py-16 py-5 relative"
      style={{
        backgroundImage: 'url(/test/bgimage.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/50 bg-opacity-30"></div>
      
      {/* Content */}
      <div className="relative z-10">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div 
          className="text-center mb-4"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <motion.h1 
            className="text-3xl font-bold text-white mb-4"
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
                  className="bg-[#f06905] cursor-pointer text-white px-4 py-2 rounded-md md:text-[20px] text-[16px] font-bold transition-colors "
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="font-bold text-white text-lg">{subject.name}</span>
                </motion.button>
                
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* Test Page Modal */}
      <TestPageModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        subjectId={selectedSubjectId}
      />
    </div>
  )
}

export default TestQuestionsForAll