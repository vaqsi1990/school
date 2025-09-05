const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testStudentAPI() {
  try {
    console.log('🔍 Testing student API logic...')

    // Simulate student with grade 8
    const student = await prisma.student.findFirst({
      where: { grade: 8 },
      select: { id: true, grade: true, name: true, lastname: true }
    })

    if (!student) {
      console.log('❌ No student found')
      return
    }

    console.log(`👤 Student: ${student.name} ${student.lastname} (Grade ${student.grade})`)

    // Test the exact same query as the API
    const olympiads = await prisma.olympiadEvent.findMany({
      where: {
        grades: {
          has: student.grade
        },
        isActive: true
      },
      select: {
        id: true,
        name: true,
        description: true,
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
      const isRegistrationOpen = now <= olympiad.registrationDeadline
      const hasStarted = now >= olympiad.startDate
      const hasEnded = now >= olympiad.endDate
      
      let status = 'upcoming'
      if (hasEnded) {
        status = 'completed'
      } else if (hasStarted) {
        status = 'upcoming' // Active olympiad
      }
      
      console.log(`\n${index + 1}. ${olympiad.name}`)
      console.log(`   ID: ${olympiad.id}`)
      console.log(`   Start Date: ${olympiad.startDate.toISOString()}`)
      console.log(`   End Date: ${olympiad.endDate.toISOString()}`)
      console.log(`   Registration Deadline: ${olympiad.registrationDeadline.toISOString()}`)
      console.log(`   Is Registration Open: ${isRegistrationOpen}`)
      console.log(`   Has Started: ${hasStarted}`)
      console.log(`   Has Ended: ${hasEnded}`)
      console.log(`   Status: ${status}`)
      console.log(`   Active: ${olympiad.isActive}`)
      console.log(`   Subjects: ${olympiad.subjects.join(', ')}`)
      console.log(`   Grades: ${olympiad.grades.join(', ')}`)
    })

    // Check student registrations
    const studentRegistrations = await prisma.studentOlympiadEvent.findMany({
      where: {
        studentId: student.id,
        olympiadEventId: {
          in: olympiads.map(o => o.id)
        }
      },
      select: {
        olympiadEventId: true,
        status: true
      }
    })

    console.log(`\n📝 Student registrations: ${studentRegistrations.length}`)
    studentRegistrations.forEach((reg, index) => {
      const olympiad = olympiads.find(o => o.id === reg.olympiadEventId)
      console.log(`${index + 1}. ${olympiad?.name} - Status: ${reg.status}`)
    })

  } catch (error) {
    console.error('❌ Error testing student API:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testStudentAPI()
