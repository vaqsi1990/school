import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check if user is authenticated and is admin
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.userType !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: packageId } = await params
    const { questionOrders } = await request.json()

    // Validate input
    if (!questionOrders || !Array.isArray(questionOrders)) {
      return NextResponse.json(
        { error: 'Invalid question orders data' },
        { status: 400 }
      )
    }

    // Verify that the package exists
    const questionPackage = await prisma.questionPackage.findUnique({
      where: { id: packageId },
      include: {
        questions: true
      }
    })

    if (!questionPackage) {
      return NextResponse.json(
        { error: 'Question package not found' },
        { status: 404 }
      )
    }

    // Validate that all question IDs belong to this package
    const packageQuestionIds = questionPackage.questions.map(q => q.id)
    const providedQuestionIds = questionOrders.map((q: { id: string; order: number }) => q.id)
    
    const allQuestionsExist = providedQuestionIds.every((id: string) => 
      packageQuestionIds.includes(id)
    )
    
    if (!allQuestionsExist) {
      return NextResponse.json(
        { error: 'Some questions do not belong to this package' },
        { status: 400 }
      )
    }

    // Update question orders
    const updatePromises = questionOrders.map((questionOrder: { id: string; order: number }) =>
      prisma.questionPackageQuestion.update({
        where: { id: questionOrder.id },
        data: { order: questionOrder.order }
      })
    )

    await Promise.all(updatePromises)

    return NextResponse.json({ 
      message: 'Question order updated successfully' 
    })
  } catch (error) {
    console.error('Error updating question order:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
