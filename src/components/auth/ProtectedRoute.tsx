'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { ReactNode } from 'react'

interface ProtectedRouteProps {
  children: ReactNode
  allowedUserTypes?: ('STUDENT' | 'TEACHER' | 'ADMIN')[]
  redirectTo?: string
  showLoading?: boolean
}

export default function ProtectedRoute({ 
  children, 
  allowedUserTypes, 
  redirectTo = '/unauthorized',
  showLoading = true 
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/signin')
      return
    }

    if (!isLoading && isAuthenticated && allowedUserTypes && user) {
      const hasPermission = allowedUserTypes.includes(user.userType)
      if (!hasPermission) {
        router.push(redirectTo)
        return
      }
    }
  }, [isLoading, isAuthenticated, user, allowedUserTypes, redirectTo, router])

  // Show loading state
  if (isLoading && showLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Show unauthorized message if user doesn't have permission
  if (isAuthenticated && allowedUserTypes && user && !allowedUserTypes.includes(user.userType)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to view this page.</p>
        </div>
      </div>
    )
  }

  // Render children if user is authenticated and has permission
  if (isAuthenticated) {
    return <>{children}</>
  }

  // Return null while redirecting
  return null
}

// Convenience components for specific user types
export function StudentOnly({ children, ...props }: Omit<ProtectedRouteProps, 'allowedUserTypes'>) {
  return (
    <ProtectedRoute allowedUserTypes={['STUDENT']} {...props}>
      {children}
    </ProtectedRoute>
  )
}

export function TeacherOnly({ children, ...props }: Omit<ProtectedRouteProps, 'allowedUserTypes'>) {
  return (
    <ProtectedRoute allowedUserTypes={['TEACHER']} {...props}>
      {children}
    </ProtectedRoute>
  )
}

export function AdminOnly({ children, ...props }: Omit<ProtectedRouteProps, 'allowedUserTypes'>) {
  return (
    <ProtectedRoute allowedUserTypes={['ADMIN']} {...props}>
      {children}
    </ProtectedRoute>
  )
}

export function SuperAdminOnly({ children, ...props }: Omit<ProtectedRouteProps, 'allowedUserTypes'>) {
  return (
    <ProtectedRoute allowedUserTypes={['ADMIN']} {...props}>
      {children}
    </ProtectedRoute>
  )
}
