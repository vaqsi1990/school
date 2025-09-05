const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkQuestionFields() {
  try {
    console.log('🔍 Checking question fields...');
    
    const question = await prisma.question.findFirst({
      include: {
        questionPackages: {
          include: {
            questionPackage: true
          }
        }
      }
    });
    
    if (question) {
      console.log('📊 Question fields:');
      console.log('ID:', question.id);
      console.log('Question:', question.question);
      console.log('Type:', question.type);
      console.log('Points:', question.points);
      console.log('Options:', question.options);
      console.log('Correct Answer:', question.correctAnswer);
      console.log('Image:', question.image);
      console.log('Image Options:', question.imageOptions);
      console.log('Grade:', question.grade);
      console.log('Round:', question.round);
      console.log('Status:', question.status);
      console.log('Created By:', question.createdBy);
      console.log('Packages:', question.questionPackages.length);
    } else {
      console.log('❌ No questions found');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkQuestionFields();
