'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Subject {
  id: string
  name: string
  description?: string
}

const TestQuestionsForAll = () => {
  const router = useRouter()
  const [subjects, setSubjects] = useState<Subject[]>([])

  // Set predefined subjects
  useEffect(() => {
    const predefinedSubjects = [
      { id: 'history', name: 'ისტორია' },
      { id: 'geography', name: 'გეოგრაფია' },
      { id: 'georgian', name: 'ქართული ენა' },
      { id: 'biology', name: 'ბიოლოგია' }
    ]
    setSubjects(predefinedSubjects)
  }, [])

  const handleSubjectSelect = (subjectId: string) => {
    router.push(`/test/${subjectId}`)
  }

  return (
    <div className="bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-black mb-4">სცადე!</h1>
          <p className="text-xl text-black">აირჩიე საგანი, რომ დაიწყო ტესტი</p>
        </div>

        <div className="rounded-lg p-8">
          <div>
            <h2 className="text-2xl font-bold text-black mb-6 text-center">საგნები:</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {subjects.map((subject) => (
                <button
                  key={subject.id}
                  onClick={() => handleSubjectSelect(subject.id)}
                  className="w-full p-6 text-center rounded-lg border-2 transition-all duration-300 border-black hover:border-blue-500 hover:bg-blue-50 hover:shadow-lg transform hover:-translate-y-1"
                >
                  <span className="font-medium text-black text-lg">{subject.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TestQuestionsForAll