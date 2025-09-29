import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    console.log('=== Manual Score API Called ===');
    
    const session = await getServerSession(authOptions);
    console.log('Session:', session?.user);
    
    if (!session?.user || session.user.userType !== 'ADMIN') {
      console.log('Unauthorized access attempt');
      return NextResponse.json(
        { error: 'არასაკმარისი უფლებები' },
        { status: 403 }
      );
    }

    const { answerId, score, feedback } = await request.json();
    console.log('Request data:', { answerId, score, feedback });

    if (!answerId || score === undefined || score === null) {
      console.log('Missing required fields');
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

    console.log('Found answer:', answer);

    if (!answer) {
      console.log('Answer not found');
      return NextResponse.json(
        { error: 'პასუხი ვერ მოიძებნა' },
        { status: 404 }
      );
    }

    // Only create manual score if we have valid olympiadId that exists in database
    let manualScore = null;
    console.log('Answer olympiadId:', answer.olympiadId);
    
    if (answer.olympiadId) {
      // Check if olympiad exists
      const olympiadExists = await prisma.olympiad.findUnique({
        where: { id: answer.olympiadId }
      });
      
      console.log('Olympiad exists:', !!olympiadExists);
      
      if (olympiadExists) {
        console.log('Creating manual score...');
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
        console.log('Manual score created:', manualScore);
      } else {
        console.log('Olympiad does not exist, skipping manual score creation');
      }
    } else {
      console.log('No olympiadId, skipping manual score creation');
    }

    // Update the student answer with the new score
    console.log('Updating student answer with new score...');
    const updatedAnswer = await prisma.studentAnswer.update({
      where: { id: answerId },
      data: {
        points: score,
        isCorrect: score > 0
      }
    });
    console.log('Student answer updated:', updatedAnswer);

    // Declare variables outside the if block
    let existingEvent = null;
    let newTotalScore = 0;

    // Update the total score in StudentOlympiadEvent if this is an olympiad answer
    if (answer.olympiadId) {
      console.log('Updating total score for olympiad:', answer.olympiadId);
      console.log('Student ID:', answer.studentId);
      console.log('New score for answer:', score);
      
      // Get all answers for this student in this olympiad
      const allAnswers = await prisma.studentAnswer.findMany({
        where: {
          studentId: answer.studentId,
          olympiadId: answer.olympiadId
        }
      });

      console.log('All answers found:', allAnswers.length);

      // Calculate new total score
      newTotalScore = allAnswers.reduce((total, ans) => {
        // Use the updated score for the current answer, or existing score for others
        const answerScore = ans.id === answerId ? score : (ans.points || 0);
        console.log(`Answer ${ans.id}: ${answerScore} points`);
        return total + answerScore;
      }, 0);

      console.log('New total score:', newTotalScore);

      // Check if StudentOlympiadEvent exists
      existingEvent = await prisma.studentOlympiadEvent.findFirst({
        where: {
          studentId: answer.studentId,
          olympiadEventId: answer.olympiadId
        },
        include: {
          olympiadEvent: true
        }
      });

      console.log('Existing StudentOlympiadEvent:', existingEvent);

      // Update the StudentOlympiadEvent total score
      const updateResult = await prisma.studentOlympiadEvent.updateMany({
        where: {
          studentId: answer.studentId,
          olympiadEventId: answer.olympiadId
        },
        data: {
          totalScore: newTotalScore
        }
      });

      console.log('Update result:', updateResult);

      // Check if student should progress to next stage based on minimum threshold
      if (existingEvent && existingEvent.olympiadEvent) {
        console.log('Checking stage progression...');
        console.log('Current round:', existingEvent.currentRound);
        console.log('Olympiad rounds:', existingEvent.olympiadEvent.rounds);
        console.log('Minimum threshold:', existingEvent.olympiadEvent.minimumPointsThreshold);
        console.log('New total score:', newTotalScore);

        // Check if student meets minimum threshold and can progress
        if (existingEvent.olympiadEvent.minimumPointsThreshold && 
            newTotalScore >= existingEvent.olympiadEvent.minimumPointsThreshold &&
            existingEvent.currentRound < existingEvent.olympiadEvent.rounds) {
          
          console.log('Student meets threshold, progressing to next round...');
          
          // Update current round to next stage
          const nextRound = existingEvent.currentRound + 1;
          await prisma.studentOlympiadEvent.updateMany({
            where: {
              studentId: answer.studentId,
              olympiadEventId: answer.olympiadId
            },
            data: {
              currentRound: nextRound
            }
          });

          console.log(`Student progressed to round ${nextRound}`);
        } else if (existingEvent.olympiadEvent.minimumPointsThreshold && 
                   newTotalScore < existingEvent.olympiadEvent.minimumPointsThreshold) {
          console.log('Student did not meet minimum threshold for progression');
        } else if (existingEvent.currentRound >= existingEvent.olympiadEvent.rounds) {
          console.log('Student has already reached the final round');
        }
      }
    }

    console.log('=== Manual Score API Success ===');
    
    // Check if student progressed to next stage
    let progressionMessage = '';
    if (existingEvent && existingEvent.olympiadEvent && 
        existingEvent.olympiadEvent.minimumPointsThreshold && 
        newTotalScore >= existingEvent.olympiadEvent.minimumPointsThreshold &&
        existingEvent.currentRound < existingEvent.olympiadEvent.rounds) {
      progressionMessage = ` მოსწავლე გადავიდა ${existingEvent.currentRound + 1} ეტაპზე.`;
    }
    
    return NextResponse.json({
      success: true,
      manualScore,
      message: (manualScore 
        ? 'ქულა წარმატებით შენახულია' 
        : answer.olympiadId 
          ? 'ქულა შენახულია (მანუალური შეფასების ისტორია არ შეიქმნა - ოლიმპიადა ვერ მოიძებნა)'
          : 'ქულა შენახულია (მანუალური შეფასების ისტორია არ შეიქმნა - არ არის ოლიმპიადის ID)') + progressionMessage
    });
  } catch (error) {
    console.error('=== Manual Score API Error ===');
    console.error('Error creating manual score:', error);
    return NextResponse.json(
      { error: 'შეცდომა ხელით შეფასების შექმნისას' },
      { status: 500 }
    );
  }
}
