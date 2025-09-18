import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    console.log('=== Public Questions API Called ===')
    const { searchParams } = new URL(request.url)
    const subjectId = searchParams.get('subjectId')
    const grade = searchParams.get('grade')

    console.log('Request params:', { subjectId, grade })

    if (!subjectId || !grade) {
      console.log('Missing parameters')
      return NextResponse.json(
        { error: 'საგანი და კლასი აუცილებელია' },
        { status: 400 }
      )
    }

    // Map predefined subject IDs to actual subject names
    const subjectMapping: Record<string, string> = {
      'history': 'ისტორია',
      'geography': 'გეოგრაფია', 
      'georgian': 'ქართული ენა',
      'biology': 'ბიოლოგია'
    }

    const subjectName = subjectMapping[subjectId]
    console.log('Subject mapping:', { subjectId, subjectName })
    
    if (!subjectName) {
      console.log('Invalid subject ID')
      return NextResponse.json(
        { error: 'არასწორი საგანი' },
        { status: 400 }
      )
    }

    // Fetch questions for the specified subject and grade
    console.log('Fetching questions for:', { subjectName, grade: parseInt(grade) })
    
    const questions = await prisma.question.findMany({
      where: {
        subject: {
          name: subjectName
        },
        grade: parseInt(grade),
        status: 'ACTIVE'
        // Temporarily remove isPublic filter to test
      },
      include: {
        subject: true
      },
      take: 10 // Limit to 10 questions for public test
    })

    console.log('Found questions:', questions.length)

    // Shuffle questions
    const shuffledQuestions = questions.sort(() => Math.random() - 0.5)

    // Format questions for frontend (include correct answers for scoring)
    const formattedQuestions = shuffledQuestions.map(question => ({
      id: question.id,
      text: question.text,
      type: question.type,
      options: question.options,
      correctAnswer: question.correctAnswer, // Include for scoring
      points: question.points,
      image: question.image,
      content: question.content,
      matchingPairs: question.matchingPairs,
      leftSide: question.leftSide,
      rightSide: question.rightSide,
      imageOptions: question.imageOptions,
      subject: question.subject?.name || subjectName,
      grade: question.grade
    }))

    console.log('Returning questions:', formattedQuestions.length)
    
    return NextResponse.json({ 
      questions: formattedQuestions,
      totalQuestions: formattedQuestions.length 
    })
  } catch (error) {
    console.error('Error fetching public test questions:', error)
    console.error('Error details:', error)
    return NextResponse.json(
      { error: `სერვერის შეცდომა: ${error instanceof Error ? error.message : 'უცნობი შეცდომა'}` },
      { status: 500 }
    )
  }
}
