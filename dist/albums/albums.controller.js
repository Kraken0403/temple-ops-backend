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
exports.AlbumsController = void 0;
const common_1 = require("@nestjs/common");
const albums_service_1 = require("./albums.service");
const create_album_dto_1 = require("./dtos/create-album.dto");
const update_album_dto_1 = require("./dtos/update-album.dto");
const add_items_dto_1 = require("./dtos/add-items.dto");
const reorder_items_dto_1 = require("./dtos/reorder-items.dto");
const list_query_dto_1 = require("../shared/dtos/list-query.dto");
let AlbumsController = class AlbumsController {
    constructor(service) {
        this.service = service;
    }
    list(q) { return this.service.list(q); }
    bySlug(slug) { return this.service.bySlug(slug); }
    create(dto) { return this.service.create(dto); }
    update(id, dto) { return this.service.update(+id, dto); }
    remove(id) { return this.service.remove(+id); }
    addItems(id, dto) { return this.service.addItems(+id, dto.mediaIds); }
    reorder(id, dto) { return this.service.reorder(+id, dto.order); }
    removeItem(id, itemId) { return this.service.removeItem(+id, +itemId); }
};
exports.AlbumsController = AlbumsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [list_query_dto_1.ListQueryDto]),
    __metadata("design:returntype", void 0)
], AlbumsController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':slug'),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AlbumsController.prototype, "bySlug", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_album_dto_1.CreateAlbumDto]),
    __metadata("design:returntype", void 0)
], AlbumsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_album_dto_1.UpdateAlbumDto]),
    __metadata("design:returntype", void 0)
], AlbumsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AlbumsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/items'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, add_items_dto_1.AddItemsDto]),
    __metadata("design:returntype", void 0)
], AlbumsController.prototype, "addItems", null);
__decorate([
    (0, common_1.Patch)(':id/items/reorder'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, reorder_items_dto_1.ReorderItemsDto]),
    __metadata("design:returntype", void 0)
], AlbumsController.prototype, "reorder", null);
__decorate([
    (0, common_1.Delete)(':id/items/:itemId'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('itemId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AlbumsController.prototype, "removeItem", null);
exports.AlbumsController = AlbumsController = __decorate([
    (0, common_1.Controller)('albums'),
    __metadata("design:paramtypes", [albums_service_1.AlbumsService])
], AlbumsController);
//# sourceMappingURL=albums.controller.js.map