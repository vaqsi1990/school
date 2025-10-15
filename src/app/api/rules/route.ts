import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
