const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugAPI() {
  try {
    console.log('🔍 Debugging API...');
    
    const olympiad = await prisma.olympiadEvent.findUnique({
      where: { id: 'cmf6ses6y0001jgsghqmvvmtw' },
      include: {
        packages: {
          include: {
            questions: {
              include: {
                question: true
              }
            }
          }
        }
      }
    });
    
    if (olympiad) {
      console.log('📊 Olympiad found:', olympiad.name);
      console.log('📊 Packages:', olympiad.packages.length);
      
      olympiad.packages.forEach((pkg, i) => {
        console.log(`Package ${i+1}: ${pkg.name}`);
        console.log(`Questions: ${pkg.questions.length}`);
        
        pkg.questions.forEach((qp, j) => {
          console.log(`  Question ${j+1}:`);
          console.log(`    ID: ${qp.questionId}`);
          console.log(`    Question object:`, qp.question);
          console.log(`    Text: ${qp.question?.text}`);
          console.log(`    Type: ${qp.question?.type}`);
          console.log('---');
        });
      });
    } else {
      console.log('❌ Olympiad not found');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugAPI();
