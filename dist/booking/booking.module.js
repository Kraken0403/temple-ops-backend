"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingModule = void 0;
// src/booking/booking.module.ts
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const booking_service_1 = require("./booking.service");
const booking_controller_1 = require("./booking.controller");
const notifications_module_1 = require("../notifications/notifications.module");
const coupons_module_1 = require("../coupons/coupons.module"); // ✅ add this
const distance_service_1 = require("../common/distance.service");
let BookingModule = class BookingModule {
};
exports.BookingModule = BookingModule;
exports.BookingModule = BookingModule = __decorate([
    (0, common_1.Module)({
        imports: [notifications_module_1.NotificationsModule, coupons_module_1.CouponsModule], // ✅ include it
        providers: [booking_service_1.BookingService, prisma_service_1.PrismaService, distance_service_1.DistanceService],
        controllers: [booking_controller_1.BookingController],
    })
], BookingModule);
//# sourceMappingURL=booking.module.js.map