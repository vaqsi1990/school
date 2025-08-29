'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registrationSchema, type RegistrationFormData } from '@/lib/validations/auth'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function SignUpPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
  })

  const userType = watch('userType')

  const onSubmit = async (data: RegistrationFormData) => {
    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (response.ok) {
        setSuccess('Registration completed successfully! Redirecting to login...')
        // Redirect to login page after 2 seconds
        setTimeout(() => {
          router.push('/auth/signin')
        }, 2000)
      } else {
        setError(result.error || 'Registration failed')
      }
    } catch (err) {
      setError('An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="mt-6  font-extrabold text-black md:text-[30px] text-[20px]">
            რეგისტრაცია
          </h2>
          <p className="mt-2 text-black md:text-[18px] text-[16px]">
            ახალი ანგარიშის შექმნა
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-800">{success}</p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="userType" className="block text-black md:text-[18px] text-[16px]">
              მომხმარებლის ტიპი *
              </label>
              <div className="mt-1">
                <select
                  id="userType"
                  {...register('userType')}
                  className="block w-full px-3 py-2 border border-black md:text-[18px] text-[16px] rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">აირჩიეთ </option>
                  <option value="STUDENT">სტუდენტი</option>
                  <option value="TEACHER">მასწავლებელი</option>
                  <option value="ADMIN">ადმინისტრატორი</option>
                </select>
              </div>
              {errors.userType && (
                <p className="mt-2 text-sm text-red-600">{errors.userType.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-black md:text-[18px] text-[16px]">
               ელ-ფოსტა *
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  {...register('email')}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="თქვენი ელ-ფოსტა"
                />
              </div>
              {errors.email && (
                <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-black md:text-[18px] text-[16px]">
                პაროლი *
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  {...register('password')}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="მინიმუმ 6 სიმბოლო"
                />
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-black md:text-[18px] text-[16px]">
                დაადასტურეთ პაროლი *
              </label>
              <div className="mt-1">
                <input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  {...register('confirmPassword')}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="დაადასტურეთ პაროლი"
                />
              </div>
              {errors.confirmPassword && (
                <p className="mt-2 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>

            {userType === 'STUDENT' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="studentName" className="block text-black md:text-[18px] text-[16px]">
                      სახელი *
                    </label>
                    <div className="mt-1">
                      <input
                        id="studentName"
                        type="text"
                        autoComplete="given-name"
                        {...register('studentName')}
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="სახელი"
                      />
                    </div>
                    {errors.studentName && (
                      <p className="mt-2 text-sm text-red-600">{errors.studentName.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="studentLastname" className="block text-black md:text-[18px] text-[16px]">
                      გვარი *
                    </label>
                    <div className="mt-1">
                      <input
                        id="studentLastname"
                        type="text"
                        autoComplete="family-name"
                        {...register('studentLastname')}
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="გვარი"
                      />
                    </div>
                    {errors.studentLastname && (
                      <p className="mt-2 text-sm text-red-600">{errors.studentLastname.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="grade" className="block text-black md:text-[18px] text-[16px]">
                      სტუდენტის სკოლა *
                    </label>
                    <div className="mt-1">
                      <select
                        id="grade"
                        {...register('grade', { valueAsNumber: true })}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      >
                        <option value="">აირჩიეთ სკოლა</option>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((grade) => (
                          <option key={grade} value={grade}>
                            {grade} კლასი
                          </option>
                        ))}
                      </select>
                    </div>
                    {errors.grade && (
                      <p className="mt-2 text-sm text-red-600">{errors.grade.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="studentPhone" className="block text-black md:text-[18px] text-[16px]">
                      ტელეფონის ნომერი *
                    </label>
                    <div className="mt-1">
                      <input
                        id="studentPhone"
                        type="tel"
                        autoComplete="tel"
                        {...register('studentPhone')}
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="+995 555 55 55 55"
                      />
                    </div>
                    {errors.studentPhone && (
                      <p className="mt-2 text-sm text-red-600">{errors.studentPhone.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="school" className="block text-black md:text-[18px] text-[16px]">
                    სკოლა *
                  </label>
                  <div className="mt-1">
                    <input
                      id="school"
                      type="text"
                      autoComplete="organization"
                      {...register('school')}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="სკოლა"
                    />
                  </div>
                  {errors.school && (
                    <p className="mt-2 text-sm text-red-600">{errors.school.message}</p>
                  )}
                </div>
              </>
            )}

            {userType === 'TEACHER' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="teacherName" className="block text-black md:text-[18px] text-[16px]">
                      სახელი *
                    </label>
                    <div className="mt-1">
                      <input
                        id="teacherName"
                        type="text"
                        autoComplete="given-name"
                        {...register('teacherName')}
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="სახელი"
                      />
                    </div>
                    {errors.teacherName && (
                      <p className="mt-2 text-sm text-red-600">{errors.teacherName.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="teacherLastname" className="block text-black md:text-[18px] text-[16px]">
                      გვარი *
                    </label>
                    <div className="mt-1">
                      <input
                        id="teacherLastname"
                        type="text"
                        autoComplete="family-name"
                        {...register('teacherLastname')}
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="გვარი"
                      />
                    </div>
                    {errors.teacherLastname && (
                      <p className="mt-2 text-sm text-red-600">{errors.teacherLastname.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="subject" className="block text-black md:text-[18px] text-[16px]">
                      საგანი *
                    </label>
                    <div className="mt-1">
                      <input
                        id="subject"
                        type="text"
                        {...register('subject')}
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="საგანი"
                      />
                    </div>
                    {errors.subject && (
                      <p className="mt-2 text-sm text-red-600">{errors.subject.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="teacherPhone" className="block text-black md:text-[18px] text-[16px]">
                      ტელეფონის ნომერი *
                    </label>
                    <div className="mt-1">
                      <input
                        id="teacherPhone"
                        type="tel"
                        autoComplete="tel"
                        {...register('teacherPhone')}
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="+995 555 55 55 55"
                      />
                    </div>
                    {errors.teacherPhone && (
                      <p className="mt-2 text-sm text-red-600">{errors.teacherPhone.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="teacherSchool" className="block text-black md:text-[18px] text-[16px]">
                    სკოლა *
                  </label>
                  <div className="mt-1">
                    <input
                      id="teacherSchool"
                      type="text"
                      autoComplete="organization"
                      {...register('teacherSchool')}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="სკოლა"
                    />
                  </div>
                  {errors.teacherSchool && (
                    <p className="mt-2 text-sm text-red-600">{errors.teacherSchool.message}</p>
                  )}
                </div>
              </>
            )}

            {userType === 'ADMIN' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="adminName" className="block text-black md:text-[18px] text-[16px]">
                        სახელი *
                    </label>
                    <div className="mt-1">
                      <input
                        id="adminName"
                        type="text"
                        autoComplete="given-name"
                        {...register('adminName')}
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="სახელი"
                      />
                    </div>
                    {errors.adminName && (
                      <p className="mt-2 text-sm text-red-600">{errors.adminName.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="adminLastname" className="block text-black md:text-[18px] text-[16px]">
                      გვარი *
                    </label>
                    <div className="mt-1">
                      <input
                        id="adminLastname"
                        type="text"
                        autoComplete="family-name"
                        {...register('adminLastname')}
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="გვარი"
                      />
                    </div>
                    {errors.adminLastname && (
                      <p className="mt-2 text-sm text-red-600">{errors.adminLastname.message}</p>
                    )}
                  </div>
                </div>


              </>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-black rounded-md shadow-sm md:text-[20px] text-[18px] font-bold text-white bg-[#a2997a] cursor-pointer  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'რეგისტრაცია...' : 'რეგისტრაცია'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
               
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-black md:text-[18px] text-[16px]">
                უკვე გაქვთ ანგარიში?{' '}
                <Link
                  href="/auth/signin"
                  className="font-medium text-black hover:underline transition-all duration-300 md:text-[20px] text-[18px]"
                >
                  შესვლა
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
