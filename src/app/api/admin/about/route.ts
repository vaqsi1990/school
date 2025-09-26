import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET() {
  try {
    const aboutPage = await prisma.aboutPage.findFirst({
      orderBy: { createdAt: 'desc' }
    });

    if (!aboutPage) {
      // Return default content if no about page exists
      return NextResponse.json({
        id: null,
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
      });
    }

    return NextResponse.json(aboutPage);
  } catch (error) {
    console.error('Error fetching about page:', error);
    return NextResponse.json(
      { error: 'შეცდომა მონაცემების ჩატვირთვისას' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.userType !== 'ADMIN') {
      return NextResponse.json(
        { error: 'არასაკმარისი უფლებები' },
        { status: 403 }
      );
    }

    const { title, content } = await request.json();

    if (!title || !content) {
      return NextResponse.json(
        { error: 'სათაური და შინაარსი სავალდებულოა' },
        { status: 400 }
      );
    }

    // Delete existing about page if exists
    await prisma.aboutPage.deleteMany({});

    const aboutPage = await prisma.aboutPage.create({
      data: {
        title,
        content: content as Prisma.InputJsonValue
      }
    });

    return NextResponse.json(aboutPage);
  } catch (error) {
    console.error('Error creating about page:', error);
    return NextResponse.json(
      { error: 'შეცდომა გვერდის შექმნისას' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.userType !== 'ADMIN') {
      return NextResponse.json(
        { error: 'არასაკმარისი უფლებები' },
        { status: 403 }
      );
    }

    const { id, title, content } = await request.json();

    if (!id || !title || !content) {
      return NextResponse.json(
        { error: 'ყველა ველი სავალდებულოა' },
        { status: 400 }
      );
    }

    const aboutPage = await prisma.aboutPage.update({
      where: { id },
      data: {
        title,
        content: content as Prisma.InputJsonValue
      }
    });

    return NextResponse.json(aboutPage);
  } catch (error) {
    console.error('Error updating about page:', error);
    return NextResponse.json(
      { error: 'შეცდომა გვერდის განახლებისას' },
      { status: 500 }
    );
  }
}
