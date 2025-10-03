import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Get single olympiad
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.userType !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resolvedParams = await params
    const olympiad = await prisma.olympiadEvent.findUnique({
      where: { id: resolvedParams.id },
      include: {
        packages: true,
        createdByUser: {
          select: {
            name: true,
            lastname: true,
            user: {
              select: {
                email: true
              }
            }
          }
        },
        _count: {
          select: {
            participations: true
          }
        }
      }
    })

    if (!olympiad) {
      return NextResponse.json({ error: 'Olympiad not found' }, { status: 404 })
    }

    return NextResponse.json({ olympiad })
  } catch (error) {
    console.error('Error fetching olympiad:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update olympiad
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.userType !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resolvedParams = await params
    const body = await request.json()
    const {
      name,
      description,
      startDate,
      endDate,
      registrationDeadline,
      maxParticipants,
      isActive,
      subjects,
      grades,
      rounds,
      duration,
      packages,
      questionTypes,
      questionTypeQuantities,
      minimumPointsThreshold,
      curriculumId
    } = body

    // Validate required fields
    if (!name || !description || !startDate || !endDate || !registrationDeadline) {
      return NextResponse.json(
        { error: 'ყველა სავალდებულო ველი უნდა იყოს შევსებული' },
        { status: 400 }
      )
    }

    // Check if olympiad exists
    const existingOlympiad = await prisma.olympiadEvent.findUnique({
      where: { id: resolvedParams.id }
    })

    if (!existingOlympiad) {
      return NextResponse.json({ error: 'Olympiad not found' }, { status: 404 })
    }

    // Update olympiad
    const updatedOlympiad = await prisma.olympiadEvent.update({
      where: { id: resolvedParams.id },
      data: {
        name,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        registrationDeadline: new Date(registrationDeadline),
        maxParticipants: 999999, // Set to a very high number to effectively remove limit
        isActive,
        rounds: parseInt(rounds),
        duration: parseFloat(duration),
        subjects: subjects,
        grades: grades.map((grade: string | number) => parseInt(grade.toString())),
        questionTypes: questionTypes,
        questionTypeQuantities: questionTypeQuantities || null,
        minimumPointsThreshold: minimumPointsThreshold ? parseInt(minimumPointsThreshold) : null,
        packages: {
          set: [], // Clear existing connections
          connect: packages.map((pkgId: string) => ({ id: pkgId }))
        },
        ...(curriculumId && { curriculumId })
      },
      include: {
        packages: true,
        createdByUser: {
          select: {
            name: true,
            lastname: true
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Olympiad updated successfully',
      olympiad: updatedOlympiad
    })
  } catch (error) {
    console.error('Error updating olympiad:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Delete olympiad
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.userType !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resolvedParams = await params
    // Check if olympiad exists and get participants
    const existingOlympiad = await prisma.olympiadEvent.findUnique({
      where: { id: resolvedParams.id },
      include: {
        participations: {
          include: {
            student: {
              select: {
                userId: true
              }
            }
          }
        }
      }
    })

    if (!existingOlympiad) {
      return NextResponse.json({ error: 'Olympiad not found' }, { status: 404 })
    }

    // Before deleting the olympiad, remove the subjects from students' selected subjects
    // This allows students to re-register for new olympiads with these subjects
    if (existingOlympiad.participations.length > 0) {
      try {
        for (const participation of existingOlympiad.participations) {
          for (const subjectName of existingOlympiad.subjects) {
            // Find the subject by name
            const subject = await prisma.subject.findFirst({
              where: { name: subjectName }
            })
            
            if (subject) {
              // Remove the subject from student's selected subjects
              await prisma.studentSubjectSelection.deleteMany({
                where: {
                  userId: participation.student.userId,
                  subjectId: subject.id
                }
              })
              
              console.log(`Removed subject "${subjectName}" from student ${participation.studentId} after olympiad deletion`)
            }
          }
        }
      } catch (subjectRemovalError) {
        console.error('Error removing subjects from student selections:', subjectRemovalError)
        // Continue with deletion even if subject removal fails
      }
    }

    // Delete olympiad - Prisma cascade will handle:
    // - participations (StudentOlympiadEvent)
    // - appeals (Appeal)
    // - question package associations
    await prisma.olympiadEvent.delete({
      where: { id: resolvedParams.id }
    })

    return NextResponse.json({
      message: 'Olympiad deleted successfully',
      participantsAffected: existingOlympiad.participations.length
    })
  } catch (error) {
    console.error('Error deleting olympiad:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
