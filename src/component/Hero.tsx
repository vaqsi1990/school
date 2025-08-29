'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

const Hero: React.FC = () => {
  return (
    <section className="relative h-[100vh] bg-gray-900 text-white overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/hero/hero.jpg"
          alt="Online Olympiad"
          fill
          className="object-cover object-center"
          priority
        />
        {/* Overlay for readability */}
        <div className="absolute inset-0 bg-black/50"></div>
      </div>

      {/* Content */}
      <div className="relative mx-auto max-w-7xl mx-auto px-6 lg:px-12 py-24 flex items-center">
        <div className="max-w-2xl">
          <h1 className="text-[20px] md:text-[30px] font-extrabold mb-6">
            ონლაინ ოლიმპიადა სკოლის მოსწავლეებისთვის
          </h1>

          <p className="text-lg md:text-xl text-gray-200 mb-8 leading-relaxed">
            შეამოწმე შენი ცოდნა ონლაინ
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/register"
              className="inline-flex items-center justify-center px-8 py-4 bg-[#a2997a] md:text-[20px] text-[18px] font-bold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              დარეგისტრირდი ახლა
            </Link>

          </div>
        </div>
      </div>
    </section>

  )
}

export default Hero
