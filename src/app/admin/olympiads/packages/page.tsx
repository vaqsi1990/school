'use client'

import { useState, useEffect } from 'react'
import { AdminOnly } from '@/components/auth/ProtectedRoute'

interface QuestionPackage {
  id: string
  name: string
  description: string
  createdAt: string
  questions: {
    id: string
    order: number
    question: {
      id: string
      text: string
      subject: {
        name: string
      }
      options: string[]
      correctAnswer: string
      questionType: string
      grade: number
      round: number
      chapterName?: string
      paragraphName?: string
    }
  }[]
  createdByUser: {
    name: string
    lastname: string
  }
}

function AdminPackagesContent() {
  const [packages, setPackages] = useState<QuestionPackage[]>([])
  const [loading, setLoading] = useState(true)
  const [editingPackage, setEditingPackage] = useState<QuestionPackage | null>(null)
  const [editForm, setEditForm] = useState({ name: '', description: '' })
  const [deleteModal, setDeleteModal] = useState<string | null>(null)
  const [editingQuestion, setEditingQuestion] = useState<{ packageId: string; questionId: string; question: QuestionPackage['questions'][0]['question'] } | null>(null)
  const [expandedPackages, setExpandedPackages] = useState<Set<string>>(new Set())
  const [questionEditForm, setQuestionEditForm] = useState({
    text: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    questionType: '',
    grade: 1,
    round: 1,
    chapterName: '',
    paragraphName: ''
  })

  useEffect(() => {
    fetchPackages()
  }, [])

  const fetchPackages = async () => {
    try {
      const response = await fetch('/api/admin/question-packages')
      if (response.ok) {
        const data = await response.json()
        setPackages(data.packages)
      }
    } catch (error) {
      console.error('Error fetching packages:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (pkg: QuestionPackage) => {
    setEditingPackage(pkg)
    setEditForm({ name: pkg.name, description: pkg.description })
  }

  const handleSaveEdit = async () => {
    if (!editingPackage) return

    try {
      const response = await fetch(`/api/admin/question-packages/${editingPackage.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      })

      if (response.ok) {
        await fetchPackages()
        setEditingPackage(null)
        setEditForm({ name: '', description: '' })
      }
    } catch (error) {
      console.error('Error updating package:', error)
    }
  }

  const handleDelete = async (packageId: string) => {
    try {
      const response = await fetch(`/api/admin/question-packages/${packageId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchPackages()
        setDeleteModal(null)
      }
    } catch (error) {
      console.error('Error deleting package:', error)
    }
  }

  const handleEditQuestion = (pkg: QuestionPackage, q: QuestionPackage['questions'][0]) => {
    setEditingQuestion({ packageId: pkg.id, questionId: q.question.id, question: q.question })
    setQuestionEditForm({
      text: q.question.text,
      options: q.question.options || ['', '', '', ''],
      correctAnswer: q.question.correctAnswer,
      questionType: q.question.questionType,
      grade: q.question.grade,
      round: q.question.round,
      chapterName: q.question.chapterName || '',
      paragraphName: q.question.paragraphName || ''
    })
  }

  const handleSaveQuestionEdit = async () => {
    if (!editingQuestion) return

    try {
      const response = await fetch(`/api/admin/questions/${editingQuestion.questionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(questionEditForm)
      })

      if (response.ok) {
        await fetchPackages()
        setEditingQuestion(null)
        setQuestionEditForm({
          text: '',
          options: ['', '', '', ''],
          correctAnswer: '',
          questionType: '',
          grade: 1,
          round: 1,
          chapterName: '',
          paragraphName: ''
        })
      }
    } catch (error) {
      console.error('Error updating question:', error)
    }
  }

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...questionEditForm.options]
    newOptions[index] = value
    setQuestionEditForm({ ...questionEditForm, options: newOptions })
  }

  const togglePackageExpansion = (packageId: string) => {
    const newExpanded = new Set(expandedPackages)
    if (newExpanded.has(packageId)) {
      newExpanded.delete(packageId)
    } else {
      newExpanded.add(packageId)
    }
    setExpandedPackages(newExpanded)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-black md:text-[18px] text-[16px]">იტვირთება...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-black md:text-[24px] text-[20px] font-bold mb-2">
          კითხვების პაკეტები
        </h1>
        <p className="text-black md:text-[18px] text-[16px] text-gray-600">
          მართეთ თქვენი შექმნილი კითხვების პაკეტები
        </p>
      </div>

      <div className="grid gap-6">
        {packages.map((pkg) => (
          <div key={pkg.id} className="bg-white rounded-lg shadow-md p-6 border">
            {editingPackage?.id === pkg.id ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-black md:text-[18px] text-[16px] font-medium mb-2">
                    პაკეტის სახელი
                  </label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black md:text-[18px] text-[16px]"
                  />
                </div>
                <div>
                  <label className="block text-black md:text-[18px] text-[16px] font-medium mb-2">
                    აღწერა
                  </label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black md:text-[18px] text-[16px]"
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={handleSaveEdit}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-black md:text-[18px] text-[16px]"
                  >
                     შენახვა
                  </button>
                  <button
                    onClick={() => {
                      setEditingPackage(null)
                      setEditForm({ name: '', description: '' })
                    }}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-black md:text-[18px] text-[16px]"
                  >
                    გაუქმება
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-black md:text-[20px] text-[18px] font-semibold mb-2">
                      {pkg.name}
                    </h3>
                    {pkg.description && (
                      <p className="text-black md:text-[18px] text-[16px] text-gray-600 mb-3">
                        {pkg.description}
                      </p>
                    )}
                    <div className="text-black md:text-[16px] text-[14px] text-gray-500">
                      შექმნილია: {pkg.createdByUser.name} {pkg.createdByUser.lastname} • {new Date(pkg.createdAt).toLocaleDateString('ka-GE')}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(pkg)}
                      className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-black md:text-[16px] text-[14px]"
                    >
                       რედაქტირება
                    </button>
                    <button
                      onClick={() => setDeleteModal(pkg.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 text-black md:text-[16px] text-[14px]"
                    >
                      წაშლა
                    </button>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <button
                    onClick={() => togglePackageExpansion(pkg.id)}
                    className="w-full flex items-center justify-between p-3 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                  >
                    <h4 className="text-black md:text-[18px] text-[16px] font-medium">
                      კითხვები ({pkg.questions.length})
                    </h4>
                    <span className="text-black md:text-[18px] text-[16px]">
                      {expandedPackages.has(pkg.id) ? '▼' : '▶'}
                    </span>
                  </button>
                  
                  {expandedPackages.has(pkg.id) && (
                    <div className="mt-3 space-y-2">
                      {pkg.questions.map((q) => (
                        <div key={q.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-md">
                          <span className="text-black md:text-[16px] text-[14px] font-medium text-blue-600">
                            {q.order}.
                          </span>
                          <div className="flex-1">
                            <div className="text-black md:text-[16px] text-[14px] font-medium">
                              {q.question.text.length > 100 
                                ? `${q.question.text.substring(0, 100)}...` 
                                : q.question.text
                              }
                            </div>
                            <div className="text-black md:text-[14px] text-[12px] text-gray-500">
                              {q.question.subject?.name || 'საგანი არ არის მითითებული'} • კლასი: {q.question.grade} • რაუნდი: {q.question.round}
                            </div>
                          </div>
                          <button
                            onClick={() => handleEditQuestion(pkg, q)}
                            className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                          >
                            რედაქტირება
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {packages.length === 0 && (
          <div className="text-center py-12">
            <div className="text-black md:text-[18px] text-[16px] text-gray-500">
              ჯერ არ არის შექმნილი პაკეტები
            </div>
          </div>
        )}
      </div>

             {/* Delete Confirmation Modal */}
       {deleteModal && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
           <div className="bg-white rounded-lg p-6 max-w-md mx-4">
             <h3 className="text-black md:text-[20px] text-[18px] font-semibold mb-4">
               პაკეტის წაშლა
             </h3>
             <p className="text-black md:text-[18px] text-[16px] text-gray-600 mb-6">
               ნამდვილად გსურთ ამ პაკეტის წაშლა? ეს მოქმედება შეუქცევადია.
             </p>
             <div className="flex space-x-3">
               <button
                 onClick={() => handleDelete(deleteModal)}
                 className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-black md:text-[18px] text-[16px]"
               >
                 წაშლა
               </button>
               <button
                 onClick={() => setDeleteModal(null)}
                 className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-black md:text-[18px] text-[16px]"
               >
                 გაუქმება
               </button>
             </div>
           </div>
         </div>
       )}

       {/* Question Edit Modal */}
       {editingQuestion && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
           <div className="bg-white rounded-lg p-6 max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
             <h3 className="text-black md:text-[20px] text-[18px] font-semibold mb-4">
               კითხვის რედაქტირება
             </h3>
             
             <div className="space-y-4">
               <div>
                 <label className="block text-black md:text-[18px] text-[16px] font-medium mb-2">
                   კითხვის ტექსტი *
                 </label>
                 <textarea
                   value={questionEditForm.text}
                   onChange={(e) => setQuestionEditForm({ ...questionEditForm, text: e.target.value })}
                   rows={3}
                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black md:text-[18px] text-[16px]"
                 />
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                   <label className="block text-black md:text-[18px] text-[16px] font-medium mb-2">
                     კლასი *
                   </label>
                   <select
                     value={questionEditForm.grade}
                     onChange={(e) => setQuestionEditForm({ ...questionEditForm, grade: parseInt(e.target.value) })}
                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black md:text-[18px] text-[16px]"
                   >
                     {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(grade => (
                       <option key={grade} value={grade}>{grade}</option>
                     ))}
                   </select>
                 </div>

                 <div>
                   <label className="block text-black md:text-[18px] text-[16px] font-medium mb-2">
                     რაუნდი *
                   </label>
                   <select
                     value={questionEditForm.round}
                     onChange={(e) => setQuestionEditForm({ ...questionEditForm, round: parseInt(e.target.value) })}
                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black md:text-[18px] text-[16px]"
                   >
                     {[1, 2, 3].map(round => (
                       <option key={round} value={round}>{round}</option>
                     ))}
                   </select>
                 </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                   <label className="block text-black md:text-[18px] text-[16px] font-medium mb-2">
                     თავი
                   </label>
                   <input
                     type="text"
                     value={questionEditForm.chapterName}
                     onChange={(e) => setQuestionEditForm({ ...questionEditForm, chapterName: e.target.value })}
                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black md:text-[18px] text-[16px]"
                   />
                 </div>

                 <div>
                   <label className="block text-black md:text-[18px] text-[16px] font-medium mb-2">
                     პარაგრაფი
                   </label>
                   <input
                     type="text"
                     value={questionEditForm.paragraphName}
                     onChange={(e) => setQuestionEditForm({ ...questionEditForm, paragraphName: e.target.value })}
                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black md:text-[18px] text-[16px]"
                   />
                 </div>
               </div>

               <div>
                 <label className="block text-black md:text-[18px] text-[16px] font-medium mb-2">
                   პასუხის ვარიანტები *
                 </label>
                 <div className="space-y-2">
                   {questionEditForm.options.map((option, index) => (
                     <div key={index} className="flex items-center space-x-2">
                       <input
                         type="text"
                         value={option}
                         onChange={(e) => handleOptionChange(index, e.target.value)}
                         placeholder={`ვარიანტი ${index + 1}`}
                         className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black md:text-[18px] text-[16px]"
                       />
                     </div>
                   ))}
                 </div>
               </div>

               <div>
                 <label className="block text-black md:text-[18px] text-[16px] font-medium mb-2">
                   სწორი პასუხი *
                 </label>
                 <select
                   value={questionEditForm.correctAnswer}
                   onChange={(e) => setQuestionEditForm({ ...questionEditForm, correctAnswer: e.target.value })}
                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black md:text-[18px] text-[16px]"
                 >
                   <option value="">აირჩიეთ სწორი პასუხი</option>
                   {questionEditForm.options.map((option, index) => (
                     option && <option key={index} value={option}>{option}</option>
                   ))}
                 </select>
               </div>
             </div>

             <div className="flex space-x-3 mt-6">
               <button
                 onClick={handleSaveQuestionEdit}
                 className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-black md:text-[18px] text-[16px]"
               >
                 შენახვა
               </button>
               <button
                 onClick={() => {
                   setEditingQuestion(null)
                   setQuestionEditForm({
                     text: '',
                     options: ['', '', '', ''],
                     correctAnswer: '',
                     questionType: '',
                     grade: 1,
                     round: 1,
                     chapterName: '',
                     paragraphName: ''
                   })
                 }}
                 className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-black md:text-[18px] text-[16px]"
               >
                 გაუქმება
               </button>
             </div>
           </div>
         </div>
       )}
    </div>
  )
}

export default function AdminPackagesPage() {
  return (
    <AdminOnly>
      <AdminPackagesContent />
    </AdminOnly>
  )
}
