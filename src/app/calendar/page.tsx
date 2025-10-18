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

interface GroupedOlympiad {
  subject: string
  olympiads: OlympiadEvent[]
  totalOlympiads: number
  earliestStartDate: number
  latestEndDate: number
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
  const [groupedOlympiads, setGroupedOlympiads] = useState<GroupedOlympiad[]>([])
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
  const [selectedOlympiad, setSelectedOlympiad] = useState<GroupedOlympiad | null>(null)
  const [expandedOlympiad, setExpandedOlympiad] = useState<string | null>(null)
  const [showCurriculumModal, setShowCurriculumModal] = useState(false)
  const [selectedCurriculumGroup, setSelectedCurriculumGroup] = useState<GroupedOlympiad | null>(null)
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null)

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
        const groupedOlympiadData: GroupedOlympiad[] = data.olympiads || []
        
        // If no real olympiads exist, show message
        if (groupedOlympiadData.length === 0) {
          setGroupedOlympiads([])
          setError('ამ საგნებზე ოლიმპიადები ჯერ არ არის შექმნილი')
          return
        }
        
        setGroupedOlympiads(groupedOlympiadData)
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

  // Georgian date formatting function
  const formatGeorgianDate = (date: Date) => {
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
    return groupedOlympiads.filter(groupedOlympiad => {
      return groupedOlympiad.olympiads.some(olympiad => {
        const olympiadDate = new Date(olympiad.startDate)
        return olympiadDate.toDateString() === date.toDateString()
      })
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

    


        {/* Olympiads Cards */}
        {groupedOlympiads.length > 0 && (
          <div className="mt-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">ოლიმპიადები</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {groupedOlympiads.map(groupedOlympiad => (
                  <div key={groupedOlympiad.subject} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 w-[300px] mx-auto">
                    {/* Card Header with Image */}
                    <div className="relative">
                      <Image
                        src={getSubjectImage(groupedOlympiad.subject)}
                        alt={groupedOlympiad.subject}
                        width={300}
                        height={120}
                        className="w-full h-56 object-cover rounded-t-lg"
                      />
                      <div className="absolute inset-0 bg-black/50 rounded-t-lg"></div>
                      <div className="absolute bottom-2 left-2 right-2">
                        <h3 className="text-lg font-bold text-white text-center mb-1">
                          {groupedOlympiad.subject}
                        </h3>
                       
                       
                      </div>
                    </div>
                    
                    {/* Card Content */}
                    <div className="p-4">
                      {/* Olympiad Info */}
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              ოლიმპიადების რაოდენობა: {groupedOlympiad.totalOlympiads}
                            </p>
                          </div>
                        </div>
                        
                        <div className="border-b border-dotted border-gray-300"></div>
                        
                        {/* Show all olympiad dates */}
                        {groupedOlympiad.olympiads.map((olympiad, index) => (
                          <div key={olympiad.id}>
                            <div className="flex items-center space-x-3">
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">
                                  {index + 1}. {olympiad.name}
                                </p>
                                <p className="text-xs text-gray-600">
                                  {formatGeorgianDate(new Date(olympiad.startDate))} - {formatGeorgianDate(new Date(olympiad.endDate))}
                                </p>
                              </div>
                            </div>
                            {index < groupedOlympiad.olympiads.length - 1 && (
                              <div className="border-b border-dotted border-gray-300 mt-2"></div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Card Footer */}
                    <div className="px-4 pb-4">
                      <button 
                        onClick={() => {
                          setSelectedCurriculumGroup(groupedOlympiad)
                          setShowCurriculumModal(true)
                          setSelectedGrade(null)
                        }}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-700 transition-colors duration-200 text-center text-sm"
                      >
                        სასწავლო პროგრამა
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Curriculum Modal */}
        {showCurriculumModal && selectedCurriculumGroup && (
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
                    {selectedCurriculumGroup.subject}
                  </h1>
                  <p className="text-black text-[16px]">
                    აირჩიე კლასი და ნახე სასწავლო პროგრამა
                  </p>
                </div>

                {/* Grade Selection */}
                {!selectedGrade && (
                  <div className="mb-8">
                    <h2 className="text-xl font-bold text-black mb-4 text-center">კლასის არჩევა:</h2>
                    <div className="flex flex-wrap gap-4 justify-center">
                      {Array.from(new Set(selectedCurriculumGroup.olympiads.flatMap(o => o.grades))).map((grade) => (
                        <button
                          key={grade}
                          onClick={() => setSelectedGrade(grade)}
                          className="px-6 py-3 cursor-pointer rounded-lg border-2 font-medium transition-colors duration-200 bg-white text-gray-700 border-gray-300 hover:border-blue-500"
                        >
                          მე-{grade}
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
                        მე-{selectedGrade} კლასის სასწავლო პროგრამები
                      </h2>
                      <button
                        onClick={() => setSelectedGrade(null)}
                        className="bg-blue-600 cursor-pointer text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        სხვა კლასის არჩევა
                      </button>
                    </div>

                    {selectedCurriculumGroup.olympiads
                      .filter(olympiad => olympiad.grades.includes(selectedGrade))
                      .map((olympiad, index) => (
                        <div key={olympiad.id} className="p-6 bg-gray-50 rounded-lg">
                          <h3 className="text-xl font-bold text-black mb-4">
                            {index + 1}. {olympiad.name}
                          </h3>
                          <div className="mb-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                              <p>
                                <strong>თარიღი:</strong> {formatGeorgianDate(new Date(olympiad.startDate))} - {formatGeorgianDate(new Date(olympiad.endDate))}
                              </p>
                             
                            
                              
                             
                            </div>
                          </div>
                          
                          {olympiad.curriculum ? (
                            <div className="bg-white p-4 rounded-lg border">
                              <h4 className="text-lg font-semibold text-gray-900 mb-3">
                                {olympiad.curriculum.title}
                              </h4>
                              <div className="text-gray-700 leading-relaxed">
                                {olympiad.curriculum.content}
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
                      ))}
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
