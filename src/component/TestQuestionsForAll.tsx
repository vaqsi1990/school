'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

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
        <div className="text-center mb-4">
          <h1 className="text-4xl font-bold text-black mb-4">სცადე!</h1>
         
        </div>

        <div className="rounded-lg p-4">
          <div>
           
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-center max-w-4xl mx-auto">
              {subjects.map((subject) => (
                <div key={subject.id} className="flex flex-col items-center justify-center">
                
                <Image className=" object-cover shadow-lg rounded-full" src={subject.image} alt={subject.name} width={100} height={100} />
                <button
                  key={subject.id}
                  onClick={() => handleSubjectSelect(subject.id)}
                   className="w-full p-6 cursor-pointer hover:underline hover:decoration-black hover:decoration-2 text-center rounded-lg transition-all duration-300 border-black transform"
                >
                  <span className="font-medium text-black text-lg">{subject.name}</span>
                </button>
                
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TestQuestionsForAll