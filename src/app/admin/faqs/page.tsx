'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface FAQ {
  id: number
  question: string
  answer: string
  published: boolean
  createdAt: string
  updatedAt: string
}

export default function AdminFAQsPage() {
  const router = useRouter()
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null)
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    published: true
  })

  useEffect(() => {
    fetchFaqs()
  }, [])

  const fetchFaqs = async () => {
    try {
      const response = await fetch('/api/admin/faqs')
      if (response.ok) {
        const data = await response.json()
        setFaqs(data.faqs)
      }
    } catch (error) {
      console.error('Error fetching FAQs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateFaq = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/admin/faqs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await fetchFaqs()
        setShowCreateForm(false)
        setFormData({ question: '', answer: '', published: true })
      }
    } catch (error) {
      console.error('Error creating FAQ:', error)
    }
  }

  const handleUpdateFaq = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingFaq) return

    try {
      const response = await fetch(`/api/admin/faqs/[id]?id=${editingFaq.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await fetchFaqs()
        setEditingFaq(null)
        setFormData({ question: '', answer: '', published: true })
      }
    } catch (error) {
      console.error('Error updating FAQ:', error)
    }
  }

  const handleDeleteFaq = async (id: number) => {
    if (!confirm('ნამდვილად გსურთ ამ FAQ-ის წაშლა?')) return

    try {
      const response = await fetch(`/api/admin/faqs/[id]?id=${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchFaqs()
      }
    } catch (error) {
      console.error('Error deleting FAQ:', error)
    }
  }

  const startEdit = (faq: FAQ) => {
    setEditingFaq(faq)
    setFormData({
      question: faq.question,
      answer: faq.answer,
      published: faq.published
    })
    setShowCreateForm(false)
  }

  const cancelEdit = () => {
    setEditingFaq(null)
    setFormData({ question: '', answer: '', published: true })
  }

  const cancelCreate = () => {
    setShowCreateForm(false)
    setFormData({ question: '', answer: '', published: true })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">იტვირთება...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">FAQ მართვა</h1>
          <p className="mt-2 text-gray-600">მართეთ ხშირად დასმული კითხვები</p>
        </div>

        <div className="mb-6">
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
          >
            ახალი FAQ დამატება
          </button>
        </div>

        {/* Create Form */}
        {showCreateForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">ახალი FAQ დამატება</h2>
            <form onSubmit={handleCreateFaq} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  კითხვა
                </label>
                <input
                  type="text"
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  პასუხი
                </label>
                <textarea
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  required
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="published"
                  checked={formData.published}
                  onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="published" className="ml-2 block text-sm text-gray-900">
                  გამოქვეყნებული
                </label>
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
                >
                  შენახვა
                </button>
                <button
                  type="button"
                  onClick={cancelCreate}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md font-medium"
                >
                  გაუქმება
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Edit Form */}
        {editingFaq && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">FAQ რედაქტირება</h2>
            <form onSubmit={handleUpdateFaq} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  კითხვა
                </label>
                <input
                  type="text"
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  პასუხი
                </label>
                <textarea
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  required
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="edit-published"
                  checked={formData.published}
                  onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="edit-published" className="ml-2 block text-sm text-gray-900">
                  გამოქვეყნებული
                </label>
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
                >
                  განახლება
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md font-medium"
                >
                  გაუქმება
                </button>
              </div>
            </form>
          </div>
        )}

        {/* FAQs List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">FAQ სია</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {faqs.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">
                FAQ-ები ჯერ არ არის დამატებული
              </div>
            ) : (
              faqs.map((faq) => (
                <div key={faq.id} className="px-6 py-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {faq.question}
                      </h3>
                      <p className="text-gray-600 mb-3 whitespace-pre-wrap">
                        {faq.answer}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          faq.published 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {faq.published ? 'გამოქვეყნებული' : 'დაფარული'}
                        </span>
                        <span>
                          შექმნილი: {new Date(faq.createdAt).toLocaleDateString('ka-GE')}
                        </span>
                        <span>
                          განახლებული: {new Date(faq.updatedAt).toLocaleDateString('ka-GE')}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => startEdit(faq)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        რედაქტირება
                      </button>
                      <button
                        onClick={() => handleDeleteFaq(faq.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        წაშლა
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
