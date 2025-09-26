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

  // Seed About Page with default content
  try {
    const defaultAboutPage = {
      title: 'ჩვენ შესახებ',
      content: {
        sections: [
          {
            id: '1',
            type: 'text',
            content: 'EduArena არის თანამედროვე საგანმანათლებლო პლატფორმა, რომელიც მოსწავლეებს სთავაზობს ონლაინ ოლიმპიადებს სხვადასხვა საგანში. თითოეული ოლიმპიადა გათვლილია შესაბამისი კლასის პროგრამაზე, რაც უზრუნველყოფს სამართლიან და თანაბარ პირობებს მონაწილეებისთვის. მოსწავლეს შეუძლია ოლიმპიადაში მონაწილეობა მიიღოს ონლაინ, სახლიდან გაუსვლელად, რაც კიდევ უფრო მოსახერხებელს და ხელმისაწვდომს ხდის პროცესს.'
          },
          {
            id: '2',
            type: 'list',
            title: 'ჩვენი მისიაა:',
            items: [
              'განათლების ხელმისაწვდომობის გაზრდა;',
              'ინოვაციური ტექნოლოგიების დანერგვა სასწავლო პროცესში;',
              'მოსწავლეების მოტივაციის გაძლიერება ჯანსაღი კონკურსებისა და ოლიმპიადების საშუალებით.'
            ]
          },
          {
            id: '3',
            type: 'list',
            title: 'EduArena გამოირჩევა:',
            items: [
              'მრავალფეროვანი ოლიმპიადებით სხვადასხვა საგნისა და კლასის მიხედვით;',
              'გამჭვირვალე და ობიექტური შეფასების სისტემით;',
              'თანამედროვე, მარტივად გამოსაყენებელი პლატფორმით;'
            ]
          },
          {
            id: '4',
            type: 'text',
            content: 'ჩვენ გვჯერა, რომ განათლების პროცესში ტექნოლოგიების ინტეგრაცია მნიშვნელოვნად ზრდის მოსწავლეთა ინტერესს და აძლევს მათ შესაძლებლობას, საკუთარი ცოდნა რეალურ გარემოში გამოსცადონ.'
          }
        ]
      }
    };

    await prisma.aboutPage.create({
      data: {
        title: defaultAboutPage.title,
        content: defaultAboutPage.content as any
      }
    });
    console.log("✅ About Page seeded successfully!");
  } catch (error) {
    console.log("⚠️ About Page already exists or error occurred:", error);
  }

  console.log("✅ All JSON files seeded successfully!");
}

seed()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
