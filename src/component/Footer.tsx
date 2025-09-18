'use client'

import React from 'react'
import Link from 'next/link'

const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="bg-gray-900  text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 ">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">

                    {/* Brand Section */}
                    <div className="flex flex-col items-center">
                        <div className="flex items-center space-x-3 mb-6">

                            <div>
                                <h3 className="text-xl font-bold">ონლაინ ოლიმპიადა</h3>
                            </div>
                        </div>
                        <p className="text-gray-300 text-sm leading-relaxed mb-6">
                            შეამოწმე შენი ცოდნა ონლაინ
                        </p>
                    </div>

                    {/* Student Section */}
                    <div className="flex flex-col items-center">
                        <h4 className="text-lg font-semibold mb-6 text-white">სკოლის მოსწავლეებისთვის</h4>
                        <ul className="space-y-3">
                            <li><Link href="/student/register" className="text-gray-300 hover:text-white transition-colors text-sm">რეგისტრაცია</Link></li>
                            <li><Link href="/student/login" className="text-gray-300 hover:text-white transition-colors text-sm">შესვლა</Link></li>
                        </ul>
                    </div>

                    {/* Contact Section */}
                    <div className="flex flex-col items-center">
                        <h4 className="text-lg font-semibold mb-6 text-white">კონტაქტი</h4>
                        <div className="space-y-3">
                            <p className="text-gray-300 text-sm">info@olympiad.ge</p>
                            <p className="text-gray-300 text-sm">+995 555 55 55 55</p>
                            <p className="text-gray-300 text-sm">Tbilisi, Georgia</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}

        </footer>
    )
}

export default Footer
