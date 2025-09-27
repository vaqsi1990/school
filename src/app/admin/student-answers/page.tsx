'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

interface StudentAnswer {
  id: string;
  studentId: string;
  questionId: string;
  answer: string;
  isCorrect: boolean | null;
  points: number | null;
  answeredAt: string;
  olympiadId: string | null;
  roundNumber: number | null;
  question: {
    id: string;
    text: string;
    type: string;
    options: string[];
    correctAnswer: string | null;
    points: number;
    subject: {
      name: string;
    };
    grade: number;
  };
  student: {
    id: string;
    name: string;
    lastname: string;
    grade: number;
    school: string;
  };
  manualScores: Array<{
    id: string;
    score: number;
    maxScore: number;
    feedback: string | null;
    scoredAt: string;
    scorer: {
      name: string;
      lastname: string;
    };
  }>;
}

interface Olympiad {
  id: string;
  name: string;
  subject: {
    name: string;
  };
  grade: number;
}

interface MatchingPair {
  left: string;
  right: string;
}

interface LeftSideItem {
  left: string;
}

interface RightSideItem {
  right: string;
}

interface TestQuestion {
  id: string;
  text: string;
  type: string;
  options: string[];
  correctAnswer: string | null;
  points: number;
  image: string[];
  imageOptions: string[];
  matchingPairs: MatchingPair[] | null;
  leftSide: LeftSideItem[] | null;
  rightSide: RightSideItem[] | null;
  content: string | null;
  answerTemplate: string | null;
  rubric: string | null;
  subject: {
    name: string;
  };
  grade: number;
  order: number;
  packageName: string;
}

interface TestContent {
  olympiad: {
    id: string;
    name: string;
    description: string | null;
    startDate: string;
    endDate: string;
    subjects: string[];
    grades: number[];
  };
  questions: TestQuestion[];
}

export default function AdminStudentAnswersPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [answers, setAnswers] = useState<StudentAnswer[]>([]);
  const [olympiads, setOlympiads] = useState<Olympiad[]>([]);
  const [selectedOlympiad, setSelectedOlympiad] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [editingAnswer, setEditingAnswer] = useState<string | null>(null);
  const [manualScore, setManualScore] = useState<{ [key: string]: { score: number; feedback: string } }>({});
  const [saving, setSaving] = useState<{ [key: string]: boolean }>({});
  const [testContent, setTestContent] = useState<TestContent | null>(null);
  const [showTestContent, setShowTestContent] = useState(false);
  const [loadingTestContent, setLoadingTestContent] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || user?.userType !== 'ADMIN') {
      router.push('/auth/signin');
      return;
    }

    fetchOlympiads();
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    if (selectedOlympiad) {
      fetchStudentAnswers();
    }
  }, [selectedOlympiad]);

  const fetchOlympiads = async () => {
    try {
      const response = await fetch('/api/admin/olympiads');
      if (response.ok) {
        const data = await response.json();
        setOlympiads(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching olympiads:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentAnswers = async () => {
    try {
      const response = await fetch(`/api/admin/student-answers?olympiadId=${selectedOlympiad}`);
      if (response.ok) {
        const data = await response.json();
        setAnswers(data);
      }
    } catch (error) {
      console.error('Error fetching student answers:', error);
    }
  };

  const fetchTestContent = async () => {
    if (!selectedOlympiad) return;
    
    setLoadingTestContent(true);
    try {
      const response = await fetch(`/api/admin/olympiads/${selectedOlympiad}/test-content`);
      if (response.ok) {
        const data = await response.json();
        setTestContent(data);
      } else {
        console.error('Error fetching test content');
      }
    } catch (error) {
      console.error('Error fetching test content:', error);
    } finally {
      setLoadingTestContent(false);
    }
  };

  const handleManualScore = async (answerId: string) => {
    setSaving(prev => ({ ...prev, [answerId]: true }));
    
    try {
      const scoreData = manualScore[answerId];
      const response = await fetch('/api/admin/student-answers/manual-score', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answerId,
          score: scoreData.score,
          feedback: scoreData.feedback,
        }),
      });

      if (response.ok) {
        // Refresh answers
        await fetchStudentAnswers();
        setEditingAnswer(null);
        setManualScore(prev => {
          const newState = { ...prev };
          delete newState[answerId];
          return newState;
        });
      } else {
        const error = await response.json();
        alert(`შეცდომა: ${error.error}`);
      }
    } catch (error) {
      console.error('Error saving manual score:', error);
      alert('შეცდომა ქულის შენახვისას');
    } finally {
      setSaving(prev => ({ ...prev, [answerId]: false }));
    }
  };

  const startEditing = (answerId: string, currentPoints: number) => {
    setEditingAnswer(answerId);
    setManualScore(prev => ({
      ...prev,
      [answerId]: {
        score: currentPoints || 0,
        feedback: ''
      }
    }));
  };

  const toggleTestContent = () => {
    if (!showTestContent && !testContent) {
      fetchTestContent();
    }
    setShowTestContent(!showTestContent);
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
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-black">
          მოსწავლეთა პასუხების მართვა
        </h1>

        {/* Olympiad Selection */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <label className="block text-[18px] font-medium text-black mb-2 placeholder:text-black">
            ოლიმპიადის არჩევა
          </label>
          <select
            value={selectedOlympiad}
            onChange={(e) => setSelectedOlympiad(e.target.value)}
            className="w-full px-3 text-black placeholder:text-black py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option className="text-black" value="">აირჩიეთ ოლიმპიადა</option>
            {olympiads.map((olympiad) => (
              <option className="text-black placeholder:text-black" key={olympiad.id} value={olympiad.id}>
                {olympiad.name} - {olympiad.subject.name} (კლასი {olympiad.grade})
              </option>
            ))}
          </select>
        </div>

        {/* Test Content Toggle */}
        {selectedOlympiad && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800">ტესტის კონტენტი</h2>
              <button
                onClick={toggleTestContent}
                disabled={loadingTestContent}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {loadingTestContent ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ჩატვირთვა...
                  </>
                ) : (
                  <>
                    {showTestContent ? 'ტესტის კონტენტის დამალვა' : 'ტესტის კონტენტის ნახვა'}
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Test Content Display */}
        {showTestContent && testContent && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              {testContent.olympiad.name}
            </h3>
            {testContent.olympiad.description && (
              <p className="text-gray-600 mb-4">{testContent.olympiad.description}</p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-sm">
              <div>
                <span className="font-medium">საგნები:</span> {testContent.olympiad.subjects.join(', ')}
              </div>
              <div>
                <span className="font-medium">კლასები:</span> {testContent.olympiad.grades.join(', ')}
              </div>
              <div>
                <span className="font-medium">დაწყების თარიღი:</span> {new Date(testContent.olympiad.startDate).toLocaleDateString('ka-GE')}
              </div>
              <div>
                <span className="font-medium">დასრულების თარიღი:</span> {new Date(testContent.olympiad.endDate).toLocaleDateString('ka-GE')}
              </div>
            </div>
            
            <div className="space-y-6">
              {testContent.questions.map((question, index) => (
                <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                        {question.packageName}
                      </span>
                      <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm">
                        კითხვა {index + 1}
                      </span>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                        {question.points} ქულა
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">{question.type}</span>
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-gray-800 font-medium">{question.text}</p>
                  </div>

                  {question.content && (
                    <div className="mb-3 p-3 bg-gray-50 rounded">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{question.content}</p>
                    </div>
                  )}

                  {question.options && question.options.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700 mb-2">ვარიანტები:</p>
                      <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                        {question.options.map((option, optIndex) => (
                          <li key={optIndex}>{option}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {question.matchingPairs && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700 mb-2">შესათანხმებელი წყვილები:</p>
                      <div className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                        <pre>{JSON.stringify(question.matchingPairs, null, 2)}</pre>
                      </div>
                    </div>
                  )}

                  {question.leftSide && question.rightSide && (
                    <div className="mb-3 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">მარცხენა მხარე:</p>
                        <div className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                          <pre>{JSON.stringify(question.leftSide, null, 2)}</pre>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">მარჯვენა მხარე:</p>
                        <div className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                          <pre>{JSON.stringify(question.rightSide, null, 2)}</pre>
                        </div>
                      </div>
                    </div>
                  )}

                  {question.correctAnswer && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-green-700 mb-1">სწორი პასუხი:</p>
                      <p className="text-sm text-green-600 bg-green-50 p-2 rounded">{question.correctAnswer}</p>
                    </div>
                  )}

                  {question.answerTemplate && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-blue-700 mb-1">პასუხის შაბლონი:</p>
                      <p className="text-sm text-blue-600 bg-blue-50 p-2 rounded whitespace-pre-wrap">{question.answerTemplate}</p>
                    </div>
                  )}

                  {question.rubric && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-purple-700 mb-1">შეფასების კრიტერიუმები:</p>
                      <p className="text-sm text-purple-600 bg-purple-50 p-2 rounded whitespace-pre-wrap">{question.rubric}</p>
                    </div>
                  )}

                  {question.image && question.image.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700 mb-2">სურათები:</p>
                      <div className="flex flex-wrap gap-2">
                        {question.image.map((img, imgIndex) => (
                          <img
                            key={imgIndex}
                            src={img}
                            alt={`კითხვის სურათი ${imgIndex + 1}`}
                            className="max-w-xs max-h-32 object-contain border border-gray-200 rounded"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {question.imageOptions && question.imageOptions.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700 mb-2">სურათების ვარიანტები:</p>
                      <div className="flex flex-wrap gap-2">
                        {question.imageOptions.map((img, imgIndex) => (
                          <img
                            key={imgIndex}
                            src={img}
                            alt={`ვარიანტი ${imgIndex + 1}`}
                            className="max-w-xs max-h-32 object-contain border border-gray-200 rounded"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Student Answers */}
        {selectedOlympiad && (
          <div className="space-y-6">
            {answers.length === 0 ? (
              <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                <p className="text-gray-600">ამ ოლიმპიადაში პასუხები არ არის</p>
              </div>
            ) : (
              answers.map((answer) => (
                <div key={answer.id} className="bg-white rounded-lg shadow-lg p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Student Info */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">მოსწავლის ინფორმაცია</h3>
                      <div className="space-y-1 text-sm">
                        <p><span className="font-medium">სახელი:</span> {answer.student.name} {answer.student.lastname}</p>
                        <p><span className="font-medium">კლასი:</span> {answer.student.grade}</p>
                        <p><span className="font-medium">სკოლა:</span> {answer.student.school}</p>
                        <p><span className="font-medium">პასუხის თარიღი:</span> {new Date(answer.answeredAt).toLocaleDateString('ka-GE')}</p>
                        {answer.roundNumber && (
                          <p><span className="font-medium">რაუნდი:</span> {answer.roundNumber}</p>
                        )}
                      </div>
                    </div>

                    {/* Question Info */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">კითხვის ინფორმაცია</h3>
                      <div className="space-y-1 text-sm">
                        <p><span className="font-medium">საგანი:</span> {answer.question.subject.name}</p>
                        <p><span className="font-medium">კლასი:</span> {answer.question.grade}</p>
                        <p><span className="font-medium">ტიპი:</span> {answer.question.type}</p>
                        <p><span className="font-medium">ქულა:</span> {answer.question.points}</p>
                      </div>
                      <div className="mt-2">
                        <p className="font-medium text-sm">კითხვა:</p>
                        <p className="text-sm text-gray-700">{answer.question.text}</p>
                      </div>
                      {answer.question.options.length > 0 && (
                        <div className="mt-2">
                          <p className="font-medium text-sm">ვარიანტები:</p>
                          <ul className="text-sm text-gray-700 list-disc list-inside">
                            {answer.question.options.map((option, index) => (
                              <li key={index}>{option}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Answer and Scoring */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">პასუხი და შეფასება</h3>
                      <div className="space-y-2">
                        <div>
                          <p className="font-medium text-sm">მოსწავლის პასუხი:</p>
                          <p className="text-sm text-gray-700 bg-gray-100 p-2 rounded">{answer.answer}</p>
                        </div>
                        
                        {answer.question.correctAnswer && (
                          <div>
                            <p className="font-medium text-sm">სწორი პასუხი:</p>
                            <p className="text-sm text-green-700 bg-green-100 p-2 rounded">{answer.question.correctAnswer}</p>
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">ქულა:</span>
                          {editingAnswer === answer.id ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                value={manualScore[answer.id]?.score || 0}
                                onChange={(e) => setManualScore(prev => ({
                                  ...prev,
                                  [answer.id]: {
                                    ...prev[answer.id],
                                    score: parseFloat(e.target.value) || 0
                                  }
                                }))}
                                className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                                min="0"
                                max={answer.question.points}
                                step="0.1"
                              />
                              <span className="text-sm text-gray-500">/ {answer.question.points}</span>
                            </div>
                          ) : (
                            <span className="text-sm">
                              {answer.points !== null ? answer.points : 'არ არის შეფასებული'} / {answer.question.points}
                            </span>
                          )}
                        </div>

                        {editingAnswer === answer.id && (
                          <div>
                            <p className="font-medium text-sm mb-1">კომენტარი:</p>
                            <textarea
                              value={manualScore[answer.id]?.feedback || ''}
                              onChange={(e) => setManualScore(prev => ({
                                ...prev,
                                [answer.id]: {
                                  ...prev[answer.id],
                                  feedback: e.target.value
                                }
                              }))}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                              rows={2}
                              placeholder="შეიყვანეთ კომენტარი..."
                            />
                          </div>
                        )}

                        {/* Manual Scores History */}
                        {answer.manualScores.length > 0 && (
                          <div>
                            <p className="font-medium text-sm mb-1">ხელით შეფასებები:</p>
                            <div className="space-y-1">
                              {answer.manualScores.map((score) => (
                                <div key={score.id} className="text-xs bg-blue-50 p-2 rounded">
                                  <p><span className="font-medium">ქულა:</span> {score.score}/{score.maxScore}</p>
                                  <p><span className="font-medium">შეფასება:</span> {score.scorer.name} {score.scorer.lastname}</p>
                                  <p><span className="font-medium">თარიღი:</span> {new Date(score.scoredAt).toLocaleDateString('ka-GE')}</p>
                                  {score.feedback && (
                                    <p><span className="font-medium">კომენტარი:</span> {score.feedback}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-2 mt-3">
                          {editingAnswer === answer.id ? (
                            <>
                              <button
                                onClick={() => handleManualScore(answer.id)}
                                disabled={saving[answer.id]}
                                className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
                              >
                                {saving[answer.id] ? 'შენახვა...' : 'შენახვა'}
                              </button>
                              <button
                                onClick={() => {
                                  setEditingAnswer(null);
                                  setManualScore(prev => {
                                    const newState = { ...prev };
                                    delete newState[answer.id];
                                    return newState;
                                  });
                                }}
                                className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
                              >
                                გაუქმება
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => startEditing(answer.id, answer.points || 0)}
                              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                            >
                              ხელით შეფასება
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
