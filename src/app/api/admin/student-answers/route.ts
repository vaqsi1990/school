import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.userType !== 'ADMIN') {
      return NextResponse.json(
        { error: 'არასაკმარისი უფლებები' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const olympiadId = searchParams.get('olympiadId');

    if (!olympiadId) {
      return NextResponse.json(
        { error: 'ოლიმპიადის ID აუცილებელია' },
        { status: 400 }
      );
    }

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
        const manualScores = await prisma.manualScore.findMany({
          where: {
            studentId: answer.studentId,
            questionId: answer.questionId,
            olympiadId: answer.olympiadId!,
            roundNumber: answer.roundNumber!
          },
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

    return NextResponse.json(answersWithManualScores);
  } catch (error) {
    console.error('Error fetching student answers:', error);
    return NextResponse.json(
      { error: 'შეცდომა მოსწავლეთა პასუხების ჩატვირთვისას' },
      { status: 500 }
    );
  }
}