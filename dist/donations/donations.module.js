"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DonationsModule = void 0;
// src/donations/donations.module.ts
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const donation_item_service_1 = require("./donation-item.service");
const donation_item_controller_1 = require("./donation-item.controller");
const donation_record_service_1 = require("./donation-record.service");
const donation_record_controller_1 = require("./donation-record.controller");
let DonationsModule = class DonationsModule {
};
exports.DonationsModule = DonationsModule;
exports.DonationsModule = DonationsModule = __decorate([
    (0, common_1.Module)({
        controllers: [
            donation_item_controller_1.DonationItemController,
            donation_record_controller_1.DonationRecordController
        ],
        providers: [
            prisma_service_1.PrismaService,
            donation_item_service_1.DonationItemService,
            donation_record_service_1.DonationRecordService
        ],
    })
], DonationsModule);
//# sourceMappingURL=donations.module.js.map