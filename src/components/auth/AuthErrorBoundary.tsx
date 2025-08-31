'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

interface AuthErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export default function AuthErrorBoundary({ children, fallback }: AuthErrorBoundaryProps) {
  const { status } = useSession()
  const [hasError, setHasError] = useState(false)
  const [errorCount, setErrorCount] = useState(0)

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      // Check if it's a NextAuth client fetch error
      if (event.error?.message?.includes('Unexpected token') || 
          event.error?.message?.includes('<!DOCTYPE') ||
          event.error?.message?.includes('client_fetch_error')) {
        
        console.warn('Auth error detected, attempting recovery...', event.error)
        setErrorCount(prev => prev + 1)
        
        if (errorCount >= 3) {
          setHasError(true)
        }
      }
    }

    window.addEventListener('error', handleError)
    return () => window.removeEventListener('error', handleError)
  }, [errorCount])

  useEffect(() => {
    // Reset error state when authentication status changes
    if (status === 'authenticated' || status === 'unauthenticated') {
      setHasError(false)
      setErrorCount(0)
    }
  }, [status])

  if (hasError) {
    return fallback || (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full mx-4">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              ავტორიზაციის შეცდომა
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              მოხდა შეცდომა ავტორიზაციის პროცესში. გთხოვთ განაახლოთ გვერდი.
            </p>
            <button
              onClick={() => {
                setHasError(false)
                setErrorCount(0)
                window.location.reload()
              }}
              className="w-full bg-[#034e64] text-white px-4 py-2 rounded-md hover:bg-[#023a4d] transition-colors"
            >
              გვერდის განახლება
            </button>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
