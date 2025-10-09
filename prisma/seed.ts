import { PrismaClient } from "@prisma/client";
import fs from "fs";

const prisma = new PrismaClient();

async function seed() {
  // Load JSON files from ittems folder
  const admins = JSON.parse(fs.readFileSync("ittems/admins.json", "utf-8"));
  const questions = JSON.parse(fs.readFileSync("ittems/questions.json", "utf-8"));
  const students = JSON.parse(fs.readFileSync("ittems/students.json", "utf-8"));
  const subjects = JSON.parse(fs.readFileSync("ittems/subjects.json", "utf-8"));
  const teachers = JSON.parse(fs.readFileSync("ittems/teachers.json", "utf-8"));
  const users = JSON.parse(fs.readFileSync("ittems/users.json", "utf-8"));
  const classes = JSON.parse(fs.readFileSync("ittems/classes.json", "utf-8"));
  const classStudents = JSON.parse(fs.readFileSync("ittems/class_students.json", "utf-8"));
  const aboutPages = JSON.parse(fs.readFileSync("ittems/about_pages.json", "utf-8"));
  const blogPosts = JSON.parse(fs.readFileSync("ittems/blog_posts.json", "utf-8"));
  const curriculum = JSON.parse(fs.readFileSync("ittems/Curriculum.json", "utf-8"));
  const studentAnswers = JSON.parse(fs.readFileSync("ittems/student_answers.json", "utf-8"));
  const studentSubjectSelections = JSON.parse(fs.readFileSync("ittems/student_subject_selections.json", "utf-8"));
  const verificationTokens = JSON.parse(fs.readFileSync("ittems/verification_tokens.json", "utf-8"));
  const verifiedEmails = JSON.parse(fs.readFileSync("ittems/verified_emails.json", "utf-8"));
  const visitorLogs = JSON.parse(fs.readFileSync("ittems/visitor_logs.json", "utf-8"));

  // Helper function to convert date strings to Date objects and handle image field
  const convertDates = (obj: any): any => {
    if (Array.isArray(obj)) {
      return obj.map(convertDates);
    } else if (obj && typeof obj === 'object') {
      const converted: any = {};
      for (const [key, value] of Object.entries(obj)) {
        if (key === 'createdAt' || key === 'updatedAt') {
          converted[key] = new Date(value as string);
        } else if (key === 'image') {
          // Convert null or string to array
          if (value === null || value === undefined) {
            converted[key] = [];
          } else if (typeof value === 'string') {
            converted[key] = [value];
          } else {
            converted[key] = value;
          }
        } else {
          converted[key] = convertDates(value);
        }
      }
      return converted;
    }
    return obj;
  };

  // Convert dates in all data
  const convertedAdmins = convertDates(admins);
  const convertedQuestions = convertDates(questions);
  const convertedStudents = convertDates(students);
  const convertedSubjects = convertDates(subjects);
  const convertedTeachers = convertDates(teachers);
  const convertedUsers = convertDates(users);
  const convertedClasses = convertDates(classes);
  const convertedClassStudents = convertDates(classStudents);
  const convertedAboutPages = convertDates(aboutPages);
  const convertedBlogPosts = convertDates(blogPosts);
  const convertedCurriculum = convertDates(curriculum);
  const convertedStudentAnswers = convertDates(studentAnswers);
  const convertedStudentSubjectSelections = convertDates(studentSubjectSelections);
  const convertedVerificationTokens = convertDates(verificationTokens);
  const convertedVerifiedEmails = convertDates(verifiedEmails);
  const convertedVisitorLogs = convertDates(visitorLogs);

  // Insert data in correct order (respecting foreign key constraints)
  try {
    await prisma.user.createMany({ data: convertedUsers, skipDuplicates: true });
    console.log("✅ Users seeded successfully!");
  } catch (error) {
    console.log("⚠️ Users already exist or error occurred:", error);
  }

  try {
    await prisma.subject.createMany({ data: convertedSubjects, skipDuplicates: true });
    console.log("✅ Subjects seeded successfully!");
  } catch (error) {
    console.log("⚠️ Subjects already exist or error occurred:", error);
  }

  try {
    await prisma.admin.createMany({ data: convertedAdmins, skipDuplicates: true });
    console.log("✅ Admins seeded successfully!");
  } catch (error) {
    console.log("⚠️ Admins already exist or error occurred:", error);
  }

  try {
    await prisma.teacher.createMany({ data: convertedTeachers, skipDuplicates: true });
    console.log("✅ Teachers seeded successfully!");
  } catch (error) {
    console.log("⚠️ Teachers already exist or error occurred:", error);
  }

  try {
    await prisma.student.createMany({ data: convertedStudents, skipDuplicates: true });
    console.log("✅ Students seeded successfully!");
  } catch (error) {
    console.log("⚠️ Students already exist or error occurred:", error);
  }

  try {
    await prisma.question.createMany({ data: convertedQuestions, skipDuplicates: true });
    console.log("✅ Questions seeded successfully!");
  } catch (error) {
    console.log("⚠️ Questions already exist or error occurred:", error);
  }

  try {
    await prisma.class.createMany({ data: convertedClasses, skipDuplicates: true });
    console.log("✅ Classes seeded successfully!");
  } catch (error) {
    console.log("⚠️ Classes already exist or error occurred:", error);
  }

  try {
    await prisma.classStudent.createMany({ data: convertedClassStudents, skipDuplicates: true });
    console.log("✅ Class Students seeded successfully!");
  } catch (error) {
    console.log("⚠️ Class Students already exist or error occurred:", error);
  }

  try {
    await prisma.aboutPage.createMany({ data: convertedAboutPages, skipDuplicates: true });
    console.log("✅ About Pages seeded successfully!");
  } catch (error) {
    console.log("⚠️ About Pages already exist or error occurred:", error);
  }

  try {
    await prisma.blogPost.createMany({ data: convertedBlogPosts, skipDuplicates: true });
    console.log("✅ Blog Posts seeded successfully!");
  } catch (error) {
    console.log("⚠️ Blog Posts already exist or error occurred:", error);
  }

  try {
    await prisma.curriculum.createMany({ data: convertedCurriculum, skipDuplicates: true });
    console.log("✅ Curriculum seeded successfully!");
  } catch (error) {
    console.log("⚠️ Curriculum already exist or error occurred:", error);
  }

  try {
    await prisma.studentAnswer.createMany({ data: convertedStudentAnswers, skipDuplicates: true });
    console.log("✅ Student Answers seeded successfully!");
  } catch (error) {
    console.log("⚠️ Student Answers already exist or error occurred:", error);
  }

  try {
    await prisma.studentSubjectSelection.createMany({ data: convertedStudentSubjectSelections, skipDuplicates: true });
    console.log("✅ Student Subject Selections seeded successfully!");
  } catch (error) {
    console.log("⚠️ Student Subject Selections already exist or error occurred:", error);
  }

  try {
    await prisma.verificationToken.createMany({ data: convertedVerificationTokens, skipDuplicates: true });
    console.log("✅ Verification Tokens seeded successfully!");
  } catch (error) {
    console.log("⚠️ Verification Tokens already exist or error occurred:", error);
  }

  try {
    await prisma.verifiedEmail.createMany({ data: convertedVerifiedEmails, skipDuplicates: true });
    console.log("✅ Verified Emails seeded successfully!");
  } catch (error) {
    console.log("⚠️ Verified Emails already exist or error occurred:", error);
  }

  // Skip visitor logs due to malformed JSON data
  // try {
  //   await prisma.visitorLog.createMany({ data: convertedVisitorLogs, skipDuplicates: true });
  //   console.log("✅ Visitor Logs seeded successfully!");
  // } catch (error) {
  //   console.log("⚠️ Visitor Logs already exist or error occurred:", error);
  // }

  console.log("✅ All JSON files seeded successfully!");
}

seed()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
