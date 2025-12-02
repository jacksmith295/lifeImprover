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
exports.StreaksController = void 0;
const common_1 = require("@nestjs/common");
const streaks_service_1 = require("./streaks.service");
const jwt_guard_1 = require("../auth/jwt/jwt.guard");
let StreaksController = class StreaksController {
    streaksService;
    constructor(streaksService) {
        this.streaksService = streaksService;
    }
    async getStreak(req) {
        return this.streaksService.getStreak(req.user.id);
    }
    async getStreakStatus(req) {
        return this.streaksService.getStreakStatus(req.user.id);
    }
    async getStreakMilestones(req) {
        return this.streaksService.getStreakMilestones(req.user.id);
    }
    async resetStreak(req) {
        return this.streaksService.resetStreak(req.user.id);
    }
};
exports.StreaksController = StreaksController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StreaksController.prototype, "getStreak", null);
__decorate([
    (0, common_1.Get)('status'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StreaksController.prototype, "getStreakStatus", null);
__decorate([
    (0, common_1.Get)('milestones'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StreaksController.prototype, "getStreakMilestones", null);
__decorate([
    (0, common_1.Post)('reset'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StreaksController.prototype, "resetStreak", null);
exports.StreaksController = StreaksController = __decorate([
    (0, common_1.Controller)('streaks'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [streaks_service_1.StreaksService])
], StreaksController);
//# sourceMappingURL=streaks.controller.js.map