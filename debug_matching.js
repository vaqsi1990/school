const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function debugMatchingQuestions() {
  try {
    console.log('=== MATCHING QUESTIONS IN DATABASE ===')
    const questions = await prisma.question.findMany({
      where: { type: 'MATCHING' },
      select: {
        id: true,
        text: true,
        correctAnswer: true,
        matchingPairs: true,
        leftSide: true,
        rightSide: true
      }
    })
    
    questions.forEach((q, i) => {
      console.log(`\nQuestion ${i+1}:`)
      console.log(`ID: ${q.id}`)
      console.log(`Text: ${q.text}`)
      console.log(`correctAnswer: ${q.correctAnswer}`)
      console.log(`matchingPairs: ${JSON.stringify(q.matchingPairs)}`)
      console.log(`leftSide: ${JSON.stringify(q.leftSide)}`)
      console.log(`rightSide: ${JSON.stringify(q.rightSide)}`)
    })
    
    console.log(`\nTotal matching questions: ${questions.length}`)
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugMatchingQuestions()
