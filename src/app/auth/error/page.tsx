'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'CredentialsSignin':
        return 'ელ-ფოსტა ან პაროლი არასწორია'
      case 'AccessDenied':
        return 'წვდომა უარყოფილია'
      case 'Verification':
        return 'ელ-ფოსტის ვერიფიკაცია საჭიროა'
      case 'Configuration':
        return 'სისტემური შეცდომა'
      case 'Default':
        return 'დაფიქსირდა შეცდომა'
      default:
        return 'უცნობი შეცდომა'
    }
  }

  const getErrorDescription = (error: string | null) => {
    switch (error) {
      case 'CredentialsSignin':
        return 'გთხოვთ შეამოწმოთ თქვენი ელ-ფოსტა და პაროლი'
      case 'AccessDenied':
        return 'თქვენ არ გაქვთ ამ გვერდზე წვდომის უფლება'
      case 'Verification':
        return 'გთხოვთ გადაამოწმოთ თქვენი ელ-ფოსტა'
      case 'Configuration':
        return 'გთხოვთ სცადოთ მოგვიანებით'
      case 'Default':
        return 'გთხოვთ სცადოთ თავიდან'
      default:
        return 'გთხოვთ სცადოთ მოგვიანებით'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="mt-6 font-extrabold text-black md:text-[30px] text-[20px]">
            შეცდომა
          </h2>
          <p className="mt-2 text-black md:text-[18px] text-[16px]">
            {getErrorDescription(error)}
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800 font-medium">
                  {getErrorMessage(error)}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Link
              href="/auth/signin"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm md:text-[18px] text-[16px] font-medium text-white bg-[#a2997a] hover:bg-[#8b8570] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              ხელახლა შესვლა
            </Link>

            <Link
              href="/auth/signup"
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm md:text-[18px] text-[16px] font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              რეგისტრაცია
            </Link>
          </div>

          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-sm text-gray-600 hover:text-gray-500"
            >
              მთავარ გვერდზე დაბრუნება
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
