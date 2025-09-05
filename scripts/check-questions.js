const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkQuestions() {
  try {
    console.log('🔍 Checking questions in database...');
    
    const questions = await prisma.question.findMany({
      take: 10,
      include: {
        questionPackages: {
          include: {
            questionPackage: true
          }
        }
      }
    });
    
    console.log(`📊 Found ${questions.length} questions:`);
    console.log('====================================================================================================');
    
    questions.forEach((q, i) => {
      console.log(`${i+1}. ${q.question}`);
      console.log(`   ID: ${q.id}`);
      console.log(`   Type: ${q.type}`);
      console.log(`   Points: ${q.points}`);
      console.log(`   Packages: ${q.questionPackages.length}`);
      if (q.questionPackages.length > 0) {
        console.log(`   Package Names: ${q.questionPackages.map(qp => qp.questionPackage.name).join(', ')}`);
      }
      console.log('---');
    });
    
    // Check question packages
    console.log('\n🔍 Checking question packages...');
    const packages = await prisma.questionPackage.findMany({
      include: {
        questions: {
          include: {
            question: true
          }
        }
      }
    });
    
    console.log(`📊 Found ${packages.length} question packages:`);
    packages.forEach((pkg, i) => {
      console.log(`${i+1}. ${pkg.name}`);
      console.log(`   Questions: ${pkg.questions.length}`);
      console.log('---');
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkQuestions();
