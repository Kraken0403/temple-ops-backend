/**
 * scripts/import-events-from-excel.ts
 */

 import * as XLSX from 'xlsx'
 import { PrismaClient } from '@prisma/client'
 import { DateTime } from 'luxon'
 
 const prisma = new PrismaClient()
 
 // 👇 UPDATE THESE
 const EXCEL_PATH = './data/events.xlsx'
 const SHEET_NAME = 'Events'
 
 function toUTCDate(date?: string) {
   if (!date) return null
   return DateTime.fromISO(date, { zone: 'local' }).toUTC().toJSDate()
 }
 
 function toUTCTime(date: string, time?: string) {
   if (!date || !time) return null
   return DateTime.fromFormat(
     `${date} ${time}`,
     'yyyy-MM-dd HH:mm',
     { zone: 'local' }
   ).toUTC().toJSDate()
 }
 
 async function run() {
   console.log('📥 Reading Excel...')
   const workbook = XLSX.readFile(EXCEL_PATH)
   const sheet = workbook.Sheets[SHEET_NAME]
   const rows = XLSX.utils.sheet_to_json<any>(sheet)
 
   if (!rows.length) {
     throw new Error('No rows found in Events sheet')
   }
 
   console.log('🧹 Clearing existing events...')
   await prisma.event.deleteMany({})
 
   for (const row of rows) {
     const name = row.name?.trim()
     if (!name) continue
 
     const venueType = String(row.venueType || '').toUpperCase()
 
     const isInVenue = venueType === 'IN_TEMPLE'
     const isOutsideVenue = venueType === 'OUTSIDE'
 
     console.log(`➕ Creating event: ${name}`)
 
     await prisma.event.create({
       data: {
         name,
         description: row.description || null,
 
         isInVenue,
         isOutsideVenue,
 
         venue: isOutsideVenue ? row.venue || null : null,
         mapLink: isOutsideVenue ? row.mapLink || null : null,
 
         recurrenceType: row.recurrenceType || 'NONE',
 
         date: toUTCDate(row.date),
         endDate: toUTCDate(row.endDate),
 
         startTime: toUTCTime(row.date, row.startTime),
         endTime: toUTCTime(row.date, row.endTime),
 
         capacity: row.capacity != null ? Number(row.capacity) : null,
         price: row.price != null ? Number(row.price) : null,
 
         organizer: row.organizer || null,
         contactInfo: row.contactInfo || null,
 
         isPublic:
           typeof row.isPublic === 'boolean'
             ? row.isPublic
             : String(row.isPublic || '').toLowerCase() !== 'false',
       },
     })
   }
 
   console.log('✅ Events import completed successfully')
 }
 
 run()
   .catch(err => {
     console.error('❌ Import failed:', err)
     process.exit(1)
   })
   .finally(() => prisma.$disconnect())
 