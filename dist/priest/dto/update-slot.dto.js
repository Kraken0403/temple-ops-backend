"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateSlotDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_slot_dto_1 = require("./create-slot.dto");
class UpdateSlotDto extends (0, mapped_types_1.PartialType)(create_slot_dto_1.CreateSlotDto) {
}
exports.UpdateSlotDto = UpdateSlotDto;
//# sourceMappingURL=update-slot.dto.js.map