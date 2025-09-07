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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DonationRecordService = void 0;
// src/donations/donation-record.service.ts
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let DonationRecordService = class DonationRecordService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        const item = await this.ensureItem(dto.donationItemId);
        return this.prisma.donationRecord.create({
            data: {
                donationItemId: dto.donationItemId,
                donorName: dto.donorName,
                donorEmail: dto.donorEmail,
                donorPhone: dto.donorPhone,
                amountAtDonation: item.amount, // snapshot
                itemNameAtDonation: item.name, // snapshot
            },
            include: { donationItem: true },
        });
    }
    findAll() {
        return this.prisma.donationRecord.findMany({
            include: { donationItem: true },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id) {
        const rec = await this.prisma.donationRecord.findUnique({
            where: { id },
            include: { donationItem: true },
        });
        if (!rec)
            throw new common_1.NotFoundException('Donation record not found');
        return rec;
    }
    async update(id, dto) {
        await this.findOne(id); // ensures record exists
        const data = {
            donorName: dto.donorName ?? undefined,
            donorEmail: dto.donorEmail ?? undefined,
            donorPhone: dto.donorPhone ?? undefined,
        };
        // if item changed, resnapshot
        if (dto.donationItemId) {
            const item = await this.ensureItem(dto.donationItemId);
            data.donationItemId = dto.donationItemId;
            data.amountAtDonation = item.amount;
            data.itemNameAtDonation = item.name;
        }
        return this.prisma.donationRecord.update({
            where: { id },
            data,
            include: { donationItem: true },
        });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.donationRecord.delete({ where: { id } });
    }
    async ensureItem(donationItemId) {
        const item = await this.prisma.donationItem.findUnique({
            where: { id: donationItemId },
        });
        if (!item)
            throw new common_1.NotFoundException('Donation item not found');
        return item;
    }
};
exports.DonationRecordService = DonationRecordService;
exports.DonationRecordService = DonationRecordService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DonationRecordService);
//# sourceMappingURL=donation-record.service.js.map