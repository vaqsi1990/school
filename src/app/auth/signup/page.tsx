'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registrationSchema, type RegistrationFormData } from '@/lib/validations/auth'
import { type VerificationStep } from '@/types/verification'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function SignUpPage() {
  const [currentStep, setCurrentStep] = useState<VerificationStep>('email')
  const [email, setEmail] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
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

  // Step 1: Send verification email
  const handleSendVerification = async (email: string) => {
    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const result = await response.json()

      if (response.ok) {
        setEmail(email)
        setSuccess('ვერიფიკაციის კოდი გაიგზავნა თქვენს ელ-ფოსტაზე!')
        setCurrentStep('code')
      } else {
        setError(result.error || 'ვერიფიკაციის კოდის გაგზავნა ვერ მოხერხდა')
      }
    } catch (err) {
      setError('დაფიქსირდა შეცდომა')
    } finally {
      setIsLoading(false)
    }
  }

  // Step 2: Verify code
  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('გთხოვთ შეიყვანოთ სწორი 6-ციფრიანი კოდი')
      return
    }

    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code: verificationCode }),
      })

      const result = await response.json()

      if (response.ok) {
        setSuccess('ელ-ფოსტა წარმატებით გადამოწმდა! გთხოვთ დაასრულოთ რეგისტრაცია.')
        setCurrentStep('registration')
      } else {
        setError(result.error || 'არასწორი ვერიფიკაციის კოდი')
      }
    } catch (err) {
      setError('დაფიქსირდა შეცდომა')
    } finally {
      setIsLoading(false)
    }
  }

  // Step 3: Complete registration
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
        setSuccess('რეგისტრაცია წარმატებით დასრულდა! გადამისამართება შესვლის გვერდზე...')
        // Redirect to login page after 2 seconds
        setTimeout(() => {
          router.push('/auth/signin')
        }, 2000)
      } else {
        setError(result.error || 'რეგისტრაცია ვერ მოხერხდა')
      }
    } catch (err) {
      setError('დაფიქსირდა შეცდომა')
    } finally {
      setIsLoading(false)
    }
  }

  const renderEmailStep = () => (
    <div className="space-y-6">
      <div>
        <label htmlFor="email" className="block text-black md:text-[18px] text-[16px]">
          ელ-ფოსტა *
        </label>
        <div className="mt-1">
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="appearance-none block w-full px-3 py-2 border border-black rounded-md placeholder-black focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="თქვენი ელ-ფოსტა"
          />
        </div>
      </div>

      <div>
        <button
          type="button"
          onClick={() => handleSendVerification(email)}
          disabled={isLoading || !email}
          className="w-full flex justify-center py-2 px-4 border border-black rounded-md shadow-sm md:text-[20px] text-[18px] font-bold text-white bg-[#a2997a] cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'გაგზავნა...' : 'გაგზავნა'}
        </button>
      </div>
    </div>
  )

  const renderCodeStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-sm text-black mb-4">
          6-ციფრიანი ვერიფიკაციის კოდი გაიგზავნა <strong>{email}</strong>
        </p>
      </div>

      <div>
        <label htmlFor="verificationCode" className="block text-black md:text-[18px] text-[16px]">
          ვერიფიკაციის კოდი *
        </label>
        <div className="mt-1">
          <input
            id="verificationCode"
            type="text"
            maxLength={6}
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
            className="appearance-none block w-full px-3 py-2 border border-black rounded-md placeholder-black focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-center text-2xl tracking-widest"
            placeholder="000000"
          />
        </div>
      </div>

      <div className="flex space-x-3">
        <button
          type="button"
          onClick={() => setCurrentStep('email')}
          className="flex-1 py-2 px-4 border border-black rounded-md shadow-sm text-sm font-medium text-black bg-white  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          უკან
        </button>
        <button
          type="button"
          onClick={handleVerifyCode}
          disabled={isLoading || verificationCode.length !== 6}
          className="flex-1 py-2 px-4 border border-black rounded-md shadow-sm md:text-[18px] text-[16px] font-bold text-white bg-[#a2997a] cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'ვერიფიკაცია...' : 'ვერიფიკაცია'}
        </button>
      </div>

      <div className="text-center">
        <button
          type="button"
          onClick={() => handleSendVerification(email)}
          className="text-sm text-blue-600 hover:text-blue-500"
        >
          კოდი არ მივიღე, ხელახლა გაგზავნა
        </button>
      </div>
    </div>
  )

  const renderRegistrationStep = () => (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
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
            <option value="STUDENT">მოსწავლე</option>
           
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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="appearance-none block w-full px-3 py-2 border border-black rounded-md placeholder-black focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="თქვენი ელ-ფოსტა"
            readOnly
          />
        </div>
                  <p className="mt-1 text-sm text-green-600">✓ ელ-ფოსტა გადამოწმებულია</p>
      </div>

      <div>
        <label htmlFor="password" className="block text-black md:text-[18px] text-[16px]">
          პაროლი *
        </label>
        <div className="mt-1 relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            {...register('password')}
            className="appearance-none block w-full px-3 py-2 pr-10 border border-black rounded-md placeholder-black focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="მინიმუმ 6 სიმბოლო"
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
          <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-black md:text-[18px] text-[16px]">
          დაადასტურეთ პაროლი *
        </label>
        <div className="mt-1 relative">
          <input
            id="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            autoComplete="new-password"
            {...register('confirmPassword')}
            className="appearance-none block w-full px-3 py-2 pr-10 border border-black rounded-md placeholder-black focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="დაადასტურეთ პაროლი"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-black  transition-colors duration-200"
          >
            {showConfirmPassword ? (
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
                  className="appearance-none block w-full px-3 py-2 border border-black rounded-md placeholder-black focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
                  className="appearance-none block w-full px-3 py-2 border border-black rounded-md placeholder-black focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
                კლასი *
              </label>
              <div className="mt-1">
                <select
                  id="grade"
                  {...register('grade', { valueAsNumber: true })}
                  className="block w-full px-3 py-2 border border-black rounded-md shadow-sm focus:outline-none text-black focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">აირჩიეთ კლასი</option>
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
                ტელ ნომერი *
              </label>
              <div className="mt-1">
                <input
                  id="studentPhone"
                  type="tel"
                  autoComplete="tel"
                  {...register('studentPhone')}
                  className="appearance-none block w-full px-3 py-2 border border-black rounded-md placeholder-black focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
                className="appearance-none block w-full px-3 py-2 border border-black rounded-md placeholder-black focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
                  className="appearance-none block w-full px-3 py-2 border border-black rounded-md placeholder-black focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
                  className="appearance-none block w-full px-3 py-2 border border-black rounded-md placeholder-black focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
                  className="appearance-none block w-full px-3 py-2 border border-black rounded-md placeholder-black focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="საგანი"
                />
              </div>
              {errors.subject && (
                <p className="mt-2 text-sm text-red-600">{errors.subject.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="teacherPhone" className="block text-black md:text-[18px] text-[16px]">
                ტელ ნომერი *
              </label>
              <div className="mt-1">
                <input
                  id="teacherPhone"
                  type="tel"
                  autoComplete="tel"
                  {...register('teacherPhone')}
                  className="appearance-none block w-full px-3 py-2 border border-black rounded-md placeholder-black focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
                className="appearance-none block w-full px-3 py-2 border border-black rounded-md placeholder-black focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
                  className="appearance-none block w-full px-3 py-2 border border-black rounded-md placeholder-black focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
                  className="appearance-none block w-full px-3 py-2 border border-black rounded-md placeholder-black focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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

      <div className="flex space-x-3">
        <button
          type="button"
          onClick={() => setCurrentStep('code')}
          className="flex-1 py-2 px-4 border border-black rounded-md shadow-sm text-sm font-medium text-black bg-white  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          უკან
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 py-2 px-4 border border-black rounded-md shadow-sm md:text-[20px] text-[18px] font-bold text-white bg-[#a2997a] cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'რეგისტრაცია...' : 'რეგისტრაცია'}
        </button>
      </div>
    </form>
  )

  const getStepTitle = () => {
    switch (currentStep) {
      case 'email':
        return 'ელ-ფოსტის ვერიფიკაცია'
      case 'code':
        return 'ვერიფიკაციის კოდი'
      case 'registration':
        return 'რეგისტრაცია'
      default:
        return 'რეგისტრაცია'
    }
  }

  const getStepDescription = () => {
    switch (currentStep) {
      case 'email':
        return 'შეიყვანეთ თქვენი ელ-ფოსტა ვერიფიკაციისთვის'
      case 'code':
        return 'შეიყვანეთ 6-ციფრიანი კოდი თქვენს ელ-ფოსტაზე'
      case 'registration':
        return 'შეავსეთ რეგისტრაციის ფორმა'
      default:
        return 'ახალი ანგარიშის შექმნა'
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="mt-6 font-extrabold text-black md:text-[30px] text-[20px]">
            {getStepTitle()}
          </h2>
          <p className="mt-2 text-black md:text-[18px] text-[16px]">
            {getStepDescription()}
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
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
            <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
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

          {currentStep === 'email' && renderEmailStep()}
          {currentStep === 'code' && renderCodeStep()}
          {currentStep === 'registration' && renderRegistrationStep()}

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-black" />
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
