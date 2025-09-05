const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkAllOlympiads() {
  try {
    console.log('🔍 Checking ALL olympiad events in database...')

    // Get ALL olympiad events without any filters
    const allOlympiads = await prisma.olympiadEvent.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        startDate: true,
        endDate: true,
        registrationDeadline: true,
        subjects: true,
        grades: true,
        isActive: true,
        createdAt: true,
        createdByUser: {
          select: {
            name: true,
            lastname: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc' // Show newest first
      }
    })

    console.log(`📊 Found ${allOlympiads.length} olympiad events in total:`)
    console.log('=' .repeat(100))

    allOlympiads.forEach((olympiad, index) => {
      const now = new Date()
      const isRegistrationOpen = now <= olympiad.registrationDeadline
      const hasStarted = now >= olympiad.startDate
      const hasEnded = now >= olympiad.endDate
      
      console.log(`\n${index + 1}. ${olympiad.name}`)
      console.log(`   ID: ${olympiad.id}`)
      console.log(`   Created: ${olympiad.createdAt.toISOString()}`)
      console.log(`   Start Date: ${olympiad.startDate.toISOString()}`)
      console.log(`   End Date: ${olympiad.endDate.toISOString()}`)
      console.log(`   Registration Deadline: ${olympiad.registrationDeadline.toISOString()}`)
      console.log(`   Is Registration Open: ${isRegistrationOpen}`)
      console.log(`   Has Started: ${hasStarted}`)
      console.log(`   Has Ended: ${hasEnded}`)
      console.log(`   Active: ${olympiad.isActive}`)
      console.log(`   Subjects: ${olympiad.subjects.join(', ')}`)
      console.log(`   Grades: ${olympiad.grades.join(', ')}`)
      console.log(`   Created by: ${olympiad.createdByUser?.name} ${olympiad.createdByUser?.lastname}`)
      console.log('-' .repeat(100))
    })

    // Check if there are any inactive olympiads
    const inactiveOlympiads = allOlympiads.filter(o => !o.isActive)
    if (inactiveOlympiads.length > 0) {
      console.log(`\n⚠️  Found ${inactiveOlympiads.length} inactive olympiads:`)
      inactiveOlympiads.forEach(olympiad => {
        console.log(`   - ${olympiad.name} (ID: ${olympiad.id})`)
      })
    }

  } catch (error) {
    console.error('❌ Error checking all olympiads:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkAllOlympiads()
