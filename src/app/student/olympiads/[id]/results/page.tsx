'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, use } from 'react'
import Link from 'next/link'

interface QuestionResult {
  id: string
  text: string
  type: string
  options?: string[]
  correctAnswer?: string
  studentAnswer?: string
  isCorrect: boolean
  points: number
  image?: string[]
  imageOptions?: string[]
}

interface OlympiadResult {
  id: string
  title: string
  description: string
  startDate: string
  endDate: string
  totalQuestions: number
  score: number
  maxScore: number
  percentage: number
  status: string
  questions?: QuestionResult[]
}

export default function ResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [olympiad, setOlympiad] = useState<OlympiadResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const score = searchParams.get('score')
  const isManualGrading = searchParams.get('manual') === 'true'
  const isAutoGrading = searchParams.get('auto') === 'true'
  const resolvedParams = use(params)

  useEffect(() => {
    fetchOlympiadResults()
  }, [resolvedParams.id])

  const fetchOlympiadResults = async () => {
    try {
      const response = await fetch(`/api/student/olympiads/${resolvedParams.id}/results`)
      if (!response.ok) {
        throw new Error('Failed to fetch results')
      }
      const data = await response.json()
      setOlympiad(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600'
    if (percentage >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreMessage = (percentage: number) => {
    if (percentage >= 90) return 'შესანიშნავი შედეგი! 🎉'
    if (percentage >= 80) return 'კარგი შედეგი! 👍'
    if (percentage >= 60) return 'საშუალო შედეგი 📚'
    return 'სცადეთ კიდევ ერთხელ 💪'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#034e64] mx-auto mb-4"></div>
          <p className="text-gray-600">შედეგების ჩატვირთვა...</p>
        </div>
      </div>
    )
  }

  if (error || !olympiad) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">შეცდომა</h1>
          <p className="text-gray-600 mb-6">{error || 'ოლიმპიადის შედეგები ვერ ჩაიტვირთა'}</p>
          <Link
            href="/student/olympiads"
            className="bg-[#034e64] text-white px-6 py-3 rounded-lg hover:bg-[#023a4a] transition-colors"
          >
            ოლიმპიადების სიაში დაბრუნება
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-green-500 text-6xl mb-4">🎉</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">ოლიმპიადა დასრულდა!</h1>
          <p className="text-gray-600">თქვენი შედეგები ქვემოთაა</p>
        </div>

        {/* Olympiad Info */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">{olympiad.title}</h2>
          <p className="text-gray-600 mb-4">{olympiad.description}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">დაწყების თარიღი:</span>
              <span className="ml-2 text-gray-600">{formatDate(olympiad.startDate)}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">დასრულების თარიღი:</span>
              <span className="ml-2 text-gray-600">{formatDate(olympiad.endDate)}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">კითხვების რაოდენობა:</span>
              <span className="ml-2 text-gray-600">{olympiad.totalQuestions}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">სტატუსი:</span>
              <span className="ml-2 text-gray-600">{olympiad.status}</span>
            </div>
          </div>
        </div>

        {/* Score Card */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {isManualGrading ? 'ოლიმპიადა დასრულდა' : 'თქვენი შედეგი'}
            </h3>
            
            {isManualGrading ? (
              <div className="mb-6">
                <div className="text-6xl mb-4">⏳</div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <div className="text-lg font-medium text-yellow-800 mb-2">
                    ⏳ შედეგების მოლოდინში
                  </div>
                  <div className="text-yellow-700">
                    თქვენი პასუხები წარმატებით გაიგზავნა. ზოგიერთი კითხვა მასწავლებელს მიაცემა შესაფასებლად. 
                    შედეგები გამოქვეყნდება როგორც კი მასწავლებელი დაასრულებს შეფასებას.
                  </div>
                </div>
                <div className="text-lg text-gray-600">
                  დახურული კითხვების ქულა: {olympiad.score} / {olympiad.maxScore}
                </div>
              </div>
            ) : (
              <>
                {/* Score Circle */}
                <div className="relative w-32 h-32 mx-auto mb-6">
                  <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      stroke="#e5e7eb"
                      strokeWidth="8"
                      fill="none"
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      stroke="#10b981"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 50}`}
                      strokeDashoffset={`${2 * Math.PI * 50 * (1 - olympiad.percentage / 100)}`}
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className={`text-3xl font-bold ${getScoreColor(olympiad.percentage)}`}>
                        {olympiad.percentage}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* Score Details */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#034e64]">{olympiad.score}</div>
                    <div className="text-sm text-gray-600">მიღებული ქულა</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-600">{olympiad.maxScore}</div>
                    <div className="text-sm text-gray-600">მაქსიმალური ქულა</div>
                  </div>
                </div>

                {/* Score Message */}
                <div className={`text-lg font-medium ${getScoreColor(olympiad.percentage)} mb-6`}>
                  {getScoreMessage(olympiad.percentage)}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Questions Review - Only show for auto-graded results */}
        {!isManualGrading && olympiad.questions && olympiad.questions.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">კითხვების გადახედვა</h3>
            <div className="space-y-4">
              {olympiad.questions.map((question, index) => (
                <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-lg font-medium text-gray-900">
                      კითხვა {index + 1}: {question.text}
                    </h4>
                    <div className="flex items-center space-x-2">
                      {question.isCorrect ? (
                        <span className="text-green-600 text-sm font-medium">✓ სწორი</span>
                      ) : (
                        <span className="text-red-600 text-sm font-medium">✗ არასწორი</span>
                      )}
                      <span className="text-sm text-gray-500">{question.points} ქულა</span>
                    </div>
                  </div>
                  
                  {question.type === 'CLOSED_ENDED' && question.options && (
                    <div className="mb-3">
                      <div className="text-sm font-medium text-gray-700 mb-2">პასუხის ვარიანტები:</div>
                      <div className="space-y-1">
                        {question.options.map((option, optIndex) => (
                          <div key={optIndex} className={`p-2 rounded ${
                            option === question.correctAnswer 
                              ? 'bg-green-100 text-green-800 border border-green-300' 
                              : option === question.studentAnswer && option !== question.correctAnswer
                                ? 'bg-red-100 text-red-800 border border-red-300'
                                : 'bg-gray-50 text-gray-700'
                          }`}>
                            {String.fromCharCode(65 + optIndex)}) {option}
                            {option === question.correctAnswer && ' ✓ სწორი პასუხი'}
                            {option === question.studentAnswer && option !== question.correctAnswer && ' ✗ თქვენი პასუხი'}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {question.type === 'MATCHING' && (
                    <div className="mb-3">
                      <div className="text-sm font-medium text-gray-700 mb-2">შესაბამისობა:</div>
                      <div className="text-sm text-gray-600">
                        სწორი პასუხი: {question.correctAnswer}
                      </div>
                      <div className="text-sm text-gray-600">
                        თქვენი პასუხი: {question.studentAnswer}
                      </div>
                    </div>
                  )}
                  
                  {question.type === 'OPEN_ENDED' && (
                    <div className="mb-3">
                      <div className="text-sm font-medium text-gray-700 mb-2">ღია კითხვა:</div>
                      <div className="text-sm text-gray-600">
                        თქვენი პასუხი: {question.studentAnswer || 'პასუხი არ მოცემულა'}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/student/olympiads"
            className="bg-[#034e64] text-white px-6 py-3 rounded-lg hover:bg-[#023a4a] transition-colors text-center"
          >
            სხვა ოლიმპიადები
          </Link>
          <Link
            href="/student/dashboard"
            className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors text-center"
          >
            დაშბორდი
          </Link>
        </div>
      </div>
    </div>
  )
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  const months = [
    'იანვარი', 'თებერვალი', 'მარტი', 'აპრილი', 'მაისი', 'ივნისი',
    'ივლისი', 'აგვისტო', 'სექტემბერი', 'ოქტომბერი', 'ნოემბერი', 'დეკემბერი'
  ]
  const day = date.getDate()
  const month = months[date.getMonth()]
  const year = date.getFullYear()
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${day} ${month} ${year} ${hours}:${minutes}`
}
