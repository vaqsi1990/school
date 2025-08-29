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
    <div className='min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8'>
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
                  className='appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
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
              <div className='mt-1'>
                <input
                  id='password'
                  type='password'
                  autoComplete='current-password'
                  {...register('password')}
                  className='appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                  placeholder='თქვენი პაროლი'
                  />
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
                <div className='w-full border-t border-gray-300' />
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
          </div>
        </div>
      </div>
    </div>
  )
}
