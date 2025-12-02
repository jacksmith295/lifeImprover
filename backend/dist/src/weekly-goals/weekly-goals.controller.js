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
exports.WeeklyGoalsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_guard_1 = require("../auth/jwt/jwt.guard");
const weekly_goals_service_1 = require("./weekly-goals.service");
const create_weekly_goal_dto_1 = require("./dto/create-weekly-goal.dto");
const update_weekly_goal_dto_1 = require("./dto/update-weekly-goal.dto");
const weekly_goal_query_dto_1 = require("./dto/weekly-goal-query.dto");
let WeeklyGoalsController = class WeeklyGoalsController {
    weeklyGoalsService;
    constructor(weeklyGoalsService) {
        this.weeklyGoalsService = weeklyGoalsService;
    }
    async findAll(req, query) {
        return await this.weeklyGoalsService.findAll(req.user.id, query);
    }
    async findOne(id, req) {
        return await this.weeklyGoalsService.findOne(id, req.user.id);
    }
    async create(dto, req) {
        return await this.weeklyGoalsService.create(req.user.id, dto);
    }
    async update(id, dto, req) {
        return await this.weeklyGoalsService.update(id, req.user.id, dto);
    }
    async delete(id, req) {
        return await this.weeklyGoalsService.delete(id, req.user.id);
    }
    async complete(id, req) {
        return await this.weeklyGoalsService.complete(id, req.user.id);
    }
    async uncomplete(id, req) {
        return await this.weeklyGoalsService.uncomplete(id, req.user.id);
    }
    async claimXp(id, req) {
        return await this.weeklyGoalsService.claimXp(id, req.user.id);
    }
    async claimAllPendingXp(req) {
        return await this.weeklyGoalsService.claimAllPendingXp(req.user.id);
    }
};
exports.WeeklyGoalsController = WeeklyGoalsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, weekly_goal_query_dto_1.WeeklyGoalQueryDto]),
    __metadata("design:returntype", Promise)
], WeeklyGoalsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], WeeklyGoalsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_weekly_goal_dto_1.CreateWeeklyGoalDto, Object]),
    __metadata("design:returntype", Promise)
], WeeklyGoalsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_weekly_goal_dto_1.UpdateWeeklyGoalDto, Object]),
    __metadata("design:returntype", Promise)
], WeeklyGoalsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], WeeklyGoalsController.prototype, "delete", null);
__decorate([
    (0, common_1.Patch)(':id/complete'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], WeeklyGoalsController.prototype, "complete", null);
__decorate([
    (0, common_1.Patch)(':id/uncomplete'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], WeeklyGoalsController.prototype, "uncomplete", null);
__decorate([
    (0, common_1.Post)(':id/claim-xp'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], WeeklyGoalsController.prototype, "claimXp", null);
__decorate([
    (0, common_1.Post)('claim-all-xp'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WeeklyGoalsController.prototype, "claimAllPendingXp", null);
exports.WeeklyGoalsController = WeeklyGoalsController = __decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('weekly-goals'),
    __metadata("design:paramtypes", [weekly_goals_service_1.WeeklyGoalsService])
], WeeklyGoalsController);
//# sourceMappingURL=weekly-goals.controller.js.map