const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkOlympiads() {
  try {
    console.log('🔍 Checking all olympiad events...')

    // Get all olympiad events
    const olympiads = await prisma.olympiadEvent.findMany({
      select: {
        id: true,
        name: true,
        startDate: true,
        endDate: true,
        registrationDeadline: true,
        subjects: true,
        grades: true,
        isActive: true,
        createdByUser: {
          select: {
            name: true,
            lastname: true
          }
        }
      },
      orderBy: {
        startDate: 'asc'
      }
    })

    console.log(`📊 Found ${olympiads.length} olympiad events:`)
    console.log('=' .repeat(80))

    olympiads.forEach((olympiad, index) => {
      console.log(`${index + 1}. ${olympiad.name}`)
      console.log(`   ID: ${olympiad.id}`)
      console.log(`   Start Date: ${olympiad.startDate.toISOString()}`)
      console.log(`   End Date: ${olympiad.endDate.toISOString()}`)
      console.log(`   Registration Deadline: ${olympiad.registrationDeadline.toISOString()}`)
      console.log(`   Subjects: ${olympiad.subjects.join(', ')}`)
      console.log(`   Grades: ${olympiad.grades.join(', ')}`)
      console.log(`   Active: ${olympiad.isActive}`)
      console.log(`   Created by: ${olympiad.createdByUser?.name} ${olympiad.createdByUser?.lastname}`)
      console.log(`   Status: ${new Date() > olympiad.startDate ? 'STARTED' : 'UPCOMING'}`)
      console.log('-' .repeat(80))
    })

    // Check students
    console.log('\n👥 Checking students...')
    const students = await prisma.student.findMany({
      select: {
        id: true,
        name: true,
        lastname: true,
        grade: true,
        user: {
          select: {
            email: true
          }
        }
      }
    })

    console.log(`📊 Found ${students.length} students:`)
    students.forEach((student, index) => {
      console.log(`${index + 1}. ${student.name} ${student.lastname} (Grade ${student.grade}) - ${student.user.email}`)
    })

  } catch (error) {
    console.error('❌ Error checking olympiads:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkOlympiads()
