import React from 'react'
import Image from 'next/image'

const Why = () => {
  return (
    <div className=" md:py-16 py-5 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">რატომ ვარჩევთ ჩვენ?</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            ჩვენი პლატფორმა გთავაზობთ ყველაზე მოწინავე ტექნოლოგიებს და მეთოდებს ოლიმპიადების ჩასატარებლად
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Book Icon */}
          <div className="text-center">
            <div className="mb-6 flex justify-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                <Image
                  src="/why/book.png"
                  alt="წიგნი"
                  width={40}
                  height={40}
                  className="w-10 h-10"
                />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">სასკოლო პროგრამა</h3>
           
          </div>

          {/* Dashboard Icon */}
          <div className="text-center">
            <div className="mb-6 flex justify-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <Image
                  src="/why/dashboard.png"
                  alt="დაშბორდი"
                  width={40}
                  height={40}
                  className="w-10 h-10"
                />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">ხელმისაწვდომი ფასი</h3>
           
          </div>

          {/* Mission Icon */}
          <div className="text-center">
            <div className="mb-6 flex justify-center">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center">
                <Image
                  src="/why/mission.png"
                  alt="მისია"
                  width={40}
                  height={40}
                  className="w-10 h-10"
                />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">გამარჯვების დიდი შანსი</h3>
            
          </div>

          {/* Prize Icon */}
          <div className="text-center">
            <div className="mb-6 flex justify-center">
              <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center">
                <Image
                  src="/why/prize.png"
                  alt="პრიზი"
                  width={40}
                  height={40}
                  className="w-10 h-10"
                />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">მრავალფეროვანი პრიზები</h3>
            
          </div>
        </div>
      </div>
    </div>
  )
}

export default Why