import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.userType !== 'ADMIN') {
      return NextResponse.json(
        { error: 'არასაკმარისი უფლებები' },
        { status: 403 }
      );
    }

    const { answerId, score, feedback } = await request.json();

    if (!answerId || score === undefined || score === null) {
      return NextResponse.json(
        { error: 'პასუხის ID და ქულა აუცილებელია' },
        { status: 400 }
      );
    }

    // Get the answer to find the question and max points
    const answer = await prisma.studentAnswer.findUnique({
      where: { id: answerId },
      include: {
        question: true,
        student: true
      }
    });

    if (!answer) {
      return NextResponse.json(
        { error: 'პასუხი ვერ მოიძებნა' },
        { status: 404 }
      );
    }

    // Only create manual score if we have valid olympiadId that exists in database
    let manualScore = null;
    if (answer.olympiadId) {
      // Check if olympiad exists
      const olympiadExists = await prisma.olympiad.findUnique({
        where: { id: answer.olympiadId }
      });
      
      if (olympiadExists) {
        manualScore = await prisma.manualScore.create({
          data: {
            studentId: answer.studentId,
            questionId: answer.questionId,
            olympiadId: answer.olympiadId,
            roundNumber: answer.roundNumber || 1,
            scoredBy: session.user.id,
            score: score,
            maxScore: answer.question.points,
            feedback: feedback || null
          }
        });
      }
    }

    // Update the student answer with the new score
    await prisma.studentAnswer.update({
      where: { id: answerId },
      data: {
        points: score,
        isCorrect: score > 0
      }
    });

    return NextResponse.json({
      success: true,
      manualScore,
      message: manualScore 
        ? 'ქულა წარმატებით შენახულია' 
        : answer.olympiadId 
          ? 'ქულა შენახულია (მანუალური შეფასების ისტორია არ შეიქმნა - ოლიმპიადა ვერ მოიძებნა)'
          : 'ქულა შენახულია (მანუალური შეფასების ისტორია არ შეიქმნა - არ არის ოლიმპიადის ID)'
    });
  } catch (error) {
    console.error('Error creating manual score:', error);
    return NextResponse.json(
      { error: 'შეცდომა ხელით შეფასების შექმნისას' },
      { status: 500 }
    );
  }
}
