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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleUsersController = void 0;
const common_1 = require("@nestjs/common");
const role_users_service_1 = require("./role-users.service");
const assign_user_dto_1 = require("./dto/assign-user.dto");
let RoleUsersController = class RoleUsersController {
    constructor(svc) {
        this.svc = svc;
    }
    findAll(roleId) {
        return this.svc.findByRole(roleId);
    }
    assign(roleId, { userId }) {
        return this.svc.assign(roleId, userId);
    }
    remove(roleId, userId) {
        return this.svc.remove(roleId, userId);
    }
};
exports.RoleUsersController = RoleUsersController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Param)('roleId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], RoleUsersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Param)('roleId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, assign_user_dto_1.AssignUserDto]),
    __metadata("design:returntype", void 0)
], RoleUsersController.prototype, "assign", null);
__decorate([
    (0, common_1.Delete)(':userId'),
    __param(0, (0, common_1.Param)('roleId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('userId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], RoleUsersController.prototype, "remove", null);
exports.RoleUsersController = RoleUsersController = __decorate([
    (0, common_1.Controller)('roles/:roleId/users'),
    __metadata("design:paramtypes", [role_users_service_1.RoleUsersService])
], RoleUsersController);
//# sourceMappingURL=role-users.controller.js.map