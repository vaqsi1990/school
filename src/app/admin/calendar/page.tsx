'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { toast } from 'react-hot-toast'

interface CalendarEvent {
  id: string
  title: string
  description?: string
  startDate: string
  endDate?: string
  eventType: string
  isActive: boolean
  subjectId?: string
  curriculumId?: string
  grades: number[]
  gradeCurriculums?: Record<string, string> // { "7": "curriculumId", "8": "curriculumId", ... }
  rounds: number // Number of rounds for the event
  createdByUser: {
    name: string
    lastname: string
  }
  subject?: {
    id: string
    name: string
  }
  curriculum?: {
    id: string
    title: string
    content: string
  }
  createdAt: string
  updatedAt: string
}

const CalendarManagement = () => {
  const { user } = useAuth()
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [subjects, setSubjects] = useState<{id: string, name: string}[]>([])
  const [curriculums, setCurriculums] = useState<{id: string, title: string, content: string}[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    startTime: '09:00',
    endDate: '',
    endTime: '17:00',
    eventType: 'olympiad',
    isActive: true,
    subjectId: '',
    curriculumId: '',
    grades: [] as number[],
    gradeCurriculums: {} as Record<string, string>,
    rounds: 1
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const eventTypes = [
    { value: 'olympiad', label: 'ოლიმპიადა' }
  ]

  const availableGrades = [7, 8, 9, 10, 11, 12]
  
  const roundsOptions = [
    { value: 1, label: 'I ტური' },
    { value: 2, label: 'II ტური' },
    { value: 3, label: 'III ტური' }
  ]

  useEffect(() => {
    fetchEvents()
    fetchSubjects()
    fetchCurriculums()
  }, [])

  const fetchSubjects = async () => {
    try {
      const response = await fetch('/api/subjects')
      const data = await response.json()
      
      if (response.ok) {
        setSubjects(data.subjects || [])
      }
    } catch (error) {
      console.error('Error fetching subjects:', error)
    }
  }

  const fetchCurriculums = async () => {
    try {
      const response = await fetch('/api/admin/curriculum')
      const data = await response.json()
      
      if (response.ok) {
        setCurriculums(data.curriculums || [])
      }
    } catch (error) {
      console.error('Error fetching curriculums:', error)
    }
  }

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/admin/calendar')
      const data = await response.json()
      
      if (response.ok) {
        setEvents(data.events)
      } else {
        toast.error(data.error || 'შეცდომა მოხდა კალენდრის ჩატვირთვისას')
      }
    } catch (error) {
      console.error('Error fetching events:', error)
      toast.error('სისტემური შეცდომა მოხდა')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const url = editingEvent 
        ? `/api/admin/calendar/${editingEvent.id}`
        : '/api/admin/calendar'
      
      const method = editingEvent ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          startDate: new Date(`${formData.startDate}T${formData.startTime}`).toISOString(),
          endDate: formData.endDate ? new Date(`${formData.endDate}T${formData.endTime}`).toISOString() : null,
          eventType: formData.eventType,
          isActive: formData.isActive,
          subjectId: formData.subjectId || null,
          curriculumId: formData.curriculumId || null,
          grades: formData.grades,
          gradeCurriculums: formData.gradeCurriculums,
          rounds: formData.rounds,
          ...(editingEvent && { id: editingEvent.id })
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(data.message || 'ღონისძიება წარმატებით შეინახა')
        setIsModalOpen(false)
        setEditingEvent(null)
        setFormData({
          title: '',
          description: '',
          startDate: '',
          startTime: '09:00',
          endDate: '',
          endTime: '17:00',
          eventType: 'olympiad',
          isActive: true,
          subjectId: '',
          curriculumId: '',
          grades: [],
          gradeCurriculums: {},
          rounds: 1
        })
        fetchEvents()
      } else {
        toast.error(data.error || 'შეცდომა მოხდა ღონისძიების შენახვისას')
      }
    } catch (error) {
      console.error('Error saving event:', error)
      toast.error('სისტემური შეცდომა მოხდა')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (event: CalendarEvent) => {
    setEditingEvent(event)
    const startDateTime = new Date(event.startDate)
    const endDateTime = event.endDate ? new Date(event.endDate) : null
    setFormData({
      title: event.title,
      description: event.description || '',
      startDate: startDateTime.toISOString().split('T')[0],
      startTime: startDateTime.toTimeString().slice(0, 5),
      endDate: endDateTime ? endDateTime.toISOString().split('T')[0] : '',
      endTime: endDateTime ? endDateTime.toTimeString().slice(0, 5) : '17:00',
      eventType: event.eventType,
      isActive: event.isActive,
      subjectId: event.subjectId || '',
      curriculumId: event.curriculumId || '',
      grades: event.grades,
      gradeCurriculums: event.gradeCurriculums || {},
      rounds: event.rounds || 1
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('ნამდვილად გსურთ ამ ღონისძიების წაშლა?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/calendar/${id}?id=${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(data.message || 'ღონისძიება წარმატებით წაიშალა')
        fetchEvents()
      } else {
        toast.error(data.error || 'შეცდომა მოხდა ღონისძიების წაშლისას')
      }
    } catch (error) {
      console.error('Error deleting event:', error)
      toast.error('სისტემური შეცდომა მოხდა')
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ka-GE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getEventTypeLabel = (type: string) => {
    const eventType = eventTypes.find(et => et.value === type)
    return eventType ? eventType.label : type
  }

  const handleGradeChange = (grade: number) => {
    setFormData(prev => ({
      ...prev,
      grades: prev.grades.includes(grade)
        ? prev.grades.filter(g => g !== grade)
        : [...prev.grades, grade]
    }))
  }

  const handleGradeCurriculumChange = (grade: number, curriculumId: string) => {
    setFormData(prev => ({
      ...prev,
      gradeCurriculums: {
        ...prev.gradeCurriculums,
        [grade.toString()]: curriculumId
      }
    }))
  }

  const getEventTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      olympiad: 'bg-blue-100 text-blue-800'
    }
    return colors[type] || colors.olympiad
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">კალენდრის მართვა</h1>
          <p className="mt-2 text-gray-600">მართეთ კალენდრის ღონისძიებები და მოვლენები</p>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">ღონისძიებები</h2>
              <button
                onClick={() => {
                  setEditingEvent(null)
                  setFormData({
                    title: '',
                    description: '',
                    startDate: '',
                    startTime: '09:00',
                    endDate: '',
                    endTime: '17:00',
                    eventType: 'olympiad',
                    isActive: true,
                    subjectId: '',
                    curriculumId: '',
                    grades: [],
                    gradeCurriculums: {},
                    rounds: 1
                  })
                  setIsModalOpen(true)
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
              >
                ახალი ღონისძიება
              </button>
            </div>
          </div>

          <div className="p-6">
            {events.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">ღონისძიებები ჯერ არ არის შექმნილი</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {events.map((event) => (
                  <div key={event.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {event.title}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEventTypeColor(event.eventType)}`}>
                            {getEventTypeLabel(event.eventType)}
                          </span>
                          {!event.isActive && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              არააქტიური
                            </span>
                          )}
                        </div>
                        
                        {event.description && (
                          <p className="text-gray-600 mb-2">{event.description}</p>
                        )}
                        
                        <div className="text-sm text-gray-500 space-y-1">
                          <p><strong>დაწყება:</strong> {formatDate(event.startDate)}</p>
                          {event.endDate && (
                            <p><strong>დასრულება:</strong> {formatDate(event.endDate)}</p>
                          )}
                          {event.subject && (
                            <p><strong>საგანი:</strong> {event.subject.name}</p>
                          )}
                          {event.curriculum && (
                            <p><strong>სასწავლო პროგრამა:</strong> {event.curriculum.title}</p>
                          )}
                          {event.grades && event.grades.length > 0 && (
                            <p><strong>კლასები:</strong> {event.grades.sort().join(', ')} კლასი</p>
                          )}
                          {event.gradeCurriculums && Object.keys(event.gradeCurriculums).length > 0 && (
                            <div className="mt-1">
                              <p><strong>კლასების სასწავლო პროგრამები:</strong></p>
                              {Object.entries(event.gradeCurriculums).map(([grade, curriculumId]) => {
                                const curriculum = curriculums.find(c => c.id === curriculumId)
                                return (
                                  <p key={grade} className="ml-2 text-xs">
                                    {grade} კლასი: {curriculum ? curriculum.title : 'უცნობი პროგრამა'}
                                  </p>
                                )
                              })}
                            </div>
                          )}
                          <p><strong>შექმნა:</strong> {event.createdByUser.name} {event.createdByUser.lastname}</p>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => handleEdit(event)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          რედაქტირება
                        </button>
                        <button
                          onClick={() => handleDelete(event.id)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          წაშლა
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingEvent ? 'ღონისძიების რედაქტირება' : 'ახალი ღონისძიება'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  სათაური *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="შეიყვანეთ სათაური"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  აღწერა
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  placeholder="შეიყვანეთ აღწერა"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  დაწყების თარიღი და დრო *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    required
                    value={formData.startTime.split(':')[0]}
                    onChange={(e) => {
                      const minutes = formData.startTime.split(':')[1] || '00'
                      setFormData(prev => ({ ...prev, startTime: `${e.target.value}:${minutes}` }))
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={i.toString().padStart(2, '0')}>
                        {i.toString().padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                  <select
                    value={formData.startTime.split(':')[1] || '00'}
                    onChange={(e) => {
                      const hours = formData.startTime.split(':')[0]
                      setFormData(prev => ({ ...prev, startTime: `${hours}:${e.target.value}` }))
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Array.from({ length: 60 }, (_, i) => (
                      <option key={i} value={i.toString().padStart(2, '0')}>
                        {i.toString().padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  დასრულების თარიღი და დრო
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    value={formData.endTime.split(':')[0]}
                    onChange={(e) => {
                      const minutes = formData.endTime.split(':')[1] || '00'
                      setFormData(prev => ({ ...prev, endTime: `${e.target.value}:${minutes}` }))
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={i.toString().padStart(2, '0')}>
                        {i.toString().padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                  <select
                    value={formData.endTime.split(':')[1] || '00'}
                    onChange={(e) => {
                      const hours = formData.endTime.split(':')[0]
                      setFormData(prev => ({ ...prev, endTime: `${hours}:${e.target.value}` }))
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Array.from({ length: 60 }, (_, i) => (
                      <option key={i} value={i.toString().padStart(2, '0')}>
                        {i.toString().padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ღონისძიების ტიპი
                </label>
                <select
                  value={formData.eventType}
                  onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {eventTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ტურები
                </label>
                <select
                  value={formData.rounds}
                  onChange={(e) => setFormData({ ...formData, rounds: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {roundsOptions.map((round) => (
                    <option key={round.value} value={round.value}>
                      {round.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  საგანი
                </label>
                <select
                  value={formData.subjectId}
                  onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">აირჩიეთ საგანი</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  სასწავლო პროგრამა
                </label>
                <select
                  value={formData.curriculumId}
                  onChange={(e) => setFormData({ ...formData, curriculumId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">აირჩიეთ სასწავლო პროგრამა</option>
                  {curriculums.map((curriculum) => (
                    <option key={curriculum.id} value={curriculum.id}>
                      {curriculum.title}
                    </option>
                  ))}
                </select>
              </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      კლასები და სასწავლო პროგრამები
                    </label>
                    <div className="space-y-2">
                      {availableGrades.map((grade) => (
                        <div key={grade} className="border rounded p-2">
                          <label className="flex items-center space-x-2 mb-2">
                            <input
                              type="checkbox"
                              checked={formData.grades.includes(grade)}
                              onChange={() => handleGradeChange(grade)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="text-sm font-medium text-gray-700">{grade} კლასი</span>
                          </label>
                          {formData.grades.includes(grade) && (
                            <div className="ml-6">
                              <label className="block text-xs text-gray-600 mb-1">
                                სასწავლო პროგრამა:
                              </label>
                              <select
                                value={formData.gradeCurriculums[grade.toString()] || ''}
                                onChange={(e) => handleGradeCurriculumChange(grade, e.target.value)}
                                className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              >
                                <option value="">აირჩიეთ სასწავლო პროგრამა</option>
                                {curriculums.map((curriculum) => (
                                  <option key={curriculum.id} value={curriculum.id}>
                                    {curriculum.title}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                  აქტიური
                </label>
              </div>

              <div className="flex space-x-3 pt-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-md font-medium"
                >
                  {isSubmitting ? 'მიმდინარეობს...' : (editingEvent ? 'განახლება' : 'შექმნა')}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md font-medium"
                >
                  გაუქმება
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default function CalendarManagementPage() {
  return (
    <ProtectedRoute allowedUserTypes={['ADMIN']}>
      <CalendarManagement />
    </ProtectedRoute>
  )
}
