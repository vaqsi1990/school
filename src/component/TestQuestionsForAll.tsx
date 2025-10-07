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
}

const TestQuestionsForAll = () => {
  const router = useRouter()
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [showModal, setShowModal] = useState(false)
  const [selectedSubjectId, setSelectedSubjectId] = useState('')
  const [showAllSubjects, setShowAllSubjects] = useState(false)
  const [loading, setLoading] = useState(true)

  // Fetch subjects from API
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await fetch('/api/subjects')
        if (response.ok) {
          const data = await response.json()
          // Filter out ეროვნული გამოცდები
          const filteredSubjects = data.subjects.filter((subject: Subject) => 
            subject.name !== 'ერთიანი ეროვნული გამოცდები'
          )
          setSubjects(filteredSubjects)
        }
      } catch (error) {
        console.error('Error fetching subjects:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSubjects()
  }, [])

  // Map subject names to image paths
  const getSubjectImage = (subjectName: string) => {
    const imageMap: { [key: string]: string } = {
      'მათემატიკა': '/test/მათემატიკა.jpg',
      'ფიზიკა': '/test/ფიზიკა.jpg',
      'ქიმია': '/test/ქიმია.jpg',
      'ბიოლოგია': '/test/ბიოლოგია.jpg',
      'ისტორია': '/test/ისტორია.jpg',
      'გეოგრაფია': '/test/გეოგრაფია.jpg',
      'ქართული ენა': '/test/ქართული.jpg',
      'ინგლისური ენა': '/test/ინგლისური.jpg'
    }
    return imageMap[subjectName] || '/test/dafa.jpeg' // fallback image
  }

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
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                <p className="text-white text-lg">იტვირთება...</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-4  gap-13 justify-center max-w-4xl mx-auto">
                  {subjects.slice(0, showAllSubjects ? subjects.length : 4).map((subject, index) => (
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
                        src={getSubjectImage(subject.name)} 
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
                
                {/* Show/Hide button */}
                {subjects.length > 4 && (
                  <div className="text-center mt-8">
                    <motion.button
                      onClick={() => setShowAllSubjects(!showAllSubjects)}
                      className="bg-white/20 cursor-pointer text-white md:text-[20px] text-[16px] hover:bg-white/30 px-6 py-3 rounded-lg font-semibold transition-colors backdrop-blur-sm"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {showAllSubjects ? 'დამალვა' : `ყველას ჩვენება`}
                    </motion.button>
                  </div>
                )}
              </>
            )}
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