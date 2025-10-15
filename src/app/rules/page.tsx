'use client';

import React, { useState, useEffect } from 'react';

interface ContentSection {
  id: string;
  type: 'text' | 'list';
  title?: string;
  content?: string;
  items?: string[];
}

interface RulesPageData {
  id?: string;
  title: string;
  content: {
    sections: ContentSection[];
  };
}

export default function RulesPage() {
  const [rulesData, setRulesData] = useState<RulesPageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRulesData();
  }, []);

  const fetchRulesData = async () => {
    try {
      const response = await fetch('/api/rules');
      if (response.ok) {
        const data = await response.json();
        setRulesData(data);
      }
    } catch (error) {
      console.error('Error fetching rules data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">იტვირთება...</p>
        </div>
      </div>
    );
  }

  if (!rulesData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">წესები ჯერ არ არის დამატებული</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">{rulesData.title}</h1>
          
          <div className="prose prose-lg max-w-none">
            {rulesData.content.sections.map((section, index) => (
              <div key={section.id} className="mb-8">
                {section.type === 'text' ? (
                  <div>
                    {section.title && (
                      <h2 className="text-2xl font-semibold text-gray-800 mb-4">{section.title}</h2>
                    )}
                    <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {section.content}
                    </div>
                  </div>
                ) : (
                  <div>
                    {section.title && (
                      <h2 className="text-2xl font-semibold text-gray-800 mb-4">{section.title}</h2>
                    )}
                    <ul className="list-disc list-inside space-y-2 text-gray-700">
                      {section.items?.map((item, itemIndex) => (
                        <li key={itemIndex} className="leading-relaxed">{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
