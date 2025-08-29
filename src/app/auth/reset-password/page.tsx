'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) {
      setMessage('გთხოვთ შეიყვანოთ ელ-ფოსტა')
      return
    }

    setIsLoading(true)
    setMessage('')

    try {
      console.log('Sending password reset request for email:', email)
      
      const response = await fetch('/api/auth/request-password-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      console.log('Response status:', response.status)
      const result = await response.json()
      console.log('Response result:', result)

      if (response.ok) {
        setIsSuccess(true)
        setMessage('პაროლის აღდგენის ლინკი გაიგზავნა თქვენს ელ-ფოსტაზე')
      } else {
        setMessage(result.error || 'შეცდომა მოხდა')
      }
    } catch (error) {
      console.error('Password reset error:', error)
      setMessage('სისტემური შეცდომა მოხდა')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          პაროლის აღდგენა
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          შეიყვანეთ თქვენი ელ-ფოსტა და ჩვენ გამოგიგზავნით პაროლის აღდგენის ლინკს
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {!isSuccess ? (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  ელ-ფოსტა
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="შეიყვანეთ ელ-ფოსტა"
                  />
                </div>
              </div>

              {message && (
                <div className={`p-3 rounded-md text-sm ${
                  isSuccess ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {message}
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'მიმდინარეობს...' : 'გაგზავნა'}
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">წარმატებით გაიგზავნა!</h3>
              <p className="mt-2 text-sm text-gray-600">
                პაროლის აღდგენის ლინკი გაიგზავნა {email} ელ-ფოსტაზე
              </p>
              <p className="mt-2 text-sm text-gray-500">
                გთხოვთ შეამოწმოთ თქვენი ელ-ფოსტა და დააჭიროთ ლინკს
              </p>
            </div>
          )}

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">ან</span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link
                href="/auth/signin"
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200"
              >
                დაბრუნება შესვლის გვერდზე
              </Link>
            </div>
            
            {/* Debug info - remove in production */}
            <div className="mt-4 text-center text-xs text-gray-400">
              <p>Debug: Password reset page loaded successfully</p>
              <p>API endpoint: /api/auth/request-password-reset</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
