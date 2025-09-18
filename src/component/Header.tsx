'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import Image from 'next/image'

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, isAuthenticated, logout } = useAuth()

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <header className="bg-white shadow-lg border-b border-gray-200 relative">
      <div className="max-w-10xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3">
              <Image src="/logo.jpg" className='rounded-full' alt="Logo" width={60} height={60} />
            </Link>

            {/* Desktop Navigation - moved next to logo */}
            <nav className="hidden md:flex items-center space-x-8 ml-8">
              <Link
                href="/blog"
                className="text-black px-3 py-2 rounded-md md:text-[20px] text-[16px] font-bold transition-colors "
              >
               ბლოგი
              </Link>

              <Link
                href="/about"
                className="text-black px-3 py-2 rounded-md md:text-[20px] text-[16px] font-bold transition-colors "
              >
                ჩვენს შესახებ
              </Link>

              <Link
                href="/contacts"
                className="text-black px-3 py-2 rounded-md md:text-[20px] text-[16px] font-bold transition-colors "
              >
                კონტაქტები
              </Link>
            </nav>
          </div>

          {/* Desktop Action Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {!isAuthenticated ? (
              <>
                <Link
                  href="/auth/signin"
                  className="text-black px-3 py-2 rounded-md md:text-[20px] text-[16px] font-bold transition-colors "
                >
                  შესვლა
                </Link>
                <Link
                  href="/auth/signup"
                  className="bg-[#034e64] text-white px-4 py-2 rounded-md md:text-[20px] text-[16px] font-bold transition-colors"
                >
                  რეგისტრაცია
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/dashboard"
                  className="text-black px-3 py-2 rounded-md md:text-[20px] text-[20px] cursor-pointer font-bold transition-colors "
                >
                  დეშბორდი
                </Link>
                <button
                  onClick={logout}
                  className="bg-[#034e64] cursor-pointer text-white px-4 py-2 rounded-md md:text-[20px] text-[16px] font-bold transition-colors hover:bg-[#023a4d]"
                >
                  გამოსვლა
                </button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-black p-2"
              aria-label="Toggle menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden w-full h-screen text-center absolute top-full left-0 right-0 bg-white shadow-lg border-b border-gray-200 z-50">
            <div className="px-4 py-6 space-y-4">
              {/* Mobile Navigation Links */}
              <div className="space-y-3">
                <Link
                  href="/blog"
                  className="block text-black px-4 py-3 rounded-lg text-[18px] font-bold transition-colors hover:bg-gray-50 hover:text-blue-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  ბლოგი
                </Link>

                <Link
                  href="/about"
                  className="block text-black px-4 py-3 rounded-lg text-[18px] font-bold transition-colors hover:bg-gray-50 hover:text-blue-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  ჩვენს შესახებ
                </Link>

                <Link
                  href="/contacts"
                  className="block text-black px-4 py-3 rounded-lg text-[18px] font-bold transition-colors hover:bg-gray-50 hover:text-blue-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  კონტაქტები
                </Link>
              </div>

              {/* Mobile Action Buttons */}
              <div className="pt-4 border-t border-gray-200 space-y-3">
                {!isAuthenticated ? (
                  <>
                    <Link
                      href="/auth/signin"
                      className="inline-flex w-full text-white cursor-pointer items-center justify-center px-8 py-4 bg-[#034e64]  md:text-[24px] text-[18px] font-bold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      შესვლა
                    </Link>
                    <Link
                      href="/auth/signup"
                      className="inline-flex w-full text-white cursor-pointer items-center justify-center px-8 py-4 bg-[#034e64]  md:text-[24px] text-[18px] font-bold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      რეგისტრაცია
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/dashboard"
                      className="block bg-blue-600 text-white px-4 py-3 rounded-lg text-[18px] font-bold  transition-colors text-center"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      დეშბორდი
                    </Link>
                    <button
                      onClick={() => {
                        logout()
                        setIsMenuOpen(false)
                      }}
                      className="block w-full bg-red-600 text-white px-4 py-3 rounded-lg text-[18px] font-bold transition-colors"
                    >
                      გამოსვლა
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header
