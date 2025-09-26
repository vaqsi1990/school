'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

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

export default function AdminAboutPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [aboutData, setAboutData] = useState<AboutPageData>({
    title: '',
    content: {
      sections: []
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!isAuthenticated || user?.userType !== 'ADMIN') {
      router.push('/auth/signin');
      return;
    }

    fetchAboutData();
  }, [isAuthenticated, user, router]);

  const fetchAboutData = async () => {
    try {
      const response = await fetch('/api/admin/about');
      if (response.ok) {
        const data = await response.json();
        setAboutData(data);
      }
    } catch (error) {
      console.error('Error fetching about data:', error);
      setMessage({ type: 'error', text: 'შეცდომა მონაცემების ჩატვირთვისას' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const url = aboutData.id ? '/api/admin/about' : '/api/admin/about';
      const method = aboutData.id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(aboutData),
      });

      if (response.ok) {
        const savedData = await response.json();
        setAboutData(savedData);
        setMessage({ type: 'success', text: 'გვერდი წარმატებით შენახულია!' });
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'შეცდომა შენახვისას' });
      }
    } catch (error) {
      console.error('Error saving about data:', error);
      setMessage({ type: 'error', text: 'შეცდომა შენახვისას' });
    } finally {
      setSaving(false);
    }
  };

  const addTextSection = (afterIndex?: number) => {
    const newSection: ContentSection = {
      id: Date.now().toString(),
      type: 'text',
      title: '',
      content: ''
    };

    setAboutData(prev => {
      const newSections = [...prev.content.sections];
      if (afterIndex !== undefined) {
        newSections.splice(afterIndex + 1, 0, newSection);
      } else {
        newSections.push(newSection);
      }
      return {
        ...prev,
        content: { sections: newSections }
      };
    });
  };

  const addListSection = (afterIndex?: number) => {
    const newSection: ContentSection = {
      id: Date.now().toString(),
      type: 'list',
      title: '',
      items: ['']
    };

    setAboutData(prev => {
      const newSections = [...prev.content.sections];
      if (afterIndex !== undefined) {
        newSections.splice(afterIndex + 1, 0, newSection);
      } else {
        newSections.push(newSection);
      }
      return {
        ...prev,
        content: { sections: newSections }
      };
    });
  };

  const removeSection = (sectionIndex: number) => {
    setAboutData(prev => ({
      ...prev,
      content: {
        sections: prev.content.sections.filter((_, i) => i !== sectionIndex)
      }
    }));
  };

  const updateSection = (sectionIndex: number, updates: Partial<ContentSection>) => {
    setAboutData(prev => ({
      ...prev,
      content: {
        sections: prev.content.sections.map((section, i) => 
          i === sectionIndex ? { ...section, ...updates } : section
        )
      }
    }));
  };

  const addListItem = (sectionIndex: number) => {
    setAboutData(prev => ({
      ...prev,
      content: {
        sections: prev.content.sections.map((section, i) => 
          i === sectionIndex 
            ? { ...section, items: [...(section.items || []), ''] }
            : section
        )
      }
    }));
  };

  const removeListItem = (sectionIndex: number, itemIndex: number) => {
    setAboutData(prev => ({
      ...prev,
      content: {
        sections: prev.content.sections.map((section, i) => 
          i === sectionIndex 
            ? { ...section, items: section.items?.filter((_, j) => j !== itemIndex) || [] }
            : section
        )
      }
    }));
  };

  const updateListItem = (sectionIndex: number, itemIndex: number, value: string) => {
    setAboutData(prev => ({
      ...prev,
      content: {
        sections: prev.content.sections.map((section, i) => 
          i === sectionIndex 
            ? { 
                ...section, 
                items: section.items?.map((item, j) => j === itemIndex ? value : item) || []
              }
            : section
        )
      }
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">მონაცემების ჩატვირთვა...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
            About გვერდის რედაქტირება
          </h1>

          {message && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.type === 'success' 
                ? 'bg-green-100 text-green-800 border border-green-200' 
                : 'bg-red-100 text-red-800 border border-red-200'
            }`}>
              {message.text}
            </div>
          )}

           <div className="space-y-6">
             {/* Title */}
             <div>
               <label className="block text-[16px] font-medium text-black mb-2">
                 სათაური
               </label>
               <input
                 type="text"
                 value={aboutData.title}
                 onChange={(e) => setAboutData(prev => ({ ...prev, title: e.target.value }))}
                 className="w-full text-black placeholder:text-black px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                 placeholder="შეიყვანეთ სათაური"
               />
             </div>

             {/* Add Section Buttons */}
             <div className="flex gap-4 mb-6">
               <button
                 type="button"
                 onClick={() => addTextSection()}
                 className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
               >
                 ტექსტის დამატება
               </button>
               <button
                 type="button"
                 onClick={() => addListSection()}
                 className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
               >
                 სიის დამატება
               </button>
             </div>

             {/* Dynamic Sections */}
             {aboutData.content.sections.map((section, sectionIndex) => (
               <div key={section.id} className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                 <div className="flex justify-between items-center mb-4">
                   <h3 className="text-lg font-medium text-black">
                     {section.type === 'text' ? 'ტექსტის სექცია' : 'სიის სექცია'}
                   </h3>
                   <div className="flex gap-2">
                     <button
                       type="button"
                       onClick={() => addTextSection(sectionIndex)}
                       className="px-2 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                       title="ტექსტის დამატება ამ სექციის შემდეგ"
                     >
                       + ტექსტი
                     </button>
                     <button
                       type="button"
                       onClick={() => addListSection(sectionIndex)}
                       className="px-2 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                       title="სიის დამატება ამ სექციის შემდეგ"
                     >
                       + სია
                     </button>
                     <button
                       type="button"
                       onClick={() => removeSection(sectionIndex)}
                       className="px-2 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                       title="სექციის წაშლა"
                     >
                       წაშლა
                     </button>
                   </div>
                 </div>

                 {/* Section Title */}
                 <div className="mb-4">
                   <label className="block text-sm font-medium text-black mb-2">
                     სექციის სათაური (არასავალდებულო)
                   </label>
                   <input
                     type="text"
                     value={section.title || ''}
                     onChange={(e) => updateSection(sectionIndex, { title: e.target.value })}
                     className="w-full text-black placeholder:text-black px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                     placeholder="შეიყვანეთ სათაური"
                   />
                 </div>

                 {/* Text Section */}
                 {section.type === 'text' && (
                   <div>
                     <label className="block text-sm font-medium text-black mb-2">
                       ტექსტის შინაარსი
                     </label>
                     <textarea
                       value={section.content || ''}
                       onChange={(e) => updateSection(sectionIndex, { content: e.target.value })}
                       rows={4}
                       className="w-full text-black placeholder:text-black px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                       placeholder="შეიყვანეთ ტექსტი"
                     />
                   </div>
                 )}

                 {/* List Section */}
                 {section.type === 'list' && (
                   <div>
                     <label className="block text-sm font-medium text-black mb-2">
                       სიის ელემენტები
                     </label>
                     {section.items?.map((item, itemIndex) => (
                       <div key={itemIndex} className="flex items-center gap-2 mb-2">
                         <input
                           type="text"
                           value={item}
                           onChange={(e) => updateListItem(sectionIndex, itemIndex, e.target.value)}
                           className="flex-1 text-black placeholder:text-black px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                           placeholder={`ელემენტი ${itemIndex + 1}`}
                         />
                         <button
                           type="button"
                           onClick={() => removeListItem(sectionIndex, itemIndex)}
                           className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                         >
                           წაშლა
                         </button>
                       </div>
                     ))}
                     <button
                       type="button"
                       onClick={() => addListItem(sectionIndex)}
                       className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                     >
                       ელემენტის დამატება
                     </button>
                   </div>
                 )}
               </div>
             ))}

             {/* Save Button */}
             <div className="flex justify-center pt-6">
               <button
                 onClick={handleSave}
                 disabled={saving}
                 className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
               >
                 {saving ? 'შენახვა...' : 'შენახვა'}
               </button>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}
