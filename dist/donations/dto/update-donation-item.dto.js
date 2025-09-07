"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateDonationItemDto = void 0;
// src/donations/dto/update-donation-item.dto.ts
const mapped_types_1 = require("@nestjs/mapped-types");
const create_donation_item_dto_1 = require("./create-donation-item.dto");
class UpdateDonationItemDto extends (0, mapped_types_1.PartialType)(create_donation_item_dto_1.CreateDonationItemDto) {
}
exports.UpdateDonationItemDto = UpdateDonationItemDto;
//# sourceMappingURL=update-donation-item.dto.js.map