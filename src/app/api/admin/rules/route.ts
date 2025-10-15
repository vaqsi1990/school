import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET() {
  try {
    const rulesPage = await prisma.rulesPage.findFirst({
      orderBy: { createdAt: 'desc' }
    });

    if (!rulesPage) {
      // Return default content if no rules page exists
      return NextResponse.json({
        id: null,
        title: 'წესები და პირობები',
        content: {
          sections: [
            {
              id: '1',
              type: 'text',
              content: 'EduArena პლატფორმაზე მონაწილეობის წესები და პირობები. ყველა მონაწილემ უნდა დაიცვას შემდეგი წესები:'
            },
            {
              id: '2',
              type: 'list',
              title: 'ძირითადი წესები',
              items: [
                'მონაწილეობა უფასოა ყველა მოსწავლისთვის',
                'ოლიმპიადაში მონაწილეობა შესაძლებელია მხოლოდ ერთხელ',
                'პასუხების გაცემისას აკრძალულია ნებისმიერი ტიპის მოტყუება',
                'მონაწილეებმა უნდა მიუთითონ სწორი პირადი მონაცემები'
              ]
            },
            {
              id: '3',
              type: 'text',
              content: 'წესების დარღვევის შემთხვევაში მონაწილე შეიძლება გამოირიცხოს ოლიმპიადიდან.'
            }
          ]
        }
      });
    }

    return NextResponse.json(rulesPage);
  } catch (error) {
    console.error('Error fetching rules page:', error);
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

    // Delete existing rules page if exists
    await prisma.rulesPage.deleteMany({});

    const rulesPage = await prisma.rulesPage.create({
      data: {
        title,
        content: content as Prisma.InputJsonValue
      }
    });

    return NextResponse.json(rulesPage);
  } catch (error) {
    console.error('Error creating rules page:', error);
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

    const rulesPage = await prisma.rulesPage.update({
      where: { id },
      data: {
        title,
        content: content as Prisma.InputJsonValue
      }
    });

    return NextResponse.json(rulesPage);
  } catch (error) {
    console.error('Error updating rules page:', error);
    return NextResponse.json(
      { error: 'შეცდომა გვერდის განახლებისას' },
      { status: 500 }
    );
  }
}
