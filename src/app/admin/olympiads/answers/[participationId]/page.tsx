'use client'

import { useAuth } from '@/hooks/useAuth'
import { AdminOnly } from '@/components/auth/ProtectedRoute'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { useParams } from 'next/navigation'
import ImageModal from '@/components/ImageModal'
import { convertStudentAnswerToDisplayFormat } from '@/utils/matchingUtils'
import { numberToGeorgianLetter, numberToGeorgianQuestionNumber, numberToGeorgianOptionLabel } from '@/utils/georgianLetters'

interface StudentAnswer {
  id: string
  questionId: string
  answer: string
  isCorrect: boolean | null
  points: number | null
  answeredAt: string
  question: {
    id: string
    text: string
    type: 'CLOSED_ENDED' | 'MATCHING' | 'TEXT_ANALYSIS' | 'MAP_ANALYSIS' | 'OPEN_ENDED'
    options: string[]
    correctAnswer?: string
    answerTemplate?: string
    points: number
    maxPoints?: number
    image?: string
    matchingPairs?: Array<{ left: string, right: string }>
    leftSide?: Array<{ left: string }>
    rightSide?: Array<{ right: string }>
    subQuestions?: Array<{
      id: string
      text: string
      correctAnswer?: string
      points: number
    }>
  }
}

interface StudentInfo {
  id: string
  name: string
  lastname: string
  grade: number
  school: string
}

interface OlympiadInfo {
  id: string
  name: string
  subjects: string[]
  grades: number[]
  rounds: number
}

interface ParticipationInfo {
  id: string
  status: 'COMPLETED' | 'IN_PROGRESS' | 'DISQUALIFIED'
  startTime: string
  endTime?: string
  currentRound: number
  totalScore: number | null
}

function StudentAnswerDetailContent() {
  const { user } = useAuth()
  const params = useParams()
  const participationId = params.participationId as string

  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null)
  const [olympiadInfo, setOlympiadInfo] = useState<OlympiadInfo | null>(null)
  const [participationInfo, setParticipationInfo] = useState<ParticipationInfo | null>(null)
  const [answers, setAnswers] = useState<StudentAnswer[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [scores, setScores] = useState<Record<string, number>>({})

  useEffect(() => {
    fetchStudentAnswers()
  }, [participationId])

  const fetchStudentAnswers = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/student-answers/${participationId}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch student answers')
      }

      const data = await response.json()
      console.log('API Response:', data) // Debug log
      setStudentInfo(data.studentInfo)
      setOlympiadInfo(data.olympiadInfo)
      setParticipationInfo(data.participationInfo)
      setAnswers(data.answers)
      console.log('Answers count:', data.answers?.length) // Debug log

      // Initialize scores with current values
      const initialScores: Record<string, number> = {}
      data.answers.forEach((answer: StudentAnswer) => {
        initialScores[answer.id] = answer.points || 0
      })
      setScores(initialScores)

    } catch (error) {
      console.error('Error fetching student answers:', error)
      toast.error('პასუხების ჩატვირთვისას შეცდომა მოხდა')
    } finally {
      setLoading(false)
    }
  }

  const handleScoreChange = (answerId: string, score: number) => {
    setScores(prev => ({
      ...prev,
      [answerId]: score
    }))
  }

  const submitScores = async () => {
    try {
      setSaving(true)
      const response = await fetch(`/api/admin/student-answers/${participationId}/scores`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ scores })
      })

      if (!response.ok) {
        throw new Error('Failed to submit scores')
      }

      toast.success('ქულები წარმატებით შეინახა')
      
      // Refresh data
      await fetchStudentAnswers()

    } catch (error) {
      console.error('Error submitting scores:', error)
      toast.error('ქულების შენახვისას შეცდომა მოხდა')
    } finally {
      setSaving(false)
    }
  }

  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case 'CLOSED_ENDED':
        return 'შეკითხვა-პასუხი'
      case 'MATCHING':
        return 'შესაბამისობა'
      case 'TEXT_ANALYSIS':
        return 'ტექსტის ანალიზი'
      case 'MAP_ANALYSIS':
        return 'რუკის ანალიზი'
      case 'OPEN_ENDED':
        return 'ღია კითხვა'
      default:
        return type
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ka-GE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const totalMaxScore = answers.reduce((sum, answer) => sum + (answer.question.maxPoints || answer.question.points), 0)
  const currentTotalScore = Object.values(scores).reduce((sum, score) => sum + score, 0)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p className="mt-2 text-gray-500">ჩატვირთვა...</p>
        </div>
      </div>
    )
  }

  if (!studentInfo || !olympiadInfo || !participationInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">მონაცემები ვერ მოიძებნა</p>
          <Link href="/admin/olympiads/answers" className="text-indigo-600 hover:text-indigo-900 mt-2 inline-block">
            დაბრუნება
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-black md:text-[25px] text-[20px]">
                ტესტის გასწორება
              </h1>
              <p className="text-black md:text-[18px] text-[16px]">
                {studentInfo.name} {studentInfo.lastname} - {olympiadInfo.name}
              </p>
            </div>
            <Link
              href="/admin/olympiads/answers"
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md md:text-[18px] text-[16px] font-bold"
            >
              დაბრუნება
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Student and Olympiad Info */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">სტუდენტის ინფორმაცია</h3>
              <div className="space-y-2">
                <p><strong>სახელი:</strong> {studentInfo.name} {studentInfo.lastname}</p>
                <p><strong>კლასი:</strong> {studentInfo.grade}</p>
                <p><strong>სკოლა:</strong> {studentInfo.school}</p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">ოლიმპიადის ინფორმაცია</h3>
              <div className="space-y-2">
                <p><strong>სახელი:</strong> {olympiadInfo.name}</p>
                <p><strong>საგნები:</strong> {olympiadInfo.subjects.join(', ')}</p>
                <p><strong>კლასები:</strong> {olympiadInfo.grades.join(', ')}</p>
                <p><strong>რაუნდები:</strong> {olympiadInfo.rounds}</p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">შედეგები</h3>
              <div className="space-y-2">
                <p><strong>სტატუსი:</strong> 
                  <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${
                    participationInfo.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                    participationInfo.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {participationInfo.status === 'COMPLETED' ? 'დასრულებული' :
                     participationInfo.status === 'IN_PROGRESS' ? 'მიმდინარე' :
                     'დისკვალიფიცირებული'}
                  </span>
                </p>
                <p><strong>დაწყების თარიღი:</strong> {formatDate(participationInfo.startTime)}</p>
                {participationInfo.endTime && (
                  <p><strong>დასრულების თარიღი:</strong> {formatDate(participationInfo.endTime)}</p>
                )}
                <p><strong>მიმდინარე რაუნდი:</strong> {participationInfo.currentRound}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Score Summary */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium text-gray-900">ქულების შეჯამება</h3>
              <p className="text-gray-500">მიმდინარე ქულა: {currentTotalScore} / {totalMaxScore}</p>
            </div>
            <button
              onClick={submitScores}
              disabled={saving}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-md font-medium"
            >
              {saving ? 'შენახვა...' : 'ქულების შენახვა'}
            </button>
          </div>
        </div>

        {/* Answers */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">კითხვები და პასუხები</h3>
          </div>
          
          <div className="divide-y divide-gray-200">
            {answers.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-gray-500">კითხვები ვერ მოიძებნა</p>
                <p className="text-sm text-gray-400 mt-2">შესაძლოა სტუდენტმა ჯერ არ გააკეთა ტესტი</p>
              </div>
            ) : (
              answers.map((answer, index) => (
              <div key={answer.id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h4 className="text-lg font-medium text-gray-900 mb-2">
                      კითხვა {numberToGeorgianLetter(index)}: {getQuestionTypeLabel(answer.question.type)}
                    </h4>
                    <p className="text-gray-700 mb-4">{answer.question.text}</p>
                    
                    {answer.question.image && (
                      <div className="mb-4">
                        <ImageModal 
                          src={answer.question.image} 
                          alt="Question image" 
                          className="max-w-full h-auto rounded-lg"
                        />
                      </div>
                    )}

                    {answer.question.type === 'CLOSED_ENDED' && answer.question.options && (
                      <div className="mb-4">
                        <h5 className="font-medium text-gray-900 mb-2">პასუხის ვარიანტები:</h5>
                        <ul className="list-disc list-inside space-y-1">
                          {answer.question.options.map((option, optIndex) => (
                            <li key={optIndex} className="text-gray-700">
                              {numberToGeorgianOptionLabel(optIndex)} {option}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {answer.question.type === 'MATCHING' && (answer.question.matchingPairs || answer.question.leftSide) && (
                      <div className="mb-4">
                        <h5 className="font-medium text-gray-900 mb-2">შესაბამისობის წყვილები:</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {(answer.question.leftSide || answer.question.matchingPairs)?.map((item, pairIndex) => (
                            <div key={pairIndex} className="flex items-center space-x-2">
                              <span className="text-gray-700">
                                {answer.question.leftSide ? item.left : item.left}
                              </span>
                              <span className="text-gray-400">→</span>
                              <span className="text-gray-700">
                                {answer.question.rightSide ? answer.question.rightSide[pairIndex]?.right : 
                                 answer.question.matchingPairs ? answer.question.matchingPairs[pairIndex]?.right : ''}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="ml-6 flex-shrink-0">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ქულა (მაქს: {answer.question.maxPoints || answer.question.points})
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={answer.question.maxPoints || answer.question.points}
                      value={scores[answer.id] || 0}
                      onChange={(e) => handleScoreChange(answer.id, parseInt(e.target.value) || 0)}
                      className="w-20 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h5 className="font-medium text-gray-900 mb-2">სტუდენტის პასუხი:</h5>
                  <p className="text-gray-700 mb-2">
                    {answer.question.type === 'MATCHING' 
                      ? convertStudentAnswerToDisplayFormat(answer.answer, answer.question.matchingPairs, answer.question.leftSide, answer.question.rightSide)
                      : answer.answer
                    }
                  </p>
                  <p className="text-sm text-gray-500">
                    პასუხის თარიღი: {formatDate(answer.answeredAt)}
                  </p>
                  
                  {answer.question.correctAnswer && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <h6 className="font-medium text-gray-900 mb-1">სწორი პასუხი:</h6>
                      <p className="text-gray-700">{answer.question.correctAnswer}</p>
                    </div>
                  )}
                  
                  {answer.question.type === 'OPEN_ENDED' && answer.question.answerTemplate && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <h6 className="font-medium text-purple-900 mb-1">პასუხის შაბლონი:</h6>
                      <p className="text-purple-700 text-sm bg-purple-50 p-2 rounded">{answer.question.answerTemplate}</p>
                    </div>
                  )}
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

export default function StudentAnswerDetailPage() {
  return (
    <AdminOnly>
      <StudentAnswerDetailContent />
    </AdminOnly>
  )
}
