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
exports.CreatePoojaJsonDto = void 0;
// src/pooja/dto/create-pooja-json.dto.ts
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class CreatePoojaJsonDto {
}
exports.CreatePoojaJsonDto = CreatePoojaJsonDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePoojaJsonDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({}, { each: true }),
    __metadata("design:type", Array)
], CreatePoojaJsonDto.prototype, "priestIds", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreatePoojaJsonDto.prototype, "amount", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreatePoojaJsonDto.prototype, "durationMin", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreatePoojaJsonDto.prototype, "prepTimeMin", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreatePoojaJsonDto.prototype, "bufferMin", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Boolean),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreatePoojaJsonDto.prototype, "isInVenue", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Boolean),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreatePoojaJsonDto.prototype, "isOutsideVenue", void 0);
__decorate([
    (0, class_validator_1.ValidateIf)(o => o.isInVenue),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreatePoojaJsonDto.prototype, "date", void 0);
__decorate([
    (0, class_validator_1.ValidateIf)(o => o.isInVenue),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreatePoojaJsonDto.prototype, "time", void 0);
__decorate([
    (0, class_validator_1.ValidateIf)(o => o.isInVenue),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePoojaJsonDto.prototype, "venueAddress", void 0);
__decorate([
    (0, class_validator_1.ValidateIf)(o => o.isInVenue),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePoojaJsonDto.prototype, "mapLink", void 0);
__decorate([
    (0, class_validator_1.ValidateIf)(o => o.isOutsideVenue),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreatePoojaJsonDto.prototype, "allowedZones", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Boolean),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreatePoojaJsonDto.prototype, "includeFood", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Boolean),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreatePoojaJsonDto.prototype, "includeHall", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePoojaJsonDto.prototype, "materials", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePoojaJsonDto.prototype, "notes", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePoojaJsonDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePoojaJsonDto.prototype, "photoUrl", void 0);
//# sourceMappingURL=create-pooja-json.dto.js.map