const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function uploadData() {
  try {
    console.log('🚀 Starting data upload...')

    // Upload subjects
    console.log('📚 Uploading subjects...')
    const subjectsData = JSON.parse(fs.readFileSync(path.join(__dirname, '../ittems/subjects.json'), 'utf8'))
    
    for (const subject of subjectsData) {
      await prisma.subject.upsert({
        where: { id: subject.id },
        update: {
          name: subject.name,
          description: subject.description,
        },
        create: {
          id: subject.id,
          name: subject.name,
          description: subject.description,
        }
      })
    }
    console.log(`✅ Uploaded ${subjectsData.length} subjects`)

    // Upload users
    console.log('👥 Uploading users...')
    const usersData = JSON.parse(fs.readFileSync(path.join(__dirname, '../ittems/users.json'), 'utf8'))
    
    for (const user of usersData) {
      await prisma.user.upsert({
        where: { id: user.id },
        update: {
          email: user.email,
          password: user.password,
          userType: user.userType,
          isActive: user.isActive,
        },
        create: {
          id: user.id,
          email: user.email,
          password: user.password,
          userType: user.userType,
          isActive: user.isActive,
        }
      })
    }
    console.log(`✅ Uploaded ${usersData.length} users`)

    // Upload admins
    console.log('👨‍💼 Uploading admins...')
    const adminsData = JSON.parse(fs.readFileSync(path.join(__dirname, '../ittems/admins.json'), 'utf8'))
    
    for (const admin of adminsData) {
      await prisma.admin.upsert({
        where: { id: admin.id },
        update: {
          userId: admin.userId,
          name: admin.name,
          lastname: admin.lastname,
          role: admin.role,
          permissions: admin.permissions,
        },
        create: {
          id: admin.id,
          userId: admin.userId,
          name: admin.name,
          lastname: admin.lastname,
          role: admin.role,
          permissions: admin.permissions,
        }
      })
    }
    console.log(`✅ Uploaded ${adminsData.length} admins`)

    // Upload teachers
    console.log('👨‍🏫 Uploading teachers...')
    const teachersData = JSON.parse(fs.readFileSync(path.join(__dirname, '../ittems/teachers.json'), 'utf8'))
    
    for (const teacher of teachersData) {
      await prisma.teacher.upsert({
        where: { id: teacher.id },
        update: {
          userId: teacher.userId,
          name: teacher.name,
          lastname: teacher.lastname,
          subject: teacher.subject,
          school: teacher.school,
          phone: teacher.phone,
          isVerified: teacher.isVerified,
          canReviewAnswers: teacher.canReviewAnswers,
        },
        create: {
          id: teacher.id,
          userId: teacher.userId,
          name: teacher.name,
          lastname: teacher.lastname,
          subject: teacher.subject,
          school: teacher.school,
          phone: teacher.phone,
          isVerified: teacher.isVerified,
          canReviewAnswers: teacher.canReviewAnswers,
        }
      })
    }
    console.log(`✅ Uploaded ${teachersData.length} teachers`)

    // Upload students
    console.log('🎓 Uploading students...')
    const studentsData = JSON.parse(fs.readFileSync(path.join(__dirname, '../ittems/students.json'), 'utf8'))
    
    for (const student of studentsData) {
      await prisma.student.upsert({
        where: { id: student.id },
        update: {
          userId: student.userId,
          name: student.name,
          lastname: student.lastname,
          grade: student.grade,
          school: student.school,
          phone: student.phone,
          code: student.code,
        },
        create: {
          id: student.id,
          userId: student.userId,
          name: student.name,
          lastname: student.lastname,
          grade: student.grade,
          school: student.school,
          phone: student.phone,
          code: student.code,
        }
      })
    }
    console.log(`✅ Uploaded ${studentsData.length} students`)

    // Upload questions
    console.log('❓ Uploading questions...')
    const questionsData = JSON.parse(fs.readFileSync(path.join(__dirname, '../ittems/questions.json'), 'utf8'))
    
    for (const question of questionsData) {
      await prisma.question.upsert({
        where: { id: question.id },
        update: {
          text: question.text,
          type: question.type,
          options: question.options || [],
          imageOptions: question.imageOptions || [],
          correctAnswer: question.correctAnswer,
          points: question.points,
          maxPoints: question.maxPoints,
          image: question.image ? [question.image] : [],
          content: question.content,
          matchingPairs: question.matchingPairs,
          subjectId: question.subjectId,
          chapterId: question.chapterId,
          paragraphId: question.paragraphId,
          chapterName: question.chapterName,
          paragraphName: question.paragraphName,
          grade: question.grade,
          round: question.round,
          createdBy: question.createdBy,
          createdByType: question.createdByType,
          status: question.status,
          isAutoScored: question.isAutoScored,
          isReported: question.isReported,
          reportReason: question.reportReason,
          reportedAt: question.reportedAt,
          reportedBy: question.reportedBy,
        },
        create: {
          id: question.id,
          text: question.text,
          type: question.type,
          options: question.options || [],
          imageOptions: question.imageOptions || [],
          correctAnswer: question.correctAnswer,
          points: question.points,
          maxPoints: question.maxPoints,
          image: question.image ? [question.image] : [],
          content: question.content,
          matchingPairs: question.matchingPairs,
          subjectId: question.subjectId,
          chapterId: question.chapterId,
          paragraphId: question.paragraphId,
          chapterName: question.chapterName,
          paragraphName: question.paragraphName,
          grade: question.grade,
          round: question.round,
          createdBy: question.createdBy,
          createdByType: question.createdByType,
          status: question.status,
          isAutoScored: question.isAutoScored,
          isReported: question.isReported,
          reportReason: question.reportReason,
          reportedAt: question.reportedAt,
          reportedBy: question.reportedBy,
        }
      })
    }
    console.log(`✅ Uploaded ${questionsData.length} questions`)

    console.log('🎉 All data uploaded successfully!')

  } catch (error) {
    console.error('❌ Error uploading data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

uploadData()
