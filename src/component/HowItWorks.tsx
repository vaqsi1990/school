'use client'

import React from 'react'

const HowItWorks: React.FC = () => {
  const steps = [
    {
      title: "დარეგისტრირდი",
      description: (
        <>
          მიიღე უნიკალური <br />6-ციფრიანი კოდი
        </>
      ),
      color: "from-blue-500 to-blue-600",
      stepNumber: "ნაბიჯი "
    },
    {

      title: "აირჩიე საგანი",
      description: "მათემატიკა, მეცნიერება, ლიტერატურა ან ერთიანი ეროვნული გამოცდები",
      color: "from-red-500 to-red-600",
      stepNumber: "ნაბიჯი "
    },
    {

      title: "დაწერე ტესტი",
      description: "მითითებულ დროს და ვადაში",
      color: "from-orange-500 to-orange-600",
      stepNumber: "ნაბიჯი "
    },
    {

      title: "ნახე შედეგები",
      description: "მყისიერად მიიღე შედეგები",
      color: "from-green-500 to-green-600",
      stepNumber: "ნაბიჯი "
    }
  ]

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-10xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="md:text-[40px] text-[30px] font-bold text-black mb-6">
            როგორ მუშაობს
          </h2>
          <p className="text-lg sm:text-xl text-black max-w-3xl mx-auto">
            მარტივი 4 ნაბიჯი ონლაინ ოლიმპიადაში მონაწილეობის მისაღებად
          </p>
        </div>

        {/* Steps Flowchart */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col lg:flex-row items-center">
              {/* Step Circle */}
              <div className="relative mb-6 lg:mb-0">
                <div className={`w-24 h-24 bg-gradient-to-r ${step.color} rounded-full flex flex-col items-center justify-center text-white shadow-lg`}>
                  <span className="md:text-[18x] text-[16px] font-bold mb-1">{step.stepNumber}</span>
                  <span className="md:text-[16px] text-[14px] font-bold">{index + 1}</span>
                </div>


              </div>


              <div className="text-start md:text-left md:ml-3 max-w-xs">
                <h3 className="md:text-[18px] text-center md:text-left text-[16px] font-bold text-black mb-3">
                  {step.title}
                </h3>
                <p className="text-black md:text-[16px] text-[14px] leading-relaxed">
                  {step.description}
                </p>
              </div>

              {index < steps.length - 1 && (
                <svg className="w-10 h-10 mx-4 text-black flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              )}
            </div>
          ))}
        </div>


      </div>
    </section>
  )
}

export default HowItWorks
