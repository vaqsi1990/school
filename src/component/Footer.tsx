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
                        <p className="text-white text-[16px] leading-relaxed mb-6">
                            შეამოწმე შენი ცოდნა ონლაინ
                        </p>
                    </div>

                    {/* Student Section */}
                    <div className="flex flex-col items-center">
                        <h4 className="text-lg font-semibold mb-6 text-white">სკოლის მოსწავლეებისთვის</h4>
                        <ul className="space-y-3">
                            <li><Link href="/student/register" className="text-white transition-colors text-[16px]">რეგისტრაცია</Link></li>
                            <li><Link href="/student/login" className="text-white transition-colors text-[16px]">შესვლა</Link></li>
                        </ul>
                    </div>

                    {/* Contact Section */}
                    <div className="flex flex-col items-center">
                        <h4 className="text-lg font-semibold mb-6 text-white">კონტაქტი</h4>
                        {/* <div className="space-y-3">
                            <p className="text-white text-[16px]">info@olympiad.ge</p>
                            <p className="text-white text-[16px]">info@olympiad.ge</p>
                            <p className="text-white text-[16px]">+995 555 55 55 55</p>
                            <p className="text-white text-[16px]">Tbilisi, Georgia</p>
                        </div> */}
                        
                        {/* Social Media */}
                        <div className="">
                            <Link 
                                href="https://www.facebook.com/profile.php?id=61580944892749" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center w-10 h-10 bg-blue-600 hover:bg-blue-700 rounded-full transition-colors duration-200"
                                aria-label="Facebook Page"
                            >
                                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                </svg>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}

        </footer>
    )
}

export default Footer
