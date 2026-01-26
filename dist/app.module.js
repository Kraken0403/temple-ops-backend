"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
// src/app.module.ts
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("./prisma/prisma.module");
const serve_static_1 = require("@nestjs/serve-static");
const path = require("path");
// import { PrismaService } from './prisma.service';
const pooja_module_1 = require("./pooja/pooja.module");
const priest_module_1 = require("./priest/priest.module");
const booking_module_1 = require("./booking/booking.module");
const auth_module_1 = require("./auth/auth.module");
const events_module_1 = require("./events/events.module");
const donations_module_1 = require("./donations/donations.module");
const sponsorship_module_1 = require("./sponsorship/sponsorship.module");
const settings_module_1 = require("./settings/settings.module");
const users_module_1 = require("./users/users.module");
const roles_module_1 = require("./roles/roles.module");
const permissions_module_1 = require("./permissions/permissions.module");
const role_permissions_module_1 = require("./role-permissions/role-permissions.module");
const role_users_module_1 = require("./role-users/role-users.module");
const static_pages_module_1 = require("./static-pages/static-pages.module");
const notifications_module_1 = require("./notifications/notifications.module");
const media_module_1 = require("./media/media.module");
const albums_module_1 = require("./albums/albums.module");
const venues_module_1 = require("./venues/venues.module");
const pooja_category_module_1 = require("./pooja-category/pooja-category.module");
const bhajans_module_1 = require("./bhajans/bhajans.module");
const coupons_module_1 = require("./coupons/coupons.module");
const newsletter_module_1 = require("./newsletter/newsletter.module");
const payments_module_1 = require("./payments/payments.module");
const event_occurrences_module_1 = require("./event-occurrences/event-occurrences.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [serve_static_1.ServeStaticModule.forRoot({
                rootPath: path.join(process.cwd(), 'uploads'),
                serveRoot: '/uploads',
            }), prisma_module_1.PrismaModule, event_occurrences_module_1.EventOccurrencesModule, bhajans_module_1.BhajansModule, coupons_module_1.CouponsModule, pooja_category_module_1.PoojaCategoryModule, notifications_module_1.NotificationsModule, role_users_module_1.RoleUsersModule, users_module_1.UsersModule, roles_module_1.RolesModule, auth_module_1.AuthModule, static_pages_module_1.StaticPagesModule, pooja_module_1.PoojaModule, priest_module_1.PriestModule, booking_module_1.BookingModule, events_module_1.EventsModule, donations_module_1.DonationsModule, sponsorship_module_1.SponsorshipModule, settings_module_1.SettingsModule, permissions_module_1.PermissionsModule, role_permissions_module_1.RolePermissionsModule, media_module_1.MediaModule, albums_module_1.AlbumsModule, venues_module_1.VenuesModule, newsletter_module_1.NewsletterModule, payments_module_1.PaymentsModule],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map