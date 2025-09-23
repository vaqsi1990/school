'use client'

import React from 'react'

interface Question {
  id: string
  text: string
  type: string
  options: string[]
  correctAnswer?: string
  points: number
  image: string[]
  content?: string
  matchingPairs?: Record<string, string>
  leftSide?: string[]
  rightSide?: string[]
  imageOptions?: string[]
  subject: string
  grade: number
}

interface TestModalProps {
  isOpen: boolean
  onClose: () => void
  questions: Question[]
  currentQuestionIndex: number
  userAnswers: Record<string, string>
  onAnswerChange: (questionId: string, answer: string) => void
  onNextQuestion: () => void
  onPreviousQuestion: () => void
  onFinishTest: () => void
  isLoading: boolean
  showResults: boolean
  score: number
  totalQuestions: number
  onResetTest: () => void
  shuffledOptions?: Record<string, string[]>
}

const TestModal: React.FC<TestModalProps> = ({
  isOpen,
  onClose,
  questions,
  currentQuestionIndex,
  userAnswers,
  onAnswerChange,
  onNextQuestion,
  onPreviousQuestion,
  onFinishTest,
  isLoading,
  showResults,
  score,
  totalQuestions,
  onResetTest,
  shuffledOptions = {}
}) => {
  if (!isOpen || questions.length === 0) return null

  const currentQuestion = questions[currentQuestionIndex]

  const getResultMessage = (score: number) => {
    if (score >= 80) {
      return "გილოცავ! ამ შედეგით შენ გაქვს შანსი გამარჯვების!"
    } else if (score >= 60) {
      return "კარგი შედეგია! კიდევ ცოტა ვარჯიში და უკეთესი შედეგი მიიღებ."
    } else if (score >= 40) {
      return "შედეგი საშუალოა. უფრო მეტი ვარჯიში გჭირდება."
    } else {
      return "შედეგი დაბალია. უფრო მეტი ვარჯიში გჭირდება."
    }
  }

  const renderQuestion = (question: Question) => {
    const userAnswer = userAnswers[question.id] || ''

    switch (question.type) {
      case 'CLOSED_ENDED':
        return (
          <div className="space-y-4 text-black">
            <p className="text-lg font-medium">{question.text}</p>
            {(shuffledOptions[question.id] || question.options).map((option, index) => (
              <label key={index} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={option}
                  checked={userAnswer === option}
                  onChange={(e) => onAnswerChange(question.id, e.target.value)}
                  className="w-4 h-4"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        )

      case 'MATCHING':
        return (
          <div className="space-y-4 text-black">
            <p className="text-lg font-medium">{question.text}</p>
            {question.leftSide && question.rightSide && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">მარცხენა მხარე:</h4>
                  {question.leftSide.map((item: string, index: number) => (
                    <div key={index} className="p-2 border rounded mb-2">
                      {item}
                    </div>
                  ))}
                </div>
                <div>
                  <h4 className="font-medium mb-2">მარჯვენა მხარე:</h4>
                  {question.rightSide.map((item: string, index: number) => (
                    <div key={index} className="p-2 border rounded mb-2">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )

      default:
        return (
          <div className="space-y-4 text-black">
            <p className="text-lg font-medium">{question.text}</p>
            <textarea
              value={userAnswer}
              onChange={(e) => onAnswerChange(question.id, e.target.value)}
              className="w-full p-3 border rounded-lg"
              rows={4}
              placeholder="შეიყვანეთ თქვენი პასუხი..."
            />
          </div>
        )
     }
   }

   // Show results view if showResults is true
   if (showResults) {
     return (
       <div className="fixed inset-0 z-50 flex items-center justify-center">
         {/* Transparent background overlay */}
         <div 
           className="absolute inset-0 bg-black/50"
           onClick={onClose}
         />
         
         {/* Results Modal content */}
         <div className="relative bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full mx-4">
           {/* Close button */}
           <button
             onClick={onClose}
             className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold z-10"
           >
             ×
           </button>
           
           {/* Results content */}
           <div className="pr-8">
             <div className="text-center">
               <h1 className="text-3xl font-bold text-black mb-6">ტესტის შედეგები</h1>
               
               {/* Score Circle */}
               <div className="flex justify-center mb-6">
                 <div className="relative w-32 h-32">
                   <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                     <circle
                       cx="50"
                       cy="50"
                       r="40"
                       stroke="#e5e7eb"
                       strokeWidth="8"
                       fill="none"
                     />
                     <circle
                       cx="50"
                       cy="50"
                       r="40"
                       stroke="#3b82f6"
                       strokeWidth="8"
                       fill="none"
                       strokeDasharray={`${2 * Math.PI * 40}`}
                       strokeDashoffset={`${2 * Math.PI * 40 * (1 - score / 100)}`}
                       className="transition-all duration-1000 ease-out"
                     />
                   </svg>
                   <div className="absolute inset-0 flex items-center justify-center">
                     <span className="text-2xl font-bold text-black">{score}%</span>
                   </div>
                 </div>
               </div>

               {/* Score Details */}
               <div className="mb-6">
                 <p className="text-lg text-black mb-2">
                   <span className="font-semibold">ქულა:</span> {score} / 100
                 </p>
                 <p className="text-lg text-black mb-4">
                   <span className="font-semibold">სულ კითხვა:</span> {totalQuestions}
                 </p>
                 <p className="text-lg text-black">
                   <span className="font-semibold">პასუხი:</span> {Math.round((score / 100) * totalQuestions)} / {totalQuestions}
                 </p>
               </div>

               {/* Result Message */}
               <div className="mb-8">
                 <p className="text-lg text-black font-medium">
                   {getResultMessage(score)}
                 </p>
               </div>

               {/* Action Buttons */}
               <div className="flex justify-center space-x-4">
                 <button
                   onClick={onResetTest}
                   className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                 >
                   ხელახლა ტესტი
                 </button>
                 <button
                   onClick={onClose}
                   className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
                 >
                   დახურვა
                 </button>
               </div>
             </div>
           </div>
         </div>
       </div>
     )
   }

   return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Transparent background overlay */}
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      
      {/* Modal content */}
      <div className="relative bg-white rounded-lg shadow-xl p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold z-10"
        >
          ×
        </button>
        
        {/* Modal content */}
        <div className="pr-8">
          {/* Header */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold text-black">
                {currentQuestion.subject} - მე-{currentQuestion.grade} კლასი
              </h1>
              <span className="text-lg text-black">
                კითხვა {currentQuestionIndex + 1} / {questions.length}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Question */}
          <div className="mb-8">
            {renderQuestion(currentQuestion)}
          </div>

          {/* Navigation buttons */}
          <div className="flex justify-between">
            <button
              onClick={onPreviousQuestion}
              disabled={currentQuestionIndex === 0}
              className="px-6 py-2 bg-gray-500 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
            >
              წინა
            </button>
            
            <button
              onClick={currentQuestionIndex === questions.length - 1 ? onFinishTest : onNextQuestion}
              disabled={isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'იტვირთება...' : (currentQuestionIndex === questions.length - 1 ? 'დასრულება' : 'შემდეგი')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TestModal
