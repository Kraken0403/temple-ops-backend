import { DateTime } from 'luxon'
import { EventRecurrenceType } from '@prisma/client'

export function generateOccurrences(params: {
  recurrenceType: EventRecurrenceType
  recurrenceDays?: number[]   // 0 = Sunday ... 6 = Saturday (CUSTOM only)
  startDate: Date
  endDate?: Date
}) {
  const { recurrenceType, recurrenceDays, startDate, endDate } = params

  const dates: Date[] = []

  let cursor = DateTime.fromJSDate(startDate).startOf('day')

    if (recurrenceType === 'CUSTOM' && recurrenceDays?.length) {
      while (!recurrenceDays.includes(cursor.weekday % 7)) {
        cursor = cursor.plus({ days: 1 })
      }
    }



  const until = endDate
    ? DateTime.fromJSDate(endDate).endOf('day')
    : cursor.endOf('day')

  switch (recurrenceType) {
    case 'NONE': {
      dates.push(cursor.toJSDate())
      break
    }

    case 'DAILY': {
      while (cursor <= until) {
        dates.push(cursor.toJSDate())
        cursor = cursor.plus({ days: 1 })
      }
      break
    }

    case 'WEEKLY': {
      while (cursor <= until) {
        dates.push(cursor.toJSDate())
        cursor = cursor.plus({ weeks: 1 })
      }
      break
    }

    case 'CUSTOM': {
      if (!recurrenceDays?.length) return []
    
      // Snap cursor to first valid weekday
      while (!recurrenceDays.includes(cursor.weekday % 7)) {
        cursor = cursor.plus({ days: 1 })
      }
    
      while (cursor <= until) {
        const normalizedDay = cursor.weekday % 7
    
        if (recurrenceDays.includes(normalizedDay)) {
          dates.push(cursor.toJSDate())
        }
    
        cursor = cursor.plus({ days: 1 })
      }
      break
    }
    

    case 'MONTHLY': {
      while (cursor <= until) {
        dates.push(cursor.toJSDate())
        cursor = cursor.plus({ months: 1 })
      }
      break
    }

    case 'YEARLY': {
      while (cursor <= until) {
        dates.push(cursor.toJSDate())
        cursor = cursor.plus({ years: 1 })
      }
      break
    }
  }

  return dates
}
