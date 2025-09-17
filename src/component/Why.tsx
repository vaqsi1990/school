import React from 'react'
import Image from 'next/image'

const Why = () => {
  return (
    <div className="py-16 bg-gray-50">
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
            <h3 className="text-xl font-semibold text-gray-900 mb-3">ხარისხიანი მასალა</h3>
            <p className="text-gray-600">
              ყველა კითხვა მომზადებულია გამოცდილი პედაგოგების მიერ და შეესაბამება სასწავლო სტანდარტებს
            </p>
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
            <h3 className="text-xl font-semibold text-gray-900 mb-3">მარტივი მართვა</h3>
            <p className="text-gray-600">
              დაშბორდი საშუალებას გაძლევთ მარტივად მართოთ ოლიმპიადები და თვალყურს ადევნოთ შედეგებს
            </p>
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
            <h3 className="text-xl font-semibold text-gray-900 mb-3">განათლების მისია</h3>
            <p className="text-gray-600">
              ჩვენი მიზანია ხარისხიანი განათლების ხელმისაწვდომობა ყველასთვის და სწავლის პროცესის გაუმჯობესება
            </p>
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
            <h3 className="text-xl font-semibold text-gray-900 mb-3">ღირსეული ჯილდოები</h3>
            <p className="text-gray-600">
              საუკეთესო მონაწილეები იღებენ ღირსეულ ჯილდოებს და სერტიფიკატებს, რაც მოტივაციას აძლევს შემდგომ სწავლას
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Why