import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  console.log('=== Student answers API called ===');
  try {
    const session = await getServerSession(authOptions);
    console.log('Session user type:', session?.user?.userType);
    console.log('Session user ID:', session?.user?.id);
    
    if (!session?.user) {
      console.log('No session found');
      return NextResponse.json(
        { error: 'ავტორიზაცია საჭიროა' },
        { status: 401 }
      );
    }
    
    if (session.user.userType !== 'ADMIN') {
      console.log('User is not admin:', session.user.userType);
      return NextResponse.json(
        { error: 'არასაკმარისი უფლებები' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const olympiadId = searchParams.get('olympiadId');
    console.log('Requested olympiadId:', olympiadId);

    if (!olympiadId) {
      console.log('No olympiadId provided');
      return NextResponse.json(
        { error: 'ოლიმპიადის ID აუცილებელია' },
        { status: 400 }
      );
    }

    // First, let's check if there are any answers at all
    const allAnswers = await prisma.studentAnswer.findMany({
      take: 5,
      include: {
        question: {
          include: {
            subject: true
          }
        },
        student: true
      }
    });
    
 
    


    const answers = await prisma.studentAnswer.findMany({
      where: {
        olympiadId: olympiadId
      },
      include: {
        question: {
          include: {
            subject: true
          }
        },
        student: true
      },
      orderBy: [
        { student: { name: 'asc' } },
        { answeredAt: 'desc' }
      ]
    });
    
   

    // Fetch manual scores separately
    const answersWithManualScores = await Promise.all(
      answers.map(async (answer) => {
        // Build where clause conditionally to handle null values
        const whereClause: any = {
          studentId: answer.studentId,
          questionId: answer.questionId
        };
        
        if (answer.olympiadId) {
          whereClause.olympiadId = answer.olympiadId;
        }
        
        if (answer.roundNumber !== null && answer.roundNumber !== undefined) {
          whereClause.roundNumber = answer.roundNumber;
        }

        const manualScores = await prisma.manualScore.findMany({
          where: whereClause,
          include: {
            scorer: true
          },
          orderBy: {
            scoredAt: 'desc'
          }
        });

        return {
          ...answer,
          manualScores
        };
      })
    );

    console.log('=== Returning answers ===');
    console.log('Answers count:', answersWithManualScores.length);
    return NextResponse.json(answersWithManualScores);
  } catch (error) {
    console.error('=== ERROR in student answers API ===');
    console.error('Error type:', typeof error);
    console.error('Error message:', error instanceof Error ? error.message : 'No message');
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('Full error object:', error);
    
    return NextResponse.json(
      { 
        error: 'შეცდომა მოსწავლეთა პასუხების ჩატვირთვისას', 
        details: error instanceof Error ? error.message : 'Unknown error',
        type: typeof error
      },
      { status: 500 }
    );
  }
}