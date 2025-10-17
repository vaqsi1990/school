'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface OlympiadEvent {
  id: string
  name: string
  description: string
  startDate: string
  endDate: string
  registrationStartDate: string
  registrationDeadline: string
  subjects: string[]
  grades: number[]
  isActive: boolean
  maxParticipants: number
  duration: number
  rounds: number
  createdByUser: {
    name: string
    lastname: string
  }
  curriculum?: {
    id: string
    title: string
    content: string
  } | null
}

interface CalendarEvent {
  id: string
  title: string
  description: string
  startDate: Date
  endDate: Date
  registrationStartDate: Date
  registrationDeadline: Date
  subjects: string[]
  grades: number[]
  isActive: boolean
  maxParticipants: number
  duration: number
  rounds: number
  createdBy: string
  curriculum?: {
    id: string
    title: string
    content: string
  } | null
}

const CalendarPage = () => {
  const router = useRouter()
  const [olympiads, setOlympiads] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([
    'გეოგრაფია',
    'ისტორია', 
    'ინგლისური ენა',
    'ქართული ენა'
  ])
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedOlympiad, setSelectedOlympiad] = useState<CalendarEvent | null>(null)
  const [expandedOlympiad, setExpandedOlympiad] = useState<string | null>(null)

  // Georgian month names
  const georgianMonths = [
    'იანვარი', 'თებერვალი', 'მარტი', 'აპრილი',
    'მაისი', 'ივნისი', 'ივლისი', 'აგვისტო',
    'სექტემბერი', 'ოქტომბერი', 'ნოემბერი', 'დეკემბერი'
  ]

  const georgianDays = ['კვ', 'ორ', 'სამ', 'ოთხ', 'ხუთ', 'პარ', 'შაბ']

  useEffect(() => {
    fetchOlympiads()
  }, [selectedSubjects])

  const fetchOlympiads = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Create query string for subjects filter
      const subjectsQuery = selectedSubjects.join(',')
      const response = await fetch(`/api/calendar?subjects=${encodeURIComponent(subjectsQuery)}`)
      
      if (response.ok) {
        const data = await response.json()
        const olympiadEvents: OlympiadEvent[] = data.olympiads || []
        
        // If no real olympiads exist, show message
        if (olympiadEvents.length === 0) {
          setOlympiads([])
          setError('ამ საგნებზე ოლიმპიადები ჯერ არ არის შექმნილი')
          return
        }
        
        // Transform olympiads
        const transformedOlympiads: CalendarEvent[] = olympiadEvents
          .map(olympiad => ({
            id: olympiad.id,
            title: olympiad.name,
            description: olympiad.description || '',
            startDate: new Date(olympiad.startDate),
            endDate: new Date(olympiad.endDate),
            registrationStartDate: new Date(olympiad.registrationStartDate),
            registrationDeadline: new Date(olympiad.registrationDeadline),
            subjects: olympiad.subjects,
            grades: olympiad.grades,
            isActive: olympiad.isActive,
            maxParticipants: olympiad.maxParticipants || 999999,
            duration: olympiad.duration || 60,
            rounds: olympiad.rounds || 3,
            createdBy: `${olympiad.createdByUser.name} ${olympiad.createdByUser.lastname}`,
            curriculum: olympiad.curriculum
          }))
          .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
        
        setOlympiads(transformedOlympiads)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'ოლიმპიადების ჩატვირთვა ვერ მოხერხდა')
      }
    } catch (error) {
      console.error('Error fetching olympiads:', error)
      setError('სისტემური შეცდომა მოხდა')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ka-GE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
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

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ka-GE', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()
    
    const days = []
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }
    
    return days
  }

  const getOlympiadsForDate = (date: Date) => {
    return olympiads.filter(olympiad => {
      const olympiadDate = new Date(olympiad.startDate)
      return olympiadDate.toDateString() === date.toDateString()
    })
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev)
      if (direction === 'prev') {
        newMonth.setMonth(prev.getMonth() - 1)
      } else {
        newMonth.setMonth(prev.getMonth() + 1)
      }
      return newMonth
    })
  }

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    const olympiadsForDate = getOlympiadsForDate(date)
    if (olympiadsForDate.length > 0) {
      setSelectedOlympiad(olympiadsForDate[0])
    } else {
      setSelectedOlympiad(null)
    }
  }

  const toggleSubjectFilter = (subject: string) => {
    setSelectedSubjects(prev => 
      prev.includes(subject) 
        ? prev.filter(s => s !== subject)
        : [...prev, subject]
    )
  }

  const getSubjectColor = (subject: string) => {
    const colors: { [key: string]: string } = {
      'გეოგრაფია': 'bg-blue-100 text-blue-800',
      'ისტორია': 'bg-green-100 text-green-800',
      'ინგლისური ენა': 'bg-purple-100 text-purple-800',
      'ქართული ენა': 'bg-red-100 text-red-800'
    }
    return colors[subject] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">ოლიმპიადების ჩატვირთვა...</p>
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
            onClick={fetchOlympiads}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            კვლავ ცდა
          </button>
        </div>
      </div>
    )
  }

  const days = getDaysInMonth(currentMonth)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">ოლიმპიადების კალენდარი</h1>
          <p className="text-gray-600">შეარჩიეთ საგნები და ნახეთ ოლიმპიადების განრიგი</p>
        </div>

    

        {/* Calendar Section */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">კალენდარი</h2>
            
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <h3 className="text-lg font-semibold text-gray-900">
                {georgianMonths[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </h3>
              
              <button
                onClick={() => navigateMonth('next')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 mb-4">
              {georgianDays.map(day => (
                <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {days.map((day, index) => {
                if (!day) {
                  return <div key={index} className="h-32"></div>
                }
                
                const olympiadsForDay = getOlympiadsForDate(day)
                const isToday = day.toDateString() === new Date().toDateString()
                const isSelected = selectedDate?.toDateString() === day.toDateString()
                
                return (
                  <button
                    key={index}
                    onClick={() => handleDateClick(day)}
                    className={`h-20 p-2 text-left border border-gray-200 hover:bg-gray-50 transition-colors ${
                      isToday ? 'bg-blue-50 border-blue-200' : ''
                    } ${isSelected ? 'bg-blue-100 border-blue-300' : ''}`}
                  >
                    <div className={`text-base font-medium ${
                      isToday ? 'text-blue-600' : 'text-gray-900'
                    }`}>
                      {day.getDate()}
                    </div>
                    {olympiadsForDay.length > 0 && (
                      <div className="mt-1">
                        <div className="text-sm text-blue-600 font-medium truncate leading-tight px-1 text-center">
                          {olympiadsForDay[0].subjects[0].length > 8 
                            ? olympiadsForDay[0].subjects[0].substring(0, 8) + '...'
                            : olympiadsForDay[0].subjects[0]
                          }
                        </div>
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Olympiads Cards */}
        {olympiads.length > 0 && (
          <div className="mt-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">ოლიმპიადები</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {olympiads.map(olympiad => (
                  <div key={olympiad.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 w-[300px] mx-auto">
                    {/* Card Header with Image */}
                    <div className="relative">
                      <Image
                        src={getSubjectImage(olympiad.subjects[0])}
                        alt={olympiad.subjects[0]}
                        width={300}
                        height={120}
                        className="w-full h-56 object-cover rounded-t-lg"
                      />
                      <div className="absolute inset-0 bg-black/50 rounded-t-lg"></div>
                      <div className="absolute bottom-2 left-2 right-2">
                        <h3 className="text-lg font-bold text-white text-center mb-1">
                          {olympiad.subjects[0]}
                        </h3>
                        <p className="text-sm text-white text-center opacity-90">
                          {olympiad.title}
                        </p>
                      </div>
                    </div>
                    
                    {/* Card Content */}
                    <div className="p-4">
                      {/* Olympiad Info */}
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              დაწყება: {formatDate(olympiad.startDate)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="border-b border-dotted border-gray-300"></div>
                        
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              დასრულება: {formatDate(olympiad.endDate)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="border-b border-dotted border-gray-300"></div>
                        
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              ხანგრძლივობა: {olympiad.duration} წუთი
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Card Footer */}
                    <div className="px-4 pb-4">
                      <button 
                        onClick={() => {
                          setExpandedOlympiad(expandedOlympiad === olympiad.id ? null : olympiad.id)
                        }}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-700 transition-colors duration-200 text-center text-sm"
                      >
                        {expandedOlympiad === olympiad.id ? 'სასწავლო პროგრამის დამალვა' : 'სასწავლო პროგრამა'}
                      </button>
                      
                      {/* Curriculum Content */}
                      {expandedOlympiad === olympiad.id && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                          <h4 className="font-semibold text-gray-900 mb-2">სასწავლო პროგრამა</h4>
                          <div className="text-sm text-gray-700">
                            {olympiad.curriculum ? (
                              <div>
                                <p className="mb-2">
                                  <strong>სათაური:</strong> {olympiad.curriculum.title}
                                </p>
                                <div className="mt-3">
                                  <strong>შინაარსი:</strong>
                                  <div className="mt-2 p-3 bg-white rounded border text-gray-600">
                                    {olympiad.curriculum.content}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="text-gray-500 italic">
                                სასწავლო პროგრამა ჯერ არ არის დამატებული
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CalendarPage
