"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateBhajanDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_bhajan_dto_1 = require("./create-bhajan.dto");
class UpdateBhajanDto extends (0, mapped_types_1.PartialType)(create_bhajan_dto_1.CreateBhajanDto) {
}
exports.UpdateBhajanDto = UpdateBhajanDto;
//# sourceMappingURL=update-bhajan.dto.js.map