const { PrismaClient } = require('@prisma/client')
const fs = require('fs')

const prisma = new PrismaClient()

// Utility function to generate correct answer from matching pairs
function generateCorrectAnswerFromPairs(matchingPairs) {
  if (!matchingPairs || !Array.isArray(matchingPairs)) {
    return '';
  }
  
  const pairs = matchingPairs
    .filter(pair => pair && pair.left && pair.right)
    .map(pair => `${pair.left}:${pair.right}`);
  
  return pairs.join(',');
}

async function addMatchingQuestions() {
  try {
    console.log('Reading sample matching questions...')
    const questionsData = JSON.parse(fs.readFileSync('sample_matching_questions.json', 'utf8'))
    
    console.log(`Found ${questionsData.length} matching questions to add`)
    
    for (const questionData of questionsData) {
      console.log(`Adding question: ${questionData.text}`)
      
      // Generate correct answer from matching pairs
      const correctAnswer = generateCorrectAnswerFromPairs(questionData.matchingPairs)
      console.log(`Generated correct answer: ${correctAnswer}`)
      
      const question = await prisma.question.create({
        data: {
          text: questionData.text,
          type: questionData.type,
          matchingPairs: questionData.matchingPairs,
          points: questionData.points,
          subject: {
            connect: { id: questionData.subjectId }
          },
          grade: questionData.grade,
          round: questionData.round,
          chapterName: questionData.chapterName,
          isAutoScored: questionData.isAutoScored,
          createdByType: 'ADMIN',
          status: 'ACTIVE',
          options: [], // Empty for matching questions
          correctAnswer: correctAnswer, // Now properly calculated from matching pairs
          image: [],
          imageOptions: []
        }
      })
      
      console.log(`✅ Created question with ID: ${question.id}`)
    }
    
    console.log('🎉 All matching questions added successfully!')
    
  } catch (error) {
    console.error('❌ Error adding matching questions:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addMatchingQuestions()
