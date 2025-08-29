'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, isAuthenticated, logout } = useAuth()

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <header className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex  justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-black md:text-[25px] text-[20px]">ონლაინ ოლიმპიადა</h1>
                <p className="text-sm text-black md:text-[16px] text-[13px]">Online Olympiad</p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">

            <Link
              href="/subjects"
              className="text-black  px-3 py-2 rounded-md  md:text-[18px] text-[16px] font-bold transition-colors"
            >
              საგნები
            </Link>

            <Link
              href="/about"
              className="text-black  px-3 py-2 rounded-md  md:text-[18px] text-[16px] font-bold transition-colors"
            >
              ჩვენს შესახებ
            </Link>
          </nav>

          {/* Desktop Action Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {!isAuthenticated ? (
              <>
                <Link
                  href="/auth/signin"
                  className="text-black  px-3 py-2 rounded-md  md:text-[18px] text-[16px] font-bold transition-colors"
                >
                  შესვლა
                </Link>
                <Link
                  href="/auth/signup"
                  className="bg-[#a2997a] text-white px-4 py-2 rounded-md md:text-[18px] text-[16px] font-bold  transition-colors"
                >
                  რეგისტრაცია
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/dashboard"
                  className="text-black  px-3 py-2 rounded-md  md:text-[20px] text-[18px] cursor-pointer font-bold transition-colors"
                >
                  დეშბორდი
                </Link>
                <button
                  onClick={logout}
                  className="bg-red-600 text-white px-4 py-2 rounded-md md:text-[20px] text-[18px] cursor-pointer font-bold  transition-colors"
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
              className="text-gray-700 hover:text-blue-600 focus:outline-none focus:text-blue-600"
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
          <div className="md:hidden h-screen">
            <div className="px-2 pt-2 flex flex-col text-center pb-3 space-y-1 sm:px-3 bg-gray-50 rounded-lg mt-2">

              <Link
                href="/subjects"
                className="text-black  px-3 py-2 rounded-md  md:text-[18px] text-[16px] font-bold transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                საგნები
              </Link>

              <Link
                href="/about"
                className="text-black  px-3 py-2 rounded-md  md:text-[18px] text-[16px] font-bold transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                ჩვენს შესახებ
              </Link>

              {/* Mobile Action Buttons */}
              <div className="pt-4 space-y-2 border-t border-gray-200">
                {!isAuthenticated ? (
                  <>
                    <Link
                      href="/auth/signin"
                      className="bg-[#a2997a] text-white block px-3 py-2 rounded-md  md:text-[18px] text-[16px] font-bold hover:bg-blue-700 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      შესვლა
                    </Link>
                    <Link
                      href="/auth/signup"
                      className="bg-[#a2997a] text-white block px-3 py-2 rounded-md  md:text-[18px] text-[16px] font-bold hover:bg-green-700 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      რეგისტრაცია
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/dashboard"
                      className="bg-blue-600 text-white block px-3 py-2 rounded-md  md:text-[18px] text-[16px] font-bold hover:bg-blue-700 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      დეშბორდი
                    </Link>
                    <button
                      onClick={() => {
                        logout()
                        setIsMenuOpen(false)
                      }}
                      className="bg-red-600 text-white block w-full px-3 py-2 rounded-md  md:text-[18px] text-[16px] font-bold hover:bg-red-700 transition-colors"
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
