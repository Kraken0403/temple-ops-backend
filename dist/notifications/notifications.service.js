"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var NotificationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
// src/notifications/notifications.service.ts
const common_1 = require("@nestjs/common");
const mailer_1 = require("@nestjs-modules/mailer");
const prisma_service_1 = require("../prisma.service");
// If your deployment is in India, default to Asia/Kolkata:
const TZ = process.env.APP_TZ || 'Asia/Kolkata';
const APP_NAME = process.env.APP_NAME || 'Booking';
const APP_URL = process.env.APP_URL || 'https://example.com';
function toDateText(d, tz = TZ) {
    if (!d)
        return '';
    const dt = typeof d === 'string' ? new Date(d) : d;
    return dt.toLocaleDateString('en-IN', { timeZone: tz, weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
}
function toTimeText(d, tz = TZ) {
    if (!d)
        return '';
    const dt = typeof d === 'string' ? new Date(d) : d;
    return dt.toLocaleTimeString('en-IN', { timeZone: tz, hour: '2-digit', minute: '2-digit' });
}
function venueLine(addr, state, zip) {
    const parts = [addr?.trim(), state?.trim(), zip?.trim()].filter(Boolean);
    return parts.join(', ');
}
let NotificationsService = NotificationsService_1 = class NotificationsService {
    constructor(mailer, prisma) {
        this.mailer = mailer;
        this.prisma = prisma;
        this.logger = new common_1.Logger(NotificationsService_1.name);
    }
    async getAdminRecipients() {
        try {
            const settings = await this.prisma.settings.findUnique({ where: { id: 1 } });
            const arr = settings?.notificationEmails;
            if (Array.isArray(arr))
                return arr.filter(x => typeof x === 'string' && x.trim().length > 0);
        }
        catch (err) {
            this.logErr('Failed to read Settings.notificationEmails', err);
        }
        const envList = process.env.ADMIN_EMAILS || '';
        return envList.split(',').map(s => s.trim()).filter(Boolean);
    }
    async sendIf(opts) {
        const to = Array.isArray(opts.to)
            ? opts.to.filter(e => typeof e === 'string' && e.trim().length > 0)
            : (typeof opts.to === 'string' && opts.to.trim().length > 0 ? opts.to : undefined);
        if (!to) {
            this.logger.warn(`Skipped email (no recipient) for subject="${opts.subject}"`);
            return;
        }
        try {
            await this.mailer.sendMail({
                to,
                subject: opts.subject,
                template: opts.template,
                context: {
                    ...opts.context,
                    appName: APP_NAME,
                    appUrl: APP_URL,
                    year: new Date().getFullYear(),
                },
                html: opts.html,
            });
        }
        catch (e) {
            this.logErr('Email send failed', e);
        }
    }
    logErr(prefix, e) {
        if (e && typeof e === 'object') {
            const anyErr = e;
            this.logger.error(prefix, anyErr.stack || anyErr.message);
        }
        else {
            this.logger.error(`${prefix}: ${String(e)}`);
        }
    }
    // ─────────────────────────────────────────────
    // BOOKINGS (Pooja) — create/update/cancel
    // ─────────────────────────────────────────────
    async sendBookingCreated(bookingId) {
        const booking = await this.prisma.booking.findUnique({
            where: { id: bookingId },
            include: { pooja: true, priest: true, user: true },
        });
        if (!booking) {
            this.logger.warn(`Booking ${bookingId} not found`);
            return;
        }
        const ctx = {
            bookingId: booking.id,
            status: booking.status,
            poojaName: booking.pooja?.name,
            priestName: booking.priest?.name || '',
            userName: booking.userName || booking.user?.email || 'Devotee',
            userEmail: booking.userEmail || booking.user?.email || '',
            userPhone: booking.userPhone || '',
            bookingDateText: toDateText(booking.bookingDate),
            startTimeText: toTimeText(booking.start),
            endTimeText: toTimeText(booking.end),
            venueText: venueLine(booking.venueAddress, booking.venueState, booking.venueZip),
            manageUrl: `${APP_URL}/my/bookings/${booking.id}`,
            adminUrl: `${APP_URL}/admin/bookings/${booking.id}`,
        };
        const userTo = (booking.userEmail || booking.user?.email || '').trim() || undefined;
        const priestTo = (booking.priest?.email || '').trim() || undefined;
        const adminTo = await this.getAdminRecipients();
        await this.sendIf({ to: userTo, subject: 'Your booking is confirmed', template: 'booking/booking-user', context: ctx });
        await this.sendIf({ to: priestTo, subject: `New booking assigned: ${booking.pooja?.name || ''}`, template: 'booking/booking-priest', context: ctx });
        await this.sendIf({ to: adminTo, subject: `New booking #${booking.id} - ${booking.pooja?.name || 'Pooja'}`, template: 'booking/booking-admin', context: ctx });
    }
    async sendBookingUpdated(bookingId) {
        const booking = await this.prisma.booking.findUnique({
            where: { id: bookingId },
            include: { pooja: true, priest: true, user: true },
        });
        if (!booking)
            return;
        const ctx = {
            bookingId: booking.id,
            status: booking.status,
            poojaName: booking.pooja?.name,
            priestName: booking.priest?.name || '',
            userName: booking.userName || booking.user?.email || 'Devotee',
            userEmail: booking.userEmail || booking.user?.email || '',
            userPhone: booking.userPhone || '',
            bookingDateText: toDateText(booking.bookingDate),
            startTimeText: toTimeText(booking.start),
            endTimeText: toTimeText(booking.end),
            venueText: venueLine(booking.venueAddress, booking.venueState, booking.venueZip),
            manageUrl: `${APP_URL}/my/bookings/${booking.id}`,
            adminUrl: `${APP_URL}/admin/bookings/${booking.id}`,
        };
        const userTo = (booking.userEmail || booking.user?.email || '').trim() || undefined;
        const priestTo = (booking.priest?.email || '').trim() || undefined;
        const adminTo = await this.getAdminRecipients();
        await this.sendIf({ to: userTo, subject: 'Your booking was updated', template: 'booking/booking-updated-user', context: ctx });
        await this.sendIf({ to: priestTo, subject: 'A booking assigned to you was updated', template: 'booking/booking-updated-priest', context: ctx });
        await this.sendIf({ to: adminTo, subject: `Booking #${booking.id} updated`, template: 'booking/booking-updated-admin', context: ctx });
    }
    async sendBookingCanceled(bookingId) {
        const booking = await this.prisma.booking.findUnique({
            where: { id: bookingId },
            include: { pooja: true, priest: true, user: true },
        });
        if (!booking)
            return;
        const ctx = {
            bookingId: booking.id,
            status: booking.status,
            poojaName: booking.pooja?.name,
            priestName: booking.priest?.name || '',
            userName: booking.userName || booking.user?.email || 'Devotee',
            userEmail: booking.userEmail || booking.user?.email || '',
            userPhone: booking.userPhone || '',
            bookingDateText: toDateText(booking.bookingDate),
            startTimeText: toTimeText(booking.start),
            endTimeText: toTimeText(booking.end),
            venueText: venueLine(booking.venueAddress, booking.venueState, booking.venueZip),
            manageUrl: `${APP_URL}/my/bookings/${booking.id}`,
            adminUrl: `${APP_URL}/admin/bookings/${booking.id}`,
        };
        const userTo = (booking.userEmail || booking.user?.email || '').trim() || undefined;
        const priestTo = (booking.priest?.email || '').trim() || undefined;
        const adminTo = await this.getAdminRecipients();
        await this.sendIf({ to: userTo, subject: 'Your booking was canceled', template: 'booking/booking-canceled-user', context: ctx });
        await this.sendIf({ to: priestTo, subject: 'A booking assigned to you was canceled', template: 'booking/booking-canceled-priest', context: ctx });
        await this.sendIf({ to: adminTo, subject: `Booking #${booking.id} canceled`, template: 'booking/booking-canceled-admin', context: ctx });
    }
    // ─────────────────────────────────────────────
    // EVENTS — event booking confirmations
    // ─────────────────────────────────────────────
    /**
     * Notify on new EventBooking
     */
    async sendEventBookingCreated(eventBookingId) {
        const eb = await this.prisma.eventBooking.findUnique({
            where: { id: eventBookingId },
            include: { event: true, user: true },
        });
        if (!eb) {
            this.logger.warn(`EventBooking ${eventBookingId} not found`);
            return;
        }
        const event = eb.event;
        const userName = eb.userName || eb.user?.email || 'Attendee';
        const userEmail = eb.userEmail || eb.user?.email || '';
        const userPhone = eb.userPhone || '';
        const eventDateText = toDateText(event?.date);
        const startText = toTimeText(event?.startTime);
        const endText = toTimeText(event?.endTime);
        const eventTimeText = startText && endText ? `${startText} – ${endText}` : (startText || '');
        const venue = event?.venue || 'TBA';
        const ticketsText = eb.pax ? `${eb.pax} ${eb.pax > 1 ? 'tickets' : 'ticket'}` : '';
        const priceText = event?.price != null ? `${event.price} ${process.env.CURRENCY || 'INR'}` : '';
        const ctx = {
            eventBookingId: eb.id,
            eventName: event?.name || 'Event',
            eventDateText,
            eventTimeText,
            venue,
            userName,
            userEmail,
            userPhone,
            ticketsText,
            priceText,
            eventUrl: `${APP_URL}/events/${event?.id || ''}`,
            adminUrl: `${APP_URL}/admin/events/${event?.id || ''}`,
            appName: APP_NAME,
            appUrl: APP_URL,
            year: new Date().getFullYear(),
        };
        const userTo = userEmail.trim() || undefined;
        const adminTo = await this.getAdminRecipients();
        // Optional organizer email (from Settings.organizerEmails or ENV)
        const organizerTo = (process.env.EVENTS_NOTIFY_EMAILS || '')
            .split(',').map(s => s.trim()).filter(Boolean);
        await this.sendIf({ to: userTo, subject: 'Your event booking is confirmed', template: 'event/event-booking-user', context: ctx });
        await this.sendIf({ to: adminTo, subject: `New event booking #${eb.id} - ${event?.name || 'Event'}`, template: 'event/event-booking-admin', context: ctx });
        await this.sendIf({ to: organizerTo, subject: `New attendee for ${event?.name || 'Event'}`, template: 'event/event-booking-organizer', context: ctx });
    }
    // ─────────────────────────────────────────────
    // EVENTS — updated / canceled
    // ─────────────────────────────────────────────
    async sendEventBookingUpdated(eventBookingId) {
        const eb = await this.prisma.eventBooking.findUnique({
            where: { id: eventBookingId },
            include: { event: true, user: true },
        });
        if (!eb)
            return;
        const event = eb.event;
        const userName = eb.userName || eb.user?.email || 'Attendee';
        const userEmail = eb.userEmail || eb.user?.email || '';
        const userPhone = eb.userPhone || '';
        const eventDateText = toDateText(event?.date);
        const startText = toTimeText(event?.startTime);
        const endText = toTimeText(event?.endTime);
        const eventTimeText = startText && endText ? `${startText} – ${endText}` : (startText || '');
        const venue = event?.venue || 'TBA';
        const ticketsText = eb.pax ? `${eb.pax} ${eb.pax > 1 ? 'tickets' : 'ticket'}` : '';
        const priceText = event?.price != null ? `${event.price} ${process.env.CURRENCY || 'INR'}` : '';
        const ctx = {
            eventBookingId: eb.id,
            eventName: event?.name || 'Event',
            eventDateText, eventTimeText, venue,
            userName, userEmail, userPhone,
            ticketsText, priceText,
            eventUrl: `${APP_URL}/events/${event?.id || ''}`,
            adminUrl: `${APP_URL}/admin/events/${event?.id || ''}`,
        };
        const userTo = userEmail.trim() || undefined;
        const adminTo = await this.getAdminRecipients();
        await this.sendIf({ to: userTo, subject: 'Your event booking was updated', template: 'event/event-booking-user', context: ctx });
        await this.sendIf({ to: adminTo, subject: `Event booking #${eb.id} updated - ${event?.name || 'Event'}`, template: 'event/event-booking-admin', context: ctx });
    }
    async sendEventBookingCanceled(eventBookingId) {
        const eb = await this.prisma.eventBooking.findUnique({
            where: { id: eventBookingId },
            include: { event: true, user: true },
        });
        if (!eb)
            return;
        const event = eb.event;
        const userName = eb.userName || eb.user?.email || 'Attendee';
        const userEmail = eb.userEmail || eb.user?.email || '';
        const userPhone = eb.userPhone || '';
        const eventDateText = toDateText(event?.date);
        const startText = toTimeText(event?.startTime);
        const endText = toTimeText(event?.endTime);
        const eventTimeText = startText && endText ? `${startText} – ${endText}` : (startText || '');
        const venue = event?.venue || 'TBA';
        const ctx = {
            eventBookingId: eb.id,
            eventName: event?.name || 'Event',
            eventDateText, eventTimeText, venue,
            userName, userEmail, userPhone,
            eventUrl: `${APP_URL}/events/${event?.id || ''}`,
            adminUrl: `${APP_URL}/admin/events/${event?.id || ''}`,
        };
        const userTo = userEmail.trim() || undefined;
        const adminTo = await this.getAdminRecipients();
        // Reuse same templates with different subjects (or create event-booking-canceled-*.hbs if you want distinct copy)
        await this.sendIf({ to: userTo, subject: 'Your event booking was canceled', template: 'event/event-booking-user', context: ctx });
        await this.sendIf({ to: adminTo, subject: `Event booking #${eb.id} canceled - ${event?.name || 'Event'}`, template: 'event/event-booking-admin', context: ctx });
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = NotificationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mailer_1.MailerService,
        prisma_service_1.PrismaService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map