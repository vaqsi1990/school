'use client'

import { useState, useEffect } from 'react'
import { AdminOnly } from '@/components/auth/ProtectedRoute'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

const getQuestionTypeInGeorgian = (type: string) => {
  switch (type) {
    case 'OPEN_ENDED':
      return 'ღია კითხვა'
    case 'CLOSED_ENDED':
      return 'დახურული კითხვა'
    default:
      return type || 'არ არის მითითებული'
  }
}

interface SortableQuestionProps {
  question: QuestionPackage['questions'][0]
  packageId: string
  isReordering: boolean
  onEdit: () => void
}

function SortableQuestion({ question, packageId, isReordering, onEdit }: SortableQuestionProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }


  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center space-x-3 p-3 rounded-md transition-colors ${
        isDragging 
          ? 'bg-blue-100 shadow-lg' 
          : isReordering 
            ? 'bg-yellow-50 hover:bg-yellow-100 cursor-move' 
            : 'bg-gray-50'
      }`}
      {...attributes}
      {...(isReordering ? listeners : {})}
    >
      <div className="flex items-center space-x-2">
        <span className="text-black md:text-[16px] text-[14px] font-medium text-blue-600">
          {question.order}.
        </span>
        {isReordering && (
          <span className="text-gray-400 text-lg">⋮⋮</span>
        )}
      </div>
      <div className="flex-1">
        <div className="text-black md:text-[16px] text-[14px] font-medium">
          {question.question.text.length > 100 
            ? `${question.question.text.substring(0, 100)}...` 
            : question.question.text
          }
        </div>
        <div className="text-black md:text-[14px] text-[12px] text-gray-500">
          {question.question.subject?.name || 'საგანი არ არის მითითებული'} • კლასი: {question.question.grade} • რაუნდი: {question.question.round} • ტიპი: {getQuestionTypeInGeorgian(question.question.type)}
        </div>
      </div>
      {!isReordering && (
        <button
          onClick={onEdit}
          className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
        >
          რედაქტირება
        </button>
      )}
    </div>
  )
}

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
      type: string
      grade: number
      round: number
      chapterName?: string
      paragraphName?: string
    }
  }[]
  createdByAdmin?: {
    name: string
    lastname: string
  }
  createdByTeacher?: {
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
    type: '',
    grade: 7,
    round: 1,
    chapterName: '',
    paragraphName: ''
  })
  const [reorderingPackage, setReorderingPackage] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

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
      type: q.question.type,
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
          type: '',
          grade: 7,
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

  const handleDragEnd = async (event: DragEndEvent, packageId: string) => {
    const { active, over } = event

    if (!over || active.id === over.id) return

    try {
      // Update local state immediately for better UX
      const updatedPackages = packages.map(pkg => {
        if (pkg.id === packageId) {
          const oldIndex = pkg.questions.findIndex(q => q.id === active.id)
          const newIndex = pkg.questions.findIndex(q => q.id === over.id)
          
          const newQuestions = arrayMove(pkg.questions, oldIndex, newIndex)
          
          // Update order numbers
          const questionsWithNewOrder = newQuestions.map((q, index) => ({
            ...q,
            order: index + 1
          }))
          
          return { ...pkg, questions: questionsWithNewOrder }
        }
        return pkg
      })
      setPackages(updatedPackages)

      // Send update to server
      const response = await fetch(`/api/admin/question-packages/${packageId}/reorder`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionOrders: updatedPackages.find(pkg => pkg.id === packageId)?.questions.map(q => ({
            id: q.id,
            order: q.order
          })) || []
        })
      })

      if (!response.ok) {
        // Revert changes if server update failed
        await fetchPackages()
        console.error('Failed to update question order')
      }
    } catch (error) {
      console.error('Error reordering questions:', error)
      // Revert changes on error
      await fetchPackages()
    }
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
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-black md:text-[24px] text-[20px] font-bold mb-2">
              კითხვების პაკეტები
            </h1>
            <p className="text-black md:text-[18px] text-[16px] text-gray-600">
              მართეთ თქვენი შექმნილი კითხვების პაკეტები
            </p>
          </div>
          <a
            href="/admin/olympiads"
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md md:text-[18px] text-[16px] font-bold"
          >
            უკან დაბრუნება
          </a>
        </div>
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
                      შექმნილია: {pkg.createdByAdmin ? `${pkg.createdByAdmin.name} ${pkg.createdByAdmin.lastname}` : pkg.createdByTeacher ? `${pkg.createdByTeacher.name} ${pkg.createdByTeacher.lastname}` : 'უცნობი მომხმარებელი'} • {new Date(pkg.createdAt).toLocaleDateString('ka-GE')}
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
                      onClick={() => setReorderingPackage(reorderingPackage === pkg.id ? null : pkg.id)}
                      className={`px-3 py-1 rounded-md text-black md:text-[16px] text-[14px] ${
                        reorderingPackage === pkg.id 
                          ? 'bg-green-600 text-white hover:bg-green-700' 
                          : 'bg-yellow-600 text-white hover:bg-yellow-700'
                      }`}
                    >
                      {reorderingPackage === pkg.id ? 'რიგის შეცვლის დასრულება' : 'რიგის შეცვლა'}
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
                    <div className="mt-3">
                      {reorderingPackage === pkg.id ? (
                        <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                          <p className="text-black md:text-[16px] text-[14px] text-yellow-800">
                            💡 კითხვების რიგის შესაცვლელად გადაიტანეთ ისინი drag and drop-ით
                          </p>
                        </div>
                      ) : null}
                      
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={(event) => handleDragEnd(event, pkg.id)}
                      >
                        <SortableContext
                          items={pkg.questions.map(q => q.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          <div className="space-y-2">
                            {pkg.questions.map((q) => (
                              <SortableQuestion
                                key={q.id}
                                question={q}
                                packageId={pkg.id}
                                isReordering={reorderingPackage === pkg.id}
                                onEdit={() => handleEditQuestion(pkg, q)}
                              />
                            ))}
                          </div>
                        </SortableContext>
                      </DndContext>
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
                      onChange={(e) => setQuestionEditForm({ ...questionEditForm, grade: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black md:text-[18px] text-[16px]"
                    >
                      {[7, 8, 9, 10, 11, 12].map(grade => (
                        <option key={grade} value={grade}>{grade} კლასი</option>
                      ))}
                    </select>
                 </div>

                 <div>
                   <label className="block text-black md:text-[18px] text-[16px] font-medium mb-2">
                     რაუნდი *
                   </label>
                   <select
                     value={questionEditForm.round}
                     onChange={(e) => setQuestionEditForm({ ...questionEditForm, round: parseInt(e.target.value) || 1 })}
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
                   value={questionEditForm.correctAnswer || ''}
                   onChange={(e) => setQuestionEditForm({ ...questionEditForm, correctAnswer: e.target.value })}
                   className="w-full text-black placeholder:text-black px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black md:text-[18px] text-[16px]"
                 >
                   <option className="text-black" value="">აირჩიეთ სწორი პასუხი</option>
                   {questionEditForm.options.map((option, index) => (
                     option && <option className="text-black" key={index} value={option}>{option}</option>
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
                    type: '',
                    grade: 7,
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
