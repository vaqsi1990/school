'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'

const Hero: React.FC = () => {
  return (
    <section className="relative md:pb-16 pb-5 bg-gray-50 text-white overflow-hidden">
      {/* Content */}
      <div className="relative mx-auto max-w-7xl  flex items-center h-full">
        <div className="flex  flex-col md:flex-row  md:mt-0 text-center md:text-start px-4 items-center justify-between w-full">
          {/* Text Content - Left Side */}
          <motion.div 
            className="max-w-2xl  mb-0 text-black z-10"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.h1 
              className="text-[20px] md:text-[30px] font-extrabold mb-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              ონლაინ ოლიმპიადა სკოლის მოსწავლეებისთვის
            </motion.h1>

            <motion.p 
              className="text-lg md:text-xl text-black mb-8 leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              შეამოწმე შენი ცოდნა ონლაინ
            </motion.p>

            <motion.div 
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <Link
                href="/register"   
                className="inline-flex mb-6 text-white items-center justify-center px-8 py-4 bg-[#034e64] md:text-[20px] text-[18px] font-bold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                დარეგისტრირდი ახლა
              </Link>
            </motion.div>
            <motion.p 
              className="md:text-[20px] text-[18px] text-red-500"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              უკვე დარეგისტრირებულია 2500 მოსწავლე
            </motion.p>
          </motion.div>

          {/* Image - Right Side */}
          <motion.div 
            className="relative mb-0  md:w-[60%] md:h-[60vh] h-[30vh] w-[80%] h-full flex items-center justify-center"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <motion.div 
              className="relative w-full md:h-[60vh] h-[30vh] rounded-2xl overflow-hidden"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <Image
                src="/hero/hero.png"
                alt="Online Olympiad"
                fill
                className="md:object-cover object-contain object-center"
                priority
              />
              {/* Subtle overlay for better integration */}
             
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>

  )
}

export default Hero
