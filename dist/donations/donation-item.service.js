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
exports.DonationItemService = void 0;
// src/donations/donation-item.service.ts
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let DonationItemService = class DonationItemService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    create(dto) {
        return this.prisma.donationItem.create({ data: dto });
    }
    findAll() {
        return this.prisma.donationItem.findMany({
            orderBy: { updatedAt: 'desc' }
        });
    }
    findOne(id) {
        return this.prisma.donationItem.findUnique({ where: { id } });
    }
    update(id, dto) {
        return this.prisma.donationItem.update({
            where: { id },
            data: dto
        });
    }
    async remove(id) {
        const count = await this.prisma.donationRecord.count({
            where: { donationItemId: id }
        });
        if (count > 0) {
            // Choose your policy:
            // 1) Block delete:
            throw new common_1.BadRequestException('Cannot delete: donation records exist for this item');
            // 2) Or cascade delete (dangerous, uncomment if you want):
            // await this.prisma.donationRecord.deleteMany({ where: { donationItemId: id } })
        }
        return this.prisma.donationItem.delete({ where: { id } });
    }
};
exports.DonationItemService = DonationItemService;
exports.DonationItemService = DonationItemService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DonationItemService);
//# sourceMappingURL=donation-item.service.js.map