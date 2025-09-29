// src/notifications/notifications.service.ts
import { Injectable, Logger } from '@nestjs/common'
import { MailerService } from '@nestjs-modules/mailer'
import { PrismaService } from '../prisma.service'
import { TimezoneUtil } from '../common/timezone.util'

const APP_NAME = process.env.APP_NAME || 'Booking'
const APP_URL  = process.env.APP_URL  || 'https://example.com'

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name)
  private tzUtil: TimezoneUtil

  constructor(
    private readonly mailer: MailerService,
    private readonly prisma: PrismaService,
  ) {
    this.tzUtil = new TimezoneUtil(this.prisma)
  }

  private settingsCache: { currency: string; timezone: string } | null = null
  private async getSettings() {
    if (this.settingsCache) return this.settingsCache
    const settings = await this.prisma.settings.findUnique({ where: { id: 1 } })
    this.settingsCache = {
      currency: settings?.currency || process.env.CURRENCY || 'INR',
      timezone: settings?.timezone || 'Asia/Kolkata',
    }
    return this.settingsCache
  }

  private async buildBookingCtx(booking: any) {
    const settings = await this.getSettings()

    const bookingDateText = await this.tzUtil.format(booking.bookingDate, 'EEE, dd LLL yyyy')
    const startTimeText   = await this.tzUtil.format(booking.start, 'hh:mm a')
    const endTimeText     = await this.tzUtil.format(booking.end, 'hh:mm a')

    return {
      bookingId: booking.id,
      status: booking.status,
      poojaName: booking.poojaNameAtBooking || booking.pooja?.name,
      priestName: booking.priestNameAtBooking || booking.priest?.name || '',

      userName: booking.userName || booking.user?.email || 'Devotee',
      userEmail: booking.userEmail || booking.user?.email || '',
      userPhone: booking.userPhone || '',

      bookingDateText,
      startTimeText,
      endTimeText,

      venueText: this.venueLine(booking.venueAddress, booking.venueState, booking.venueZip),

      amount: booking.amountAtBooking,
      currency: settings.currency,

      durationMin: booking.pooja?.durationMin,
      prepTimeMin: booking.pooja?.prepTimeMin,
      bufferMin: booking.pooja?.bufferMin,
      includeFood: booking.pooja?.includeFood,
      includeHall: booking.pooja?.includeHall,
      materials: booking.pooja?.materials,
      notes: booking.pooja?.notes,

      manageUrl: `${APP_URL}/my/bookings/${booking.id}`,
      adminUrl:  `${APP_URL}/admin/bookings/${booking.id}`,

      appName: APP_NAME,
      appUrl: APP_URL,
      year: new Date().getFullYear(),
    }
  }

  private venueLine(addr?: string|null, state?: string|null, zip?: string|null) {
    const parts = [addr?.trim(), state?.trim(), zip?.trim()].filter(Boolean)
    return parts.join(', ')
  }

  private async getAdminRecipients(): Promise<string[]> {
    try {
      const settings = await this.prisma.settings.findUnique({ where: { id: 1 } })
      const arr = (settings as any)?.notificationEmails
      if (Array.isArray(arr)) {
        return arr.filter(x => typeof x === 'string' && x.trim().length > 0)
      }
    } catch (err) {
      this.logErr('Failed to read Settings.notificationEmails', err)
    }
    const envList = process.env.ADMIN_EMAILS || ''
    return envList.split(',').map(s => s.trim()).filter(Boolean)
  }

  private async sendIf(opts: {
    to?: string | string[],
    subject: string,
    template: string,
    context: Record<string, any>,
    html?: string,
  }) {
    const to = Array.isArray(opts.to)
      ? opts.to.filter(e => typeof e === 'string' && e.trim().length > 0)
      : (typeof opts.to === 'string' && opts.to.trim().length > 0 ? opts.to : undefined)

    if (!to) {
      this.logger.warn(`Skipped email (no recipient) for subject="${opts.subject}"`)
      return
    }
    try {
      await this.mailer.sendMail({
        to,
        subject: opts.subject,
        template: opts.template,
        context: opts.context,
        html: opts.html,
      })
    } catch (e) {
      this.logErr('Email send failed', e)
    }
  }

  private logErr(prefix: string, e: unknown) {
    if (e && typeof e === 'object') {
      const anyErr = e as { stack?: string; message?: string }
      this.logger.error(prefix, anyErr.stack || anyErr.message)
    } else {
      this.logger.error(`${prefix}: ${String(e)}`)
    }
  }

  // ─────────────────────────────────────────────
  // BOOKINGS (Poojas)
  // ─────────────────────────────────────────────

  async sendBookingCreated(bookingId: number) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        pooja: {
          select: {
            name: true,
            durationMin: true,
            prepTimeMin: true,
            bufferMin: true,
            includeFood: true,
            includeHall: true,
            materials: true,
            notes: true,
          },
        },
        priest: true,
        user: true,
      },
    })
    if (!booking) return
    this.logger.debug('Booking Pooja Data:', booking.pooja)

    const ctx = await this.buildBookingCtx(booking)
  
    const userTo   = (booking.userEmail || booking.user?.email || '').trim() || undefined
    const priestTo = (booking.priest?.email || '').trim() || undefined
    const adminTo  = await this.getAdminRecipients()
  
    await this.sendIf({ to: userTo,   subject: 'Your booking is confirmed', template: 'booking/booking-user',   context: ctx })
    await this.sendIf({ to: priestTo, subject: `New booking assigned: ${ctx.poojaName}`, template: 'booking/booking-priest', context: ctx })
    await this.sendIf({ to: adminTo,  subject: `New booking #${ctx.bookingId} - ${ctx.poojaName}`, template: 'booking/booking-admin', context: ctx })
  }
  

  async sendBookingUpdated(bookingId: number) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        pooja: {
          select: {
            name: true,
            durationMin: true,
            prepTimeMin: true,
            bufferMin: true,
            includeFood: true,
            includeHall: true,
            materials: true,
            notes: true,
          },
        },
        priest: true,
        user: true,
      },
    })
    if (!booking) return
  
    const ctx = await this.buildBookingCtx(booking)
  
    const userTo   = (booking.userEmail || booking.user?.email || '').trim() || undefined
    const priestTo = (booking.priest?.email || '').trim() || undefined
    const adminTo  = await this.getAdminRecipients()
  
    await this.sendIf({ to: userTo,   subject: 'Your booking was updated', template: 'booking/booking-updated-user',   context: ctx })
    await this.sendIf({ to: priestTo, subject: 'A booking assigned to you was updated', template: 'booking/booking-updated-priest', context: ctx })
    await this.sendIf({ to: adminTo,  subject: `Booking #${ctx.bookingId} updated`, template: 'booking/booking-updated-admin', context: ctx })
  }
  

  async sendBookingCanceled(bookingId: number) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        pooja: {
          select: {
            name: true,
            durationMin: true,
            prepTimeMin: true,
            bufferMin: true,
            includeFood: true,
            includeHall: true,
            materials: true,
            notes: true,
          },
        },
        priest: true,
        user: true,
      },
    })
    if (!booking) return
  
    const ctx = await this.buildBookingCtx(booking)
  
    const userTo   = (booking.userEmail || booking.user?.email || '').trim() || undefined
    const priestTo = (booking.priest?.email || '').trim() || undefined
    const adminTo  = await this.getAdminRecipients()
  
    await this.sendIf({ to: userTo,   subject: 'Your booking was canceled', template: 'booking/booking-canceled-user',   context: ctx })
    await this.sendIf({ to: priestTo, subject: 'A booking assigned to you was canceled', template: 'booking/booking-canceled-priest', context: ctx })
    await this.sendIf({ to: adminTo,  subject: `Booking #${ctx.bookingId} canceled`, template: 'booking/booking-canceled-admin', context: ctx })
  }
  

// ─────────────────────────────────────────────
// EVENTS
// ─────────────────────────────────────────────

async sendEventBookingCreated(eventBookingId: number) {
  const eb = await this.prisma.eventBooking.findUnique({
    where: { id: eventBookingId },
    include: { event: { include: { venueRel: true } }, user: true },
  })
  if (!eb) return

  const settings = await this.getSettings()
  const event = eb.event

  const eventDateText = await this.tzUtil.format(event?.date, 'EEE, dd LLL yyyy')
  const startText     = event?.startTime ? await this.tzUtil.format(event.startTime, 'hh:mm a') : ''
  const endText       = event?.endTime ? await this.tzUtil.format(event.endTime, 'hh:mm a') : ''
  const eventTimeText = startText && endText ? `${startText} – ${endText}` : startText || ''

  const venueText = event?.venueRel?.title || event?.venueRel?.address || event?.venue || 'TBA'

  const ctx = {
    eventBookingId: eb.id,
    eventName: event?.name || 'Event',
    eventDateText,
    eventTimeText,
    venue: venueText,

    userName: eb.userName || eb.user?.email || 'Attendee',
    userEmail: eb.userEmail || eb.user?.email || '',
    userPhone: eb.userPhone || '',

    ticketsText: eb.pax ? `${eb.pax} ${eb.pax > 1 ? 'tickets' : 'ticket'}` : '',
    priceText: event?.price != null ? `${event.price} ${settings.currency}` : '',

    eventUrl: `${APP_URL}/events/${event?.id || ''}`,
    adminUrl: `${APP_URL}/admin/events/${event?.id || ''}`,

    appName: APP_NAME,
    appUrl: APP_URL,
    year: new Date().getFullYear(),
  }

  const userTo  = ctx.userEmail?.trim() || undefined
  const adminTo = await this.getAdminRecipients()
  const organizerTo = (process.env.EVENTS_NOTIFY_EMAILS || '')
    .split(',').map(s => s.trim()).filter(Boolean)

  await this.sendIf({ to: userTo,      subject: 'Your event booking is confirmed', template: 'event/booking-event-user', context: ctx })
  await this.sendIf({ to: adminTo,     subject: `New event booking #${eb.id} - ${ctx.eventName}`, template: 'event/booking-event-admin', context: ctx })
  await this.sendIf({ to: organizerTo, subject: `New attendee for ${ctx.eventName}`, template: 'event/booking-event-organizer', context: ctx })
}

async sendEventBookingUpdated(eventBookingId: number) {
  const eb = await this.prisma.eventBooking.findUnique({
    where: { id: eventBookingId },
    include: { event: { include: { venueRel: true } }, user: true },
  })
  if (!eb) return

  const settings = await this.getSettings()
  const event = eb.event

  const eventDateText = await this.tzUtil.format(event?.date, 'EEE, dd LLL yyyy')
  const startText     = event?.startTime ? await this.tzUtil.format(event.startTime, 'hh:mm a') : ''
  const endText       = event?.endTime ? await this.tzUtil.format(event.endTime, 'hh:mm a') : ''
  const eventTimeText = startText && endText ? `${startText} – ${endText}` : startText || ''

  const venueText = event?.venueRel?.title || event?.venueRel?.address || event?.venue || 'TBA'

  const ctx = {
    eventBookingId: eb.id,
    eventName: event?.name || 'Event',
    eventDateText,
    eventTimeText,
    venue: venueText,

    userName: eb.userName || eb.user?.email || 'Attendee',
    userEmail: eb.userEmail || eb.user?.email || '',
    userPhone: eb.userPhone || '',

    ticketsText: eb.pax ? `${eb.pax} ${eb.pax > 1 ? 'tickets' : 'ticket'}` : '',
    priceText: event?.price != null ? `${event.price} ${settings.currency}` : '',

    eventUrl: `${APP_URL}/events/${event?.id || ''}`,
    adminUrl: `${APP_URL}/admin/events/${event?.id || ''}`,

    appName: APP_NAME,
    appUrl: APP_URL,
    year: new Date().getFullYear(),
  }

  const userTo  = ctx.userEmail?.trim() || undefined
  const adminTo = await this.getAdminRecipients()

  await this.sendIf({ to: userTo,  subject: 'Your event booking was updated', template: 'event/booking-event-updated-user', context: ctx })
  await this.sendIf({ to: adminTo, subject: `Event booking #${eb.id} updated - ${ctx.eventName}`, template: 'event/booking-event-updated-admin', context: ctx })
}

async sendEventBookingCanceled(eventBookingId: number) {
  const eb = await this.prisma.eventBooking.findUnique({
    where: { id: eventBookingId },
    include: { event: { include: { venueRel: true } }, user: true },
  })
  if (!eb) return

  const settings = await this.getSettings()
  const event = eb.event

  const eventDateText = await this.tzUtil.format(event?.date, 'EEE, dd LLL yyyy')
  const startText     = event?.startTime ? await this.tzUtil.format(event.startTime, 'hh:mm a') : ''
  const endText       = event?.endTime ? await this.tzUtil.format(event.endTime, 'hh:mm a') : ''
  const eventTimeText = startText && endText ? `${startText} – ${endText}` : startText || ''

  const venueText = event?.venueRel?.title || event?.venueRel?.address || event?.venue || 'TBA'

  const ctx = {
    eventBookingId: eb.id,
    eventName: event?.name || 'Event',
    eventDateText,
    eventTimeText,
    venue: venueText,

    userName: eb.userName || eb.user?.email || 'Attendee',
    userEmail: eb.userEmail || eb.user?.email || '',
    userPhone: eb.userPhone || '',

    eventUrl: `${APP_URL}/events/${event?.id || ''}`,
    adminUrl: `${APP_URL}/admin/events/${event?.id || ''}`,

    appName: APP_NAME,
    appUrl: APP_URL,
    year: new Date().getFullYear(),
  }

  const userTo  = ctx.userEmail?.trim() || undefined
  const adminTo = await this.getAdminRecipients()

  await this.sendIf({ to: userTo,  subject: 'Your event booking was canceled', template: 'event/booking-event-canceled-user', context: ctx })
  await this.sendIf({ to: adminTo, subject: `Event booking #${eb.id} canceled - ${ctx.eventName}`, template: 'event/booking-event-canceled-admin', context: ctx })
}

// ─────────────────────────────────────────────
// SPONSORSHIPS
// ─────────────────────────────────────────────
async sendSponsorshipBooked(bookingId: number) {
  const booking = await this.prisma.sponsorshipBooking.findUnique({
    where: { id: bookingId },
    include: { eventSponsorship: { include: { sponsorshipType: true, event: true } } },
  })
  if (!booking) return

  const settings = await this.getSettings()
  const ctx = {
    sponsorshipId: booking.id,
    sponsorshipType: booking.eventSponsorship?.sponsorshipType?.name || 'Sponsorship',
    eventName: booking.eventSponsorship?.event?.name || 'Event',
    sponsorName: booking.sponsorName || 'Sponsor',
    sponsorEmail: booking.sponsorEmail || '',
    sponsorPhone: booking.sponsorPhone || '',
    amount: booking.eventSponsorship?.price || 0,
    currency: settings.currency,

    appName: APP_NAME,
    appUrl: APP_URL,
    adminUrl: `${APP_URL}/admin/sponsorships/${booking.id}`,
  }

  const userTo  = ctx.sponsorEmail?.trim() || undefined
  const adminTo = await this.getAdminRecipients()

  await this.sendIf({
    to: userTo,
    subject: 'Your Sponsorship is Confirmed',
    template: 'sponsorship/booking-sponsorship-user',
    context: ctx,
  })

  await this.sendIf({
    to: adminTo,
    subject: `New Sponsorship for ${ctx.eventName}`,
    template: 'sponsorship/booking-sponsorship-admin',
    context: ctx,
  })
}

// ─────────────────────────────────────────────
// DONATIONS
// ─────────────────────────────────────────────
async sendDonationReceived(donationId: number) {
  const donation = await this.prisma.donationRecord.findUnique({
    where: { id: donationId },
    include: { donationItem: true },
  });
  if (!donation) return;

  const settings = await this.getSettings();

  const ctx = {
    donorName: donation.donorName,
    donorEmail: donation.donorEmail,
    donorPhone: donation.donorPhone,
    donationName: donation.donationItem?.name || donation.itemNameAtDonation,
    amountText: donation.amountAtDonation
      ? `${donation.amountAtDonation} ${settings.currency}`
      : 'Free',
    appName: APP_NAME,
    appUrl: APP_URL,
    adminUrl: `${APP_URL}/admin/donations/${donation.id}`,
  };

  const userTo = ctx.donorEmail?.trim() || undefined;
  const adminTo = await this.getAdminRecipients();

  // 👤 User email
  await this.sendIf({
    to: userTo,
    subject: `Thank You for Your Donation`,
    template: 'donation/booking-donation-user',
    context: ctx,
  });

  // 👥 Admin email
  await this.sendIf({
    to: adminTo,
    subject: `New Donation: ${ctx.donationName}`,
    template: 'donation/booking-donation-admin',
    context: ctx,
  });
}


}
