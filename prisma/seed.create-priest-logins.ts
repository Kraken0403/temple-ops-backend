import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function upsertRole(name: string) {
  return prisma.role.upsert({
    where: { name },
    update: {},
    create: { name },
  })
}

async function main() {
  // Ensure "Priest" role exists
  const priestRole = await upsertRole('Priest')

  // Fetch your existing priests
  const priests = await prisma.priest.findMany({
    where: { id: { in: [1, 2] } }, // limit to the two you showed; remove this where clause to do all
  })

  for (const p of priests) {
    const email = (p.email && p.email.trim()) ? p.email.trim() : `priest${p.id}@temple.com`

    // Try to find a user linked to this priest
    let user = await prisma.user.findFirst({ where: { priestId: p.id } })

    if (!user) {
      // Or reuse by email, otherwise create
      user = await prisma.user.findUnique({ where: { email } })
      if (user) {
        // Link existing user to priest (if not already)
        if (user.priestId !== p.id) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: { priestId: p.id },
          })
        }
      } else {
        // Create a brand-new user with temp password
        const password = await bcrypt.hash('Priest@123', 10)
        user = await prisma.user.create({
          data: {
            email,
            password,
            priest: { connect: { id: p.id } }, // sets priestId
          },
        })
      }
    }

    // Ensure Priest role is assigned
    const hasRole = await prisma.userRole.findUnique({
      where: { userId_roleId: { userId: user.id, roleId: priestRole.id } },
    })
    if (!hasRole) {
      await prisma.userRole.create({
        data: { userId: user.id, roleId: priestRole.id },
      })
    }

    console.log(`✅ Login ready for Priest #${p.id} (${p.name}) -> ${user.email}`)
  }

  console.log('All done.')
}

main().finally(() => prisma.$disconnect())
