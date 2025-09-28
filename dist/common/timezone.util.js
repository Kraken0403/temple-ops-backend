"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimezoneUtil = void 0;
// src/common/timezone.util.ts
const luxon_1 = require("luxon");
const common_1 = require("@nestjs/common");
class TimezoneUtil {
    constructor(prisma) {
        this.prisma = prisma;
    }
    /** Convert incoming local/ISO date to UTC for DB storage */
    async toUTC(date) {
        if (!date)
            throw new common_1.BadRequestException('Date is required');
        const settings = await this.prisma.settings.findUnique({ where: { id: 1 } });
        const tz = settings?.timezone || 'Asia/Kolkata';
        let dt;
        if (typeof date === 'string') {
            dt = luxon_1.DateTime.fromISO(date, { zone: tz });
        }
        else {
            dt = luxon_1.DateTime.fromJSDate(date, { zone: tz });
        }
        if (!dt.isValid) {
            throw new common_1.BadRequestException('Invalid date format');
        }
        return dt.toUTC().toJSDate();
    }
    /** Convert stored UTC back into configured timezone ISO string */
    async fromUTC(date) {
        if (!date)
            return null;
        const settings = await this.prisma.settings.findUnique({ where: { id: 1 } });
        const tz = settings?.timezone || 'Asia/Kolkata';
        return (luxon_1.DateTime.fromJSDate(date, { zone: 'utc' })
            .setZone(tz)
            .toISO() || null);
    }
    /** Format for human-readable display (frontend/admin tables) */
    async format(date, fmt = 'yyyy-LL-dd HH:mm') {
        if (!date)
            return null;
        const settings = await this.prisma.settings.findUnique({ where: { id: 1 } });
        const tz = settings?.timezone || 'Asia/Kolkata';
        const dt = luxon_1.DateTime.fromJSDate(date, { zone: 'utc' }).setZone(tz);
        return dt.isValid ? dt.toFormat(fmt) : null;
    }
}
exports.TimezoneUtil = TimezoneUtil;
//# sourceMappingURL=timezone.util.js.map