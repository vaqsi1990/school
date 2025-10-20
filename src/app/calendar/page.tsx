'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

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
}

interface GroupedEvents {
  [date: string]: CalendarEvent[]
}

const CalendarPage = () => {
  const router = useRouter()
  const [groupedEvents, setGroupedEvents] = useState<GroupedEvents>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedEventType, setSelectedEventType] = useState<string>('')
  // Removed currentMonth state since we're showing all events regardless of date
  const [showCurriculumModal, setShowCurriculumModal] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null)

  const eventTypes = [
    { value: '', label: 'ყველა' },
    { value: 'olympiad', label: 'ოლიმპიადა' }
  ]

  // Removed georgianMonths array since we're no longer using month navigation

  useEffect(() => {
    fetchEvents()
  }, [selectedEventType])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      
      if (selectedEventType) {
        params.append('eventType', selectedEventType)
      }
      
      // Removed month/year parameters since we're showing all events

      const response = await fetch(`/api/calendar?${params}`)
      const data = await response.json()
      
      if (response.ok) {
        setGroupedEvents(data.events || {})
      } else {
        setError(data.error || 'შეცდომა მოხდა კალენდრის ჩატვირთვისას')
      }
    } catch (error) {
      console.error('Error fetching events:', error)
      setError('სისტემური შეცდომა მოხდა')
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('ka-GE', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ka-GE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Georgian date formatting function
  const formatGeorgianDate = (dateString: string) => {
    const date = new Date(dateString)
    const georgianMonths = [
      'იანვარი', 'თებერვალი', 'მარტი', 'აპრილი',
      'მაისი', 'ივნისი', 'ივლისი', 'აგვისტო',
      'სექტემბერი', 'ოქტომბერი', 'ნოემბერი', 'დეკემბერი'
    ]
    
    const day = date.getDate()
    const month = georgianMonths[date.getMonth()]
    const year = date.getFullYear()
    
    return `${day} ${month}, ${year}`
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
    
    return imageMap[subjectName] || '/test/bgimage.jpg'
  }

  // Removed navigateMonth function since we're showing all events regardless of date

  const getEventTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      olympiad: 'bg-blue-500'
    }
    return colors[type] || colors.olympiad
  }

  const getEventTypeLabel = (type: string) => {
    const eventType = eventTypes.find(et => et.value === type)
    return eventType ? eventType.label : type
  }

  // Function to convert Arabic numerals to Roman numerals
  const toRomanNumeral = (num: number): string => {
    const romanNumerals: { [key: number]: string } = {
      1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V',
      6: 'VI', 7: 'VII', 8: 'VIII', 9: 'IX', 10: 'X',
      11: 'XI', 12: 'XII'
    }
    return romanNumerals[num] || num.toString()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">კალენდრის ჩატვირთვა...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={fetchEvents}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            კვლავ ცდა
          </button>
        </div>
      </div>
    )
  }

  const totalEvents = Object.values(groupedEvents).flat().length

  return (
    <div className="min-h-screen bg-gray-50">
      <div className=" mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black text-center mb-2">კალენდარი</h1>
          
        </div>

   


        {/* Events Cards */}
        {totalEvents === 0 ? (
          <div className="  p-6 text-center">
            <p className="text-gray-500">ღონისძიებები არ არის</p>
          </div>
        ) : (
          <div className="  p-6">
       
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ">
              {Object.entries(groupedEvents).map(([date, events]) => 
                events.map((event) => (
                  <div key={event.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 w-[300px] mx-auto">
                    {/* Card Header with Image */}
                    <div className="relative">
                      <Image
                        src={event.subject ? getSubjectImage(event.subject.name) : '/test/bgimage.jpg'}
                        alt={event.subject?.name || 'ღონისძიება'}
                        width={300}
                        height={120}
                        className="w-full h-56 object-cover rounded-t-lg"
                      />
                      <div className="absolute inset-0 bg-black/50 rounded-t-lg"></div>
                      <div className="absolute bottom-2 left-2 right-2">
                        <h3 className="text-[20px] md:text-[24px] font-bold text-white text-center mb-1">
                          {event.title}
                        </h3>
                        <span className={`px-3 py-2 rounded-full text-[16px] font-medium ${getEventTypeColor(event.eventType)} text-white`}>
                        {toRomanNumeral(event.rounds)} ტური
                        </span>
                      </div>
                    </div>
                    
                    {/* Card Content */}
                    <div className="p-4">
                      {/* Event Info */}
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <div className="flex-1">
                            <p className="text-[16px] font-medium text-black">
                              თარიღი: {formatGeorgianDate(event.startDate)}
                            </p>
                            {event.endDate && (
                              <p className="text-[16px] text-black">
                                დაწყების დრო: {formatTime(event.startDate)} სთ
                              </p>
                            )}
                            {event.endDate && (
                              <p className="text-[16px] text-black">
                                დასრულების დრო: {formatTime(event.endDate)} სთ
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="border-b border-dotted border-gray-300"></div>
                        
                     
                        
                        {event.grades && event.grades.length > 0 && (
                          <div className="flex items-center space-x-3">
                            <div className="flex-1">
                              <p className="text-[16px] font-medium text-black">
                                კლასები: {event.grades.sort().map(grade => toRomanNumeral(grade)).join(', ')} კლასი
                              </p>
                            </div>
                          </div>
                        )}
                        
                      
                        
                       
                      </div>
                    </div>
                    
                    {/* Card Footer */}
                    <div className="px-4 pb-4">
                      <button 
                        onClick={() => {
                          setSelectedEvent(event)
                          setShowCurriculumModal(true)
                          setSelectedGrade(null)
                        }}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-700 transition-colors duration-200 text-center text-[18px] cursor-pointer"
                      >
                        სასწავლო პროგრამა
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Curriculum Modal */}
        {showCurriculumModal && selectedEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Transparent background overlay */}
            <div 
              className="absolute inset-0 bg-black/50"
              onClick={() => setShowCurriculumModal(false)}
            />
            
            {/* Modal content */}
            <div className="relative bg-white rounded-lg shadow-xl p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              {/* Close button */}
              <button
                onClick={() => setShowCurriculumModal(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold z-10"
              >
                ×
              </button>
              
              {/* Modal content */}
              <div className="pr-8">
                {/* Header */}
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-bold text-black mb-4">
                    {selectedEvent.title}
                  </h1>
                  <p className="text-black text-[16px]">
                    აირჩიე კლასი და ნახე სასწავლო პროგრამა
                  </p>
                </div>

                {/* Grade Selection */}
                {!selectedGrade && selectedEvent.grades.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-xl font-bold text-black mb-4 text-center">კლასის არჩევა:</h2>
                    <div className="flex flex-wrap gap-4 justify-center">
                      {selectedEvent.grades.map((grade) => (
                        <button
                          key={grade}
                          onClick={() => setSelectedGrade(grade)}
                          className="px-6 py-3 cursor-pointer rounded-lg border-2 font-medium transition-colors duration-200 bg-white text-gray-700 border-gray-300 hover:border-blue-500"
                        >
                          {toRomanNumeral(grade)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Curriculum Content for selected grade */}
                {selectedGrade && (
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <h2 className="text-2xl font-bold text-black mb-2">
                        {toRomanNumeral(selectedGrade)} კლასის სასწავლო პროგრამა
                      </h2>
                      <button
                        onClick={() => setSelectedGrade(null)}
                        className="bg-blue-600 text-[16px] cursor-pointer text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        სხვა კლასის არჩევა
                      </button>
                    </div>

                    <div className="p-6 bg-gray-50 rounded-lg">
                    
                      
                      {/* Check if there's a specific curriculum for this grade */}
                      {selectedEvent.gradeCurriculums && selectedEvent.gradeCurriculums[selectedGrade.toString()] ? (
                        <div className=" p-4 ">
                         
                          <div className="text-gray-700 leading-relaxed">
                            {selectedEvent.gradeCurriculums[selectedGrade.toString()] && 
                             typeof selectedEvent.gradeCurriculums[selectedGrade.toString()] === 'object' ? (
                              <>
                               
                                <div className="text-gray-700">
                                  {(selectedEvent.gradeCurriculums[selectedGrade.toString()] as unknown as { title: string; content: string | null }).content}
                                </div>
                              </>
                            ) : (
                              <p className="text-gray-500 italic">
                                სასწავლო პროგრამა ჯერ არ არის დამატებული
                              </p>
                            )}
                          </div>
                        </div>
                      ) : selectedEvent.curriculum ? (
                        <div className="bg-white p-4 rounded-lg border">
                          <h4 className="text-lg font-semibold text-gray-900 mb-3">
                            {selectedEvent.curriculum.title}
                          </h4>
                          <div className="text-gray-700 leading-relaxed">
                            {selectedEvent.curriculum.content}
                          </div>
                        </div>
                      ) : (
                        <div className="bg-white p-4 rounded-lg border text-center">
                          <p className="text-gray-500 italic">
                            სასწავლო პროგრამა ჯერ არ არის დამატებული
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CalendarPage