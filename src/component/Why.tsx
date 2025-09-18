'use client'

import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'

const Why = () => {
  return (
    <div className=" md:pb-16 pb-5 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-10"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <motion.p 
            className="text-3xl text-black font-bold max-w-3xl mx-auto"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
           რატომ ჩვენ ?
          </motion.p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Book Icon */}

          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            whileHover={{ y: -10, scale: 1.05 }}
          >
            <motion.div 
              className="mb-6 flex justify-center"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
            >
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                <Image
                  src="/why/book.png"
                  alt="წიგნი"
                  width={40}
                  height={40}
                  className="w-10 h-10"
                />
              </div>
            </motion.div>
            <motion.h3 
              className="text-xl font-semibold text-gray-900 mb-3"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              სასკოლო პროგრამა
            </motion.h3>
           
          </motion.div>

          {/* Dashboard Icon */}
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            whileHover={{ y: -10, scale: 1.05 }}
          >
            <motion.div 
              className="mb-6 flex justify-center"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
            >
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <Image
                  src="/why/dashboard.png"
                  alt="დაშბორდი"
                  width={40}
                  height={40}
                  className="w-10 h-10"
                />
              </div>
            </motion.div>
            <motion.h3 
              className="text-xl font-semibold text-gray-900 mb-3"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              ხელმისაწვდომი ფასი
            </motion.h3>
           
          </motion.div>

          {/* Mission Icon */}
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            whileHover={{ y: -10, scale: 1.05 }}
          >
            <motion.div 
              className="mb-6 flex justify-center"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
            >
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center">
                <Image
                  src="/why/mission.png"
                  alt="მისია"
                  width={40}
                  height={40}
                  className="w-10 h-10"
                />
              </div>
            </motion.div>
            <motion.h3 
              className="text-xl font-semibold text-gray-900 mb-3"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              viewport={{ once: true }}
            >
              გამარჯვების დიდი შანსი
            </motion.h3>
            
          </motion.div>

          {/* Prize Icon */}
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            whileHover={{ y: -10, scale: 1.05 }}
          >
            <motion.div 
              className="mb-6 flex justify-center"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
            >
              <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center">
                <Image
                  src="/why/prize.png"
                  alt="პრიზი"
                  width={40}
                  height={40}
                  className="w-10 h-10"
                />
              </div>
            </motion.div>
            <motion.h3 
              className="text-xl font-semibold text-gray-900 mb-3"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              viewport={{ once: true }}
            >
              მრავალფეროვანი პრიზები
            </motion.h3>
            
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Why