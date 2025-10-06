'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export function useAuth() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const [retryCount, setRetryCount] = useState(0)
  const [lastError, setLastError] = useState<string | null>(null)

  const isAuthenticated = status === 'authenticated'
  const isLoading = status === 'loading'
  const isStudent = session?.user?.userType === 'STUDENT'
  const isTeacher = session?.user?.userType === 'TEACHER'
  const isAdmin = session?.user?.userType === 'ADMIN'

  // Retry session update on error
  useEffect(() => {
    if (status === 'unauthenticated' && retryCount < 3) {
      const timer = setTimeout(() => {
        setRetryCount(prev => prev + 1)
        update()
      }, 1000 * (retryCount + 1)) // Exponential backoff

      return () => clearTimeout(timer)
    }
  }, [status, retryCount, update])

  // Reset retry count on successful authentication
  useEffect(() => {
    if (status === 'authenticated') {
      setRetryCount(0)
      setLastError(null)
    }
  }, [status])

  const login = async (email: string, password: string) => {
    try {
      setLastError(null)
      
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        let georgianError = 'შესვლა ვერ მოხერხდა'
        
        switch (result.error) {
          case 'CredentialsSignin':
            georgianError = 'ელ-ფოსტა ან პაროლი არასწორია. გთხოვთ შეამოწმოთ და სცადოთ თავიდან'
            break
          case 'AccessDenied':
            georgianError = 'წვდომა უარყოფილია. თქვენ არ გაქვთ ამ გვერდზე წვდომის უფლება'
            break
          case 'Verification':
            georgianError = 'ელ-ფოსტის ვერიფიკაცია საჭიროა. გთხოვთ შეამოწმოთ თქვენი ელ-ფოსტა'
            break
          case 'Configuration':
            georgianError = 'სისტემური შეცდომა. გთხოვთ სცადოთ მოგვიანებით'
            break
          default:
            georgianError = 'ელ-ფოსტა ან პაროლი არასწორია. გთხოვთ შეამოწმოთ და სცადოთ თავიდან'
        }
        
        setLastError(georgianError)
        throw new Error(georgianError)
      }

      // Force session update after successful login
      await update()
      return { success: true }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'შესვლა ვერ მოხერხდა'
      setLastError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  const logout = async () => {
    try {
      await signOut({ redirect: false })
      setRetryCount(0)
      setLastError(null)
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
      // Force redirect even if logout fails
      router.push('/')
    }
  }

  const requireAuth = (userType?: 'STUDENT' | 'TEACHER' | 'ADMIN') => {
    if (!isAuthenticated) {
      router.push('/auth/signin')
      return false
    }

    if (userType && session?.user?.userType !== userType) {
      // Redirect to appropriate dashboard based on user type
      switch (session?.user?.userType) {
        case 'STUDENT':
          router.push('/student/dashboard')
          break
        case 'TEACHER':
          router.push('/teacher/dashboard')
          break
        case 'ADMIN':
          router.push('/admin/dashboard')
          break
        default:
          router.push('/auth/signin')
      }
      return false
    }

    return true
  }

  const refreshSession = async () => {
    try {
      await update()
      setRetryCount(0)
      setLastError(null)
    } catch (error) {
      console.error('Session refresh error:', error)
      setLastError('სესიის განახლება ვერ მოხერხდა')
    }
  }

  return {
    session,
    user: session?.user,
    isAuthenticated,
    isLoading,
    isStudent,
    isTeacher,
    isAdmin,
    login,
    logout,
    requireAuth,
    refreshSession,
    lastError,
    retryCount
  }
}
