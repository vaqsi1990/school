'use client';

import React, { useEffect, useState } from 'react';

interface ContentSection {
  id: string;
  type: 'text' | 'list';
  title?: string;
  content?: string;
  items?: string[];
}

interface AboutPageData {
  id?: string;
  title: string;
  content: {
    sections: ContentSection[];
  };
}

export default function AboutPage() {
  const [aboutData, setAboutData] = useState<AboutPageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        const response = await fetch('/api/about');
        if (response.ok) {
          const data = await response.json();
          setAboutData(data);
        }
      } catch (error) {
        console.error('Error fetching about data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAboutData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">მონაცემების ჩატვირთვა...</p>
        </div>
      </div>
    );
  }

  if (!aboutData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">შეცდომა მონაცემების ჩატვირთვისას</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-3xl font-bold text-center mb-12 text-gray-800">
          {aboutData.title}
        </h1>
        
        <div className="prose prose-lg max-w-none">
          {aboutData.content.sections.map((section, index) => (
            <div key={section.id} className="mb-8">
              {section.title && (
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                  {section.title}
                </h2>
              )}
              
              {section.type === 'text' && section.content && (
                <p className="text-black text-[18px] leading-relaxed">
                  {section.content}
                </p>
              )}
              
              {section.type === 'list' && section.items && (
                <ul className="text-black text-[18px] leading-relaxed space-y-2">
                  {section.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
