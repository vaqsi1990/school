const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function countMatchingQuestions() {
  try {
    const count = await prisma.question.count({
      where: { type: 'MATCHING' }
    })
    
    console.log(`MATCHING questions count: ${count}`)
    
    // Also get a sample to see the structure
    const sample = await prisma.question.findFirst({
      where: { type: 'MATCHING' },
      include: { subject: true }
    })
    
    if (sample) {
      console.log('\nSample MATCHING question:')
      console.log('ID:', sample.id)
      console.log('Text:', sample.text)
      console.log('Matching pairs:', JSON.stringify(sample.matchingPairs, null, 2))
      console.log('Subject:', sample.subject.name)
    }
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

countMatchingQuestions()
