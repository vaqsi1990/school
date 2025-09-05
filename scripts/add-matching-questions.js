const { PrismaClient } = require('@prisma/client')
const fs = require('fs')

const prisma = new PrismaClient()

async function addMatchingQuestions() {
  try {
    console.log('Reading sample matching questions...')
    const questionsData = JSON.parse(fs.readFileSync('sample_matching_questions.json', 'utf8'))
    
    console.log(`Found ${questionsData.length} matching questions to add`)
    
    for (const questionData of questionsData) {
      console.log(`Adding question: ${questionData.text}`)
      
      const question = await prisma.question.create({
        data: {
          text: questionData.text,
          type: questionData.type,
          matchingPairs: questionData.matchingPairs,
          points: questionData.points,
          subjectId: questionData.subjectId,
          grade: questionData.grade,
          round: questionData.round,
          chapterName: questionData.chapterName,
          isAutoScored: questionData.isAutoScored,
          createdByType: 'ADMIN',
          status: 'ACTIVE',
          options: [], // Empty for matching questions
          correctAnswer: null, // Will be calculated from matching pairs
          image: null,
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
