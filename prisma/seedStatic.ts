import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.staticPage.createMany({
    data: [
      {
        slug: 'home',
        template: 'home',
        content: {
          heroSlider: [
            {
              image: '/uploads/hero1.jpg',
              title: 'Welcome to Sanatan Mandir',
              caption: 'A place of peace, devotion, and community.'
            },
            {
              image: '/uploads/hero2.jpg',
              title: 'Join Our Events',
              caption: 'Celebrating tradition together.'
            }
          ],
          marquee: {
            items: [
              'Welcome to Sanatan Mandir',
              'Upcoming Event: Maha Shivratri – 8th March',
              'Join Our Community Service Programs'
            ],
            bgColor: '#660000',
            speed: 20
          },
          events: [
            {
              title: 'Maha Shivratri',
              date: '2025-03-08',
              description: 'An auspicious night dedicated to Lord Shiva.',
              image: '/uploads/shivratri.jpg'
            },
            {
              title: 'Navratri',
              date: '2025-10-01',
              description: 'Nine nights of devotion and dance.',
              image: '/uploads/navratri.jpg'
            }
          ],
          aboutSection: {
            heading: 'About Our Mandir',
            text: 'Sanatan Mandir has been serving the community since 1970, offering spiritual guidance and a place for cultural connection.',
            image: '/uploads/about.jpg'
          }
        }
      },
      {
        slug: 'about',
        template: 'about',
        content: {
          intro: '<p>Founded in 1970, Sanatan Mandir has been a beacon of spirituality...</p>',
          mission: '<p>Our mission is to serve the community through spiritual, cultural, and social activities...</p>',
          timeline: [
            { year: '1970', event: 'Temple established' },
            { year: '1990', event: 'Major renovation completed' },
            { year: '2020', event: '50th anniversary celebration' }
          ]
        }
      }
    ]
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
