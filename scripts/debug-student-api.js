const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function debugStudentAPI() {
  try {
    console.log('🔍 Debugging student API...')
    console.log('Current date:', new Date().toISOString())
    console.log('Current date (local):', new Date().toLocaleString())

    // Get student data
    const student = await prisma.student.findFirst({
      where: { grade: 8 }, // Use grade 8 student
      select: { id: true, grade: true, name: true, lastname: true }
    })

    if (!student) {
      console.log('❌ No student found')
      return
    }

    console.log(`\n👤 Student: ${student.name} ${student.lastname} (Grade ${student.grade})`)

    // Check what olympiads match the student's grade
    const olympiads = await prisma.olympiadEvent.findMany({
      where: {
        grades: {
          has: student.grade
        }
      },
      select: {
        id: true,
        name: true,
        startDate: true,
        endDate: true,
        registrationDeadline: true,
        subjects: true,
        grades: true,
        isActive: true
      },
      orderBy: {
        startDate: 'asc'
      }
    })

    console.log(`\n📊 Found ${olympiads.length} olympiads for grade ${student.grade}:`)
    
    olympiads.forEach((olympiad, index) => {
      const now = new Date()
      const isUpcoming = olympiad.startDate >= now
      const isRegistrationOpen = now <= olympiad.registrationDeadline
      
      console.log(`\n${index + 1}. ${olympiad.name}`)
      console.log(`   Start Date: ${olympiad.startDate.toISOString()}`)
      console.log(`   End Date: ${olympiad.endDate.toISOString()}`)
      console.log(`   Registration Deadline: ${olympiad.registrationDeadline.toISOString()}`)
      console.log(`   Is Upcoming: ${isUpcoming}`)
      console.log(`   Registration Open: ${isRegistrationOpen}`)
      console.log(`   Active: ${olympiad.isActive}`)
      console.log(`   Subjects: ${olympiad.subjects.join(', ')}`)
      console.log(`   Grades: ${olympiad.grades.join(', ')}`)
    })

    // Now check with the same filter as the API
    const filteredOlympiads = await prisma.olympiadEvent.findMany({
      where: {
        grades: {
          has: student.grade
        },
        startDate: {
          gte: new Date()
        }
      },
      select: {
        id: true,
        name: true,
        startDate: true,
        endDate: true,
        registrationDeadline: true,
        subjects: true,
        grades: true,
        isActive: true
      },
      orderBy: {
        startDate: 'asc'
      }
    })

    console.log(`\n🎯 After filtering (startDate >= now): ${filteredOlympiads.length} olympiads`)
    filteredOlympiads.forEach((olympiad, index) => {
      console.log(`${index + 1}. ${olympiad.name} (${olympiad.startDate.toISOString()})`)
    })

  } catch (error) {
    console.error('❌ Error debugging student API:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugStudentAPI()
