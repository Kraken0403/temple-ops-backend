/**
 * scripts/import-pooja-images.ts
 */

 import * as fs from 'fs'
 import * as path from 'path'
 import * as mime from 'mime-types'
 import slugify from 'slugify'
 import { PrismaClient } from '@prisma/client'
 console.log('DATABASE_URL =', process.env.DATABASE_URL)

 const prisma = new PrismaClient()
 
 const IMAGE_DIR = path.join(
    __dirname,
    '..',
    'uploads',
    'poojas',
  )
  
 const PUBLIC_URL_BASE = '/uploads/poojas'
 
 function slugFromFilename(filename: string) {
   return slugify(
     filename.replace(path.extname(filename), ''),
     { lower: true, strict: true },
   )
 }
 
 function slugFromPoojaName(name: string) {
   return slugify(name, { lower: true, strict: true })
 }
 
 async function run() {
   const files = fs.readdirSync(IMAGE_DIR)
 
   console.log(`📂 Found ${files.length} image files`)
 
   // Load all poojas once
   const poojas = await prisma.pooja.findMany({
     select: { id: true, name: true },
   })
 
   const poojaMap = new Map(
     poojas.map(p => [slugFromPoojaName(p.name), p]),
   )
 
   for (const file of files) {
     const fullPath = path.join(IMAGE_DIR, file)
     if (!fs.statSync(fullPath).isFile()) continue
 
     const imageSlug = slugFromFilename(file)
     const pooja = poojaMap.get(imageSlug)
 
     if (!pooja) {
       console.warn(`⚠️ No pooja matched for image: ${file}`)
       continue
     }
 
     const mimeType = mime.lookup(file) || 'image/jpeg'
     const url = `${PUBLIC_URL_BASE}/${file}`
 
     console.log(`🖼️ Attaching image → ${pooja.name}`)
 
     const media = await prisma.mediaAsset.upsert({
        where: { url },
        update: {
          filename: file,
          mimeType: String(mimeType),
        },
        create: {
          url,
          filename: file,
          mimeType: String(mimeType),
        },
      })
      
 
     await prisma.pooja.update({
       where: { id: pooja.id },
       data: {
         featuredMediaId: media.id,
       },
     })
   }
 
   console.log('✅ Pooja images attached successfully')
 }
 
 run()
   .catch(err => {
     console.error('❌ Image import failed:', err)
     process.exit(1)
   })
   .finally(() => prisma.$disconnect())
 