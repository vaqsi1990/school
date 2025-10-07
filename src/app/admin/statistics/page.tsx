'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface VisitorStats {
  totalVisitors: number
  uniqueVisitors: number
  visitorsByDay: Array<{
    date: string
    count: number
  }>
  peakDay: {
    date: string
    count: number
  } | null
  visitorsByHour: Array<{
    hour: number
    count: number
  }>
  mostVisitedPages: Array<{
    page: string
    count: number
  }>
}

const AdminStatistics = () => {
  const [stats, setStats] = useState<VisitorStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/statistics')
        if (response.ok) {
          const data = await response.json()
          setStats(data.data)
        } else {
          setError('Failed to fetch statistics')
        }
      } catch (err) {
        setError('Error fetching statistics')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const months = [
      'იანვარი', 'თებერვალი', 'მარტი', 'აპრილი', 'მაისი', 'ივნისი',
      'ივლისი', 'აგვისტო', 'სექტემბერი', 'ოქტომბერი', 'ნოემბერი', 'დეკემბერი'
    ]
    const day = date.getDate()
    const month = months[date.getMonth()]
    const year = date.getFullYear()
    return `${day} ${month}, ${year}`
  }

  const formatHour = (hour: number) => {
    return `${hour}:00`
  }

  const getPageName = (pagePath: string) => {
    const pageNames: { [key: string]: string } = {
      '/admin/statistics': 'ვიზიტორების სტატისტიკა',
      '/admin/dashboard': 'ადმინისტრატორის პანელი',
      '/admin/olympiads': 'ოლიმპიადები',
      '/admin/olympiads/questions': 'ოლიმპიადის კითხვები',
      '/admin/olympiads/create': 'ოლიმპიადის შექმნა',
      '/admin/olympiads/manage': 'ოლიმპიადის მართვა',
      '/admin/teachers': 'მასწავლებლები',
      '/admin/users': 'მომხმარებლები',
      '/admin/appeals': 'საჩივრები',
      '/admin/blog': 'ბლოგი',
      '/admin/curriculum': 'სასწავლო გეგმა',
      '/admin/about': 'ჩვენ შესახებ',
      '/admin/student-answers': 'სტუდენტების პასუხები',
      '/': 'მთავარი გვერდი',
      '/about': 'ჩვენ შესახებ',
      '/blog': 'ბლოგი',
      '/auth/signin': 'შესვლა',
      '/auth/signup': 'რეგისტრაცია',
      '/student/dashboard': 'სტუდენტის პანელი',
      '/student/olympiads': 'სტუდენტის ოლიმპიადები',
      '/student/subjects': 'სტუდენტის საგნები',
      '/student/results': 'სტუდენტის შედეგები',
      '/student/appeals': 'სტუდენტის საჩივრები',
      '/teacher/dashboard': 'მასწავლებლის პანელი',
      '/teacher/questions': 'მასწავლებლის კითხვები',
      '/teacher/olympiads': 'მასწავლებლის ოლიმპიადები',
      '/teacher/blog': 'მასწავლებლის ბლოგი',
      '/teacher/answers': 'მასწავლებლის პასუხები',
      '/test': 'ტესტი',
      '/dashboard': 'პანელი'
    }
    return pageNames[pagePath] || pagePath
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">შეცდომა</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-600 mb-4">მონაცემები არ მოიძებნა</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-8">ვიზიტორების სტატისტიკა</h1>
          
          {/* Main Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div
              className="bg-white rounded-lg shadow-md p-6"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">სულ ვიზიტორები</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalVisitors.toLocaleString()}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="bg-white rounded-lg shadow-md p-6"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">უნიკალური ვიზიტორები</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.uniqueVisitors.toLocaleString()}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="bg-white rounded-lg shadow-md p-6"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">პიკური დღე</p>
                  <p className="text-lg font-bold text-gray-900">
                    {stats.peakDay ? `${stats.peakDay.count} ვიზიტორი` : 'მონაცემები არ არის'}
                  </p>
                  {stats.peakDay && (
                    <p className="text-xs text-gray-500">{formatDate(stats.peakDay.date)}</p>
                  )}
                </div>
              </div>
            </motion.div>

            <motion.div
              className="bg-white rounded-lg shadow-md p-6"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">ბოლო 30 დღე</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.visitorsByDay.length}</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 h-[200px] gap-8 mb-8">
            {/* Visitors by Day Chart */}
            <motion.div
              className="bg-white rounded-lg shadow-md p-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">ვიზიტორები დღეების მიხედვით</h3>
              <div className="space-y-3">
                {stats.visitorsByDay.slice(0, 7).map((day, index) => (
                  <div key={day.date} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{formatDate(day.date)}</span>
                    <div className="flex items-center">
                      <div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${(day.count / Math.max(...stats.visitorsByDay.map(d => d.count))) * 100}%`
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{day.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

        
          </div>

          {/* Today's Activity */}
          <motion.div
            className="bg-white rounded-lg shadow-md p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">დღევანდელი აქტივობა</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Array.from({ length: 24 }, (_, hour) => {
                const hourData = stats.visitorsByHour.find(h => h.hour === hour)
                const count = hourData ? hourData.count : 0
                return (
                  <div key={hour} className="text-center">
                    <div className="text-xs text-gray-600 mb-1">{formatHour(hour)}</div>
                    <div className="bg-gray-200 rounded h-16 flex items-end justify-center p-1">
                      <div
                        className="bg-blue-600 rounded w-full"
                        style={{
                          height: count > 0 ? `${Math.max(4, (count / Math.max(...stats.visitorsByHour.map(h => h.count), 1)) * 100)}%` : '0%'
                        }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-900 mt-1">{count}</div>
                  </div>
                )
              })}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

export default AdminStatistics
