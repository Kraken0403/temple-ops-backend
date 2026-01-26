/**
 * scripts/import-poojas-from-excel.ts
 */

 import * as XLSX from 'xlsx'
 import slugify from 'slugify'
 import { PrismaClient } from '@prisma/client'
 
 const prisma = new PrismaClient()
 
 // 👇 UPDATE THESE
 const EXCEL_PATH = './data/services.xlsx'
 const SHEET_NAME = 'Services'
 const PRIEST_IDS = [1, 2] // <-- both priest IDs
 
 function hoursToMinutes(v: any): number {
   const n = Number(v)
   return isNaN(n) ? 0 : Math.round(n * 60)
 }
 
 async function upsertCategory(name: string) {
   const slug = slugify(name, { lower: true, strict: true })
 
   return prisma.poojaCategory.upsert({
     where: { slug },
     update: {},
     create: {
       name: name.trim(),
       slug,
       isActive: true,
     },
   })
 }
 
 async function run() {
   console.log('📥 Reading Excel...')
   const workbook = XLSX.readFile(EXCEL_PATH)
   const sheet = workbook.Sheets[SHEET_NAME]
   const rows = XLSX.utils.sheet_to_json<any>(sheet)
 
   if (!rows.length) {
     throw new Error('No rows found in POOJA_MASTER sheet')
   }
 
   console.log('🧹 Clearing existing poojas...')
   await prisma.$transaction([
     prisma.booking.deleteMany({}),
     prisma.poojaMedia.deleteMany({}),
     prisma.couponPooja.deleteMany({}),
     prisma.pooja.deleteMany({}),
   ])
 
   for (const row of rows) {
     const name = row.name?.trim()
     if (!name) continue
 
     const categoriesRaw = row.categories || ''
     const categoryNames = categoriesRaw
       .split(',')
       .map((c: string) => c.trim())
       .filter(Boolean)
 
     const categoryRecords = await Promise.all(
       categoryNames.map(upsertCategory),
     )
 
     const inTempleAmount = Number(row.inTempleAmount) || null
     const atHomeAmount = Number(row.atHomeAmount) || null
 
     const isInVenue = !!inTempleAmount
     const isOutsideVenue = !!atHomeAmount
 
     console.log(`➕ Creating pooja: ${name}`)
 
     await prisma.pooja.create({
       data: {
         name,
         description: row.description || null,
 
         amount: inTempleAmount ?? atHomeAmount ?? 0,
         outsideAmount: atHomeAmount,
 
         durationMin: hoursToMinutes(row.durationHours),
         prepTimeMin: Number(row.prepTimeMin) || 0,
         bufferMin: Number(row.bufferTimeMin) || 0,
 
         isInVenue,
         isOutsideVenue,
 
         materials: row.materials || null,
 
         priests: {
           connect: PRIEST_IDS.map(id => ({ id })),
         },
 
         categories: {
           connect: categoryRecords.map(c => ({ id: c.id })),
         },
       },
     })
   }
 
   console.log('✅ Import completed successfully')
 }
 
 run()
   .catch(err => {
     console.error('❌ Import failed:', err)
     process.exit(1)
   })
   .finally(() => prisma.$disconnect())
 