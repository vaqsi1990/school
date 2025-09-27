import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.userType !== 'ADMIN') {
      return NextResponse.json(
        { error: 'არასაკმარისი უფლებები' },
        { status: 403 }
      );
    }

    const resolvedParams = await params;
    const olympiadId = resolvedParams.id;

    // Get olympiad with all questions from packages
    const olympiad = await prisma.olympiadEvent.findUnique({
      where: { id: olympiadId },
      include: {
        packages: {
          include: {
            questions: {
              include: {
                question: {
                  include: {
                    subject: true
                  }
                }
              },
              orderBy: {
                order: 'asc'
              }
            }
          }
        }
      }
    });

    if (!olympiad) {
      return NextResponse.json(
        { error: 'ოლიმპიადა ვერ მოიძებნა' },
        { status: 404 }
      );
    }

    // Extract all questions from packages
    const allQuestions = olympiad.packages.flatMap(pkg => 
      pkg.questions.map(qp => ({
        id: qp.question.id,
        text: qp.question.text,
        type: qp.question.type,
        options: qp.question.options,
        correctAnswer: qp.question.correctAnswer,
        points: qp.question.points,
        image: qp.question.image,
        imageOptions: qp.question.imageOptions,
        matchingPairs: qp.question.matchingPairs,
        leftSide: qp.question.leftSide,
        rightSide: qp.question.rightSide,
        content: qp.question.content,
        answerTemplate: qp.question.answerTemplate,
        rubric: qp.question.rubric,
        subject: qp.question.subject,
        grade: qp.question.grade,
        order: qp.order,
        packageName: pkg.name
      }))
    );

    // Sort questions by package and order
    const sortedQuestions = allQuestions.sort((a, b) => {
      if (a.packageName !== b.packageName) {
        return a.packageName.localeCompare(b.packageName);
      }
      return a.order - b.order;
    });

    return NextResponse.json({
      olympiad: {
        id: olympiad.id,
        name: olympiad.name,
        description: olympiad.description,
        startDate: olympiad.startDate,
        endDate: olympiad.endDate,
        subjects: olympiad.subjects,
        grades: olympiad.grades
      },
      questions: sortedQuestions
    });
  } catch (error) {
    console.error('Error fetching olympiad test content:', error);
    return NextResponse.json(
      { error: 'შეცდომა ტესტის კონტენტის ჩატვირთვისას' },
      { status: 500 }
    );
  }
}
