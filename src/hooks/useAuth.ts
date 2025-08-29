'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export function useAuth() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const isAuthenticated = status === 'authenticated'
  const isLoading = status === 'loading'
  const isStudent = session?.user?.userType === 'STUDENT'
  const isTeacher = session?.user?.userType === 'TEACHER'
  const isAdmin = session?.user?.userType === 'ADMIN'

  const login = async (email: string, password: string) => {
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        // Debug log to see what error is returned
        console.log('NextAuth error:', result.error)
        
        // Translate NextAuth errors to Georgian
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
        
        throw new Error(georgianError)
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'შესვლა ვერ მოხერხდა' }
    }
  }

  const logout = async () => {
    await signOut({ redirect: false })
    router.push('/')
  }

  const requireAuth = (userType?: 'STUDENT' | 'TEACHER' | 'ADMIN') => {
    if (!isAuthenticated) {
      router.push('/auth/signin')
      return false
    }

    if (userType && session?.user?.userType !== userType) {
      router.push('/unauthorized')
      return false
    }

    return true
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
  }
}
