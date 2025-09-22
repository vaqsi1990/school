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
      'math': 'მათემატიკა',
      'physics': 'ფიზიკა',
      'chemistry': 'ქიმია',
      'biology': 'ბიოლოგია',
      'history': 'ისტორია',
      'geography': 'გეოგრაფია',
      'georgian': 'ქართული ენა',
      'english': 'ინგლისური ენა',
      'eeg': 'ერთიანი ეროვნული გამოცდები'
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

    // Fetch all available questions for the specified subject and grade
    console.log('Fetching questions for:', { subjectName, grade: parseInt(grade) })
    
    const allQuestions = await prisma.question.findMany({
      where: {
        subject: {
          name: subjectName
        },
        grade: parseInt(grade),
        status: 'ACTIVE',
        isPublic: true
      },
      include: {
        subject: true
      }
    })

    console.log('Found total questions:', allQuestions.length)

    if (allQuestions.length === 0) {
      console.log('No public questions found for this subject and grade')
      return NextResponse.json(
        { error: 'ამ საგნისა და კლასისთვის საჯარო კითხვები ჯერ არ არის დამატებული' },
        { status: 404 }
      )
    }

    // Shuffle all questions and take only 10 random ones
    const shuffledQuestions = allQuestions
      .sort(() => Math.random() - 0.5)
      .slice(0, 10) // Take only 10 random questions

    console.log('Selected random questions:', shuffledQuestions.length)

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
