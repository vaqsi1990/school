'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginFormData } from '@/lib/validations/auth'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    setError('')

    try {
      const result = await login(data.email, data.password)
      
      if (result.success) {
        // Redirect to dashboard after successful login
        router.push('/dashboard')
      } else {
        setError(result.error || 'შესვლა ვერ მოხერხდა')
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('დაფიქსირდა შეცდომა')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='min-h-screen bg-white flex flex-col justify-center py-12 sm:px-6 lg:px-8'>
      <div className='sm:mx-auto sm:w-full sm:max-w-md'>
        <div className='text-center'>
          <h2 className='mt-6  font-extrabold text-black md:text-[30px] text-[20px]'>
            შესვლა
          </h2>
          <p className='mt-2 text-black md:text-[18px] text-[16px]'>
            შესვლა თქვენს ანგარიშზე
          </p>
        </div>
      </div>

      <div className='mt-8 sm:mx-auto sm:w-full sm:max-w-md'>
        <div className='bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10'>
          <form className='space-y-6' onSubmit={handleSubmit(onSubmit)}>
            {error && (
              <div className='bg-red-50 border border-red-200 rounded-md p-4'>
                <div className='flex'>
                  <div className='flex-shrink-0'>
                    <svg className='h-5 w-5 text-red-400' viewBox='0 0 20 20' fill='currentColor'>
                      <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z' clipRule='evenodd' />
                    </svg>
                  </div>
                  <div className='ml-3'>
                    <p className='text-sm text-red-800'>{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label htmlFor='email' className='block text-black md:text-[18px] text-[16px]'>
               ელ-ფოსტა
              </label>
              <div className='mt-1'>
                <input
                  id='email'
                  type='email'
                  autoComplete='email'
                  {...register('email')}
                  className='appearance-none block w-full px-3 py-2 border border-black rounded-md placeholder-black focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                  placeholder='თქვენი ელ-ფოსტა'
                />
              </div>
              {errors.email && (
                <p className='mt-2 text-sm text-red-600'>{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor='password' className='block text-black md:text-[18px] text-[16px]'>
               პაროლი
              </label>
              <div className='mt-1 relative'>
                <input
                  id='password'
                  type={showPassword ? 'text' : 'password'}
                  autoComplete='current-password'
                  {...register('password')}
                  className='appearance-none block w-full px-3 py-2 pr-10 border border-black rounded-md placeholder-black focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                  placeholder='თქვენი პაროლი'
                  />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-black  transition-colors duration-200"
                >
                  {showPassword ? (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p className='mt-2 text-sm text-red-600'>{errors.password.message}</p>
              )}
            </div>

            <div>
              <button
                type='submit'
                disabled={isLoading}
                className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm md:text-[20px] text-[18px] font-bold text-white bg-[#a2997a] cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {isLoading ? 'შესვლა...' : 'შესვლა'}
              </button>
            </div>
          </form>

          <div className='mt-6'>
            <div className='relative'>
              <div className='absolute inset-0 flex items-center'>
                <div className='w-full border-t border-black' />
              </div>
              <div className='relative flex justify-center text-sm'>
               
              </div>
            </div>

            <div className='mt-6 text-center'>
              <p className='text-sm text-black md:text-[18px] text-[16px]'>
                არ გაქვთ ანგარიში?{' '}
                <Link
                  href='/auth/signup'
                  className='font-medium text-black hover:underline transition-all duration-300 md:text-[20px] text-[18px]'
                >
                  რეგისტრაცია
                </Link>
              </p>
            </div>
            <div className='mt-6 text-center'>
              <h1> დაგავიწყდა პაროლი?  
                <Link href='/auth/reset-password' className='font-medium text-black hover:underline transition-all duration-300 md:text-[20px] text-[18px]'>
                  აღადგინეთ
                </Link>
              </h1>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
