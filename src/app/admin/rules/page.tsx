'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

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

export default function AdminRulesPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [rulesData, setRulesData] = useState<RulesPageData>({
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

    fetchRulesData();
  }, [isAuthenticated, user, router]);

  const fetchRulesData = async () => {
    try {
      const response = await fetch('/api/admin/rules');
      if (response.ok) {
        const data = await response.json();
        setRulesData(data);
      }
    } catch (error) {
      console.error('Error fetching rules data:', error);
      setMessage({ type: 'error', text: 'შეცდომა მონაცემების ჩატვირთვისას' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const url = rulesData.id ? '/api/admin/rules' : '/api/admin/rules';
      const method = rulesData.id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(rulesData),
      });

      if (response.ok) {
        const savedData = await response.json();
        setRulesData(savedData);
        setMessage({ type: 'success', text: 'გვერდი წარმატებით შენახულია!' });
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'შეცდომა შენახვისას' });
      }
    } catch (error) {
      console.error('Error saving rules data:', error);
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

    setRulesData(prev => {
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

    setRulesData(prev => {
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

  const updateSection = (index: number, field: keyof ContentSection, value: any) => {
    setRulesData(prev => {
      const newSections = [...prev.content.sections];
      newSections[index] = { ...newSections[index], [field]: value };
      return {
        ...prev,
        content: { sections: newSections }
      };
    });
  };

  const updateListItem = (sectionIndex: number, itemIndex: number, value: string) => {
    setRulesData(prev => {
      const newSections = [...prev.content.sections];
      const newItems = [...(newSections[sectionIndex].items || [])];
      newItems[itemIndex] = value;
      newSections[sectionIndex] = { ...newSections[sectionIndex], items: newItems };
      return {
        ...prev,
        content: { sections: newSections }
      };
    });
  };

  const addListItem = (sectionIndex: number) => {
    setRulesData(prev => {
      const newSections = [...prev.content.sections];
      const newItems = [...(newSections[sectionIndex].items || []), ''];
      newSections[sectionIndex] = { ...newSections[sectionIndex], items: newItems };
      return {
        ...prev,
        content: { sections: newSections }
      };
    });
  };

  const removeListItem = (sectionIndex: number, itemIndex: number) => {
    setRulesData(prev => {
      const newSections = [...prev.content.sections];
      const newItems = [...(newSections[sectionIndex].items || [])];
      newItems.splice(itemIndex, 1);
      newSections[sectionIndex] = { ...newSections[sectionIndex], items: newItems };
      return {
        ...prev,
        content: { sections: newSections }
      };
    });
  };

  const removeSection = (index: number) => {
    setRulesData(prev => {
      const newSections = [...prev.content.sections];
      newSections.splice(index, 1);
      return {
        ...prev,
        content: { sections: newSections }
      };
    });
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">წესების გვერდის რედაქტირება</h1>
            <p className="text-gray-600">აქ შეგიძლიათ რედაქტიროთ წესების გვერდის შინაარსი</p>
          </div>

          {message && (
            <div className={`mb-6 p-4 rounded-md ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {message.text}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                გვერდის სათაური
              </label>
              <input
                type="text"
                id="title"
                value={rulesData.title}
                onChange={(e) => setRulesData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="მაგ: წესები და პირობები"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">შინაარსის სექციები</h3>
                <div className="space-x-2">
                  <button
                    type="button"
                    onClick={() => addTextSection()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    ტექსტის დამატება
                  </button>
                  <button
                    type="button"
                    onClick={() => addListSection()}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    სიის დამატება
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {rulesData.content.sections.map((section, index) => (
                  <div key={section.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="text-md font-medium text-gray-800">
                        სექცია {index + 1}: {section.type === 'text' ? 'ტექსტი' : 'სია'}
                      </h4>
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={() => addTextSection(index)}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
                        >
                          ტექსტი
                        </button>
                        <button
                          type="button"
                          onClick={() => addListSection(index)}
                          className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200"
                        >
                          სია
                        </button>
                        <button
                          type="button"
                          onClick={() => removeSection(index)}
                          className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
                        >
                          წაშლა
                        </button>
                      </div>
                    </div>

                    {section.type === 'text' ? (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            სათაური (ოფციონალური)
                          </label>
                          <input
                            type="text"
                            value={section.title || ''}
                            onChange={(e) => updateSection(index, 'title', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="სექციის სათაური"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            ტექსტი
                          </label>
                          <textarea
                            value={section.content || ''}
                            onChange={(e) => updateSection(index, 'content', e.target.value)}
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="შეიყვანეთ ტექსტი..."
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            სიის სათაური
                          </label>
                          <input
                            type="text"
                            value={section.title || ''}
                            onChange={(e) => updateSection(index, 'title', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="სიის სათაური"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            სიის ელემენტები
                          </label>
                          <div className="space-y-2">
                            {(section.items || []).map((item, itemIndex) => (
                              <div key={itemIndex} className="flex space-x-2">
                                <input
                                  type="text"
                                  value={item}
                                  onChange={(e) => updateListItem(index, itemIndex, e.target.value)}
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  placeholder={`ელემენტი ${itemIndex + 1}`}
                                />
                                <button
                                  type="button"
                                  onClick={() => removeListItem(index, itemIndex)}
                                  className="px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
                                >
                                  წაშლა
                                </button>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => addListItem(index)}
                              className="px-4 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200"
                            >
                              ელემენტის დამატება
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                გაუქმება
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
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
