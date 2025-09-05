const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkQuestionSchema() {
  try {
    console.log('🔍 Checking question schema...');
    
    const question = await prisma.question.findFirst();
    
    if (question) {
      console.log('📊 Question object keys:');
      console.log(Object.keys(question));
      console.log('\n📊 Question values:');
      Object.keys(question).forEach(key => {
        console.log(`${key}: ${question[key]}`);
      });
    } else {
      console.log('❌ No questions found');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkQuestionSchema();
