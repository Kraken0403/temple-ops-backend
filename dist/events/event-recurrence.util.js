"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOccurrences = generateOccurrences;
const luxon_1 = require("luxon");
function generateOccurrences(params) {
    const { recurrenceType, recurrenceDays, startDate, endDate } = params;
    const dates = [];
    let cursor = luxon_1.DateTime.fromJSDate(startDate).startOf('day');
    const until = endDate
        ? luxon_1.DateTime.fromJSDate(endDate).endOf('day')
        : cursor.endOf('day');
    switch (recurrenceType) {
        case 'NONE': {
            dates.push(cursor.toJSDate());
            break;
        }
        case 'DAILY': {
            while (cursor <= until) {
                dates.push(cursor.toJSDate());
                cursor = cursor.plus({ days: 1 });
            }
            break;
        }
        case 'WEEKLY': {
            while (cursor <= until) {
                dates.push(cursor.toJSDate());
                cursor = cursor.plus({ weeks: 1 });
            }
            break;
        }
        case 'CUSTOM': {
            if (!recurrenceDays?.length)
                return [];
            while (cursor <= until) {
                // Luxon: weekday = 1 (Mon) ... 7 (Sun)
                // Normalize to 0 (Sun) ... 6 (Sat)
                const normalizedDay = cursor.weekday % 7;
                if (recurrenceDays.includes(normalizedDay)) {
                    dates.push(cursor.toJSDate());
                }
                cursor = cursor.plus({ days: 1 });
            }
            break;
        }
        case 'MONTHLY': {
            while (cursor <= until) {
                dates.push(cursor.toJSDate());
                cursor = cursor.plus({ months: 1 });
            }
            break;
        }
        case 'YEARLY': {
            while (cursor <= until) {
                dates.push(cursor.toJSDate());
                cursor = cursor.plus({ years: 1 });
            }
            break;
        }
    }
    return dates;
}
//# sourceMappingURL=event-recurrence.util.js.map