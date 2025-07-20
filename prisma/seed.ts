// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import * as bcrypt      from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // 1) Roles (name is UNIQUE in your schema)
  const roleNames = ['admin', 'priest', 'user'];
  for (const name of roleNames) {
    await prisma.role.upsert({
      where:  { name },
      update: {},
      create: { name }
    });
  }
  console.log('✅ Roles upserted');

  // 2) Priests (name is NOT unique, so use findFirst/create)
  const priestData = [
    {
      name: 'Pandit Sharma',
      qualifications: ['havan','yajna'],
      languages: ['Hindi', 'Sanskrit'],
      specialty: 'Vedic Rituals',
      contactNo: '9999999999',
      email: 'sharma@example.com',
      address: 'Brahmin Street, City',
      photo: null
    },
    {
      name: 'Pandita Devi',
      qualifications: ['homam'],
      languages: ['English', 'Tamil'],
      specialty: 'Homam',
      contactNo: '8888888888',
      email: 'devi@example.com',
      address: 'Lakshmi Nagar, City',
      photo: null
    }
  ];
  

  const priests = [];
  for (const p of priestData) {
    let priest = await prisma.priest.findFirst({ where: { name: p.name } });
    if (!priest) {
      priest = await prisma.priest.create({ data: p });
    }
    priests.push(priest);
  }
  console.log('✅ Priests seeded');

  // 3) Poojas (again name is NOT unique, so findFirst/create)
  const poojaData = [
    {
      name:         'Ganesh Puja',
      amount:       1500,
      currency:     'INR',
      date:         new Date('2025-07-01'),
      time:         new Date('2025-07-01T09:30:00'),
      durationMin:  60,
      prepTimeMin:  15,
      bufferMin:    10,
      isInVenue:    true,
      isOutsideVenue: false,
      venueAddress: '123 Temple Street, City',
      mapLink:      'https://maps.example.com/?q=123+Temple',
      allowedZones: [],              // not used when inVenue
      photoUrl:     null,
      includeFood:  true,
      includeHall:  false,
      materials:    'Flowers, Incense',
      notes:        'Please arrive 15 minutes early.',
      priestId:     priests[0].id
    },
    {
      name:         'Lakshmi Puja',
      amount:       2000,
      currency:     'INR',
      date:         null,
      time:         null,
      durationMin:  45,
      prepTimeMin:  10,
      bufferMin:    5,
      isInVenue:    false,
      isOutsideVenue: true,
      venueAddress: null,
      mapLink:      null,
      allowedZones: ['560001','560002'],
      photoUrl:     null,
      includeFood:  false,
      includeHall:  false,
      materials:    'Rice, Flowers',
      notes:        'Available only in central zones.',
      priestId:     priests[1].id
    }
  ];

  for (const p of poojaData) {
    let pooja = await prisma.pooja.findFirst({ where: { name: p.name } });
    if (!pooja) {
      pooja = await prisma.pooja.create({
        data: {
          name:           p.name,
          amount:         p.amount,
          currency:       p.currency,
          date:           p.date,
          time:           p.time,
          durationMin:    p.durationMin,
          prepTimeMin:    p.prepTimeMin,
          bufferMin:      p.bufferMin,
          isInVenue:      p.isInVenue,
          isOutsideVenue: p.isOutsideVenue,
          venueAddress:   p.venueAddress,
          mapLink:        p.mapLink,
          allowedZones:   p.allowedZones,
          photoUrl:       p.photoUrl,
          includeFood:    p.includeFood,
          includeHall:    p.includeHall,
          materials:      p.materials,
          notes:          p.notes,
          priests: {
            connect: [{ id: p.priestId }]
          }
        }
      });
    }
  }
  console.log('✅ Poojas seeded');

  // 4) Admin user (email is UNIQUE)
  const adminEmail = 'admin@example.com';
  const plainPass  = 'AdminPass123';
  const hash       = await bcrypt.hash(plainPass, 10);

  const admin = await prisma.user.upsert({
    where:  { email: adminEmail },
    update: { password: hash },
    create: {
      email:    adminEmail,
      password: hash,
      roles: {
        connect: [{ name: 'admin' }]
      }
    },
    include: { roles: true }
  });
  console.log('✅ Admin user upserted:', admin.email);
}



main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
