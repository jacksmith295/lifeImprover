"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = __importStar(require("bcrypt"));
const prisma_service_1 = require("../prisma/prisma.service");
const jwt_1 = require("@nestjs/jwt");
let AuthService = class AuthService {
    prisma;
    jwt;
    constructor(prisma, jwt) {
        this.prisma = prisma;
        this.jwt = jwt;
    }
    async hashPassword(password) {
        return bcrypt.hash(password, 10);
    }
    async validatePassword(password, hash) {
        return bcrypt.compare(password, hash);
    }
    async generateToken(userId) {
        return this.jwt.signAsync({ sub: userId });
    }
    async register(email, password) {
        const existing = await this.prisma.user.findUnique({
            where: { email },
        });
        if (existing) {
            throw new common_1.ConflictException('User already exists');
        }
        const passwordHash = await this.hashPassword(password);
        const user = await this.prisma.user.create({
            data: {
                email,
                passwordHash,
            },
        });
        return {
            id: user.id,
            email: user.email,
        };
    }
    async login(email, password) {
        const user = await this.prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        const isValid = await this.validatePassword(password, user.passwordHash);
        if (!isValid) {
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        const token = await this.generateToken(user.id);
        return { access_token: token };
    }
    async getProfile(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                coins: true,
                xp: true,
                createdAt: true,
                streak: {
                    select: {
                        currentStreak: true,
                        longestStreak: true,
                        lastCompletedDate: true,
                    },
                },
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return user;
    }
    async updateProfile(userId, email) {
        if (email) {
            const existing = await this.prisma.user.findUnique({
                where: { email },
            });
            if (existing && existing.id !== userId) {
                throw new common_1.ConflictException('Email already in use');
            }
        }
        const user = await this.prisma.user.update({
            where: { id: userId },
            data: { ...(email && { email }) },
            select: {
                id: true,
                email: true,
                coins: true,
                xp: true,
                createdAt: true,
                streak: {
                    select: {
                        currentStreak: true,
                        longestStreak: true,
                        lastCompletedDate: true,
                    },
                },
            },
        });
        return user;
    }
    async changePassword(userId, currentPassword, newPassword) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const isValid = await this.validatePassword(currentPassword, user.passwordHash);
        if (!isValid) {
            throw new common_1.BadRequestException('Current password is incorrect');
        }
        const passwordHash = await this.hashPassword(newPassword);
        await this.prisma.user.update({
            where: { id: userId },
            data: { passwordHash },
        });
        return { message: 'Password changed successfully' };
    }
    async deleteAccount(userId) {
        await this.prisma.$transaction([
            this.prisma.task.deleteMany({ where: { userId } }),
            this.prisma.weeklyGoal.deleteMany({ where: { userId } }),
            this.prisma.reward.deleteMany({ where: { userId } }),
            this.prisma.userAchievement.deleteMany({ where: { userId } }),
            this.prisma.streak.deleteMany({ where: { userId } }),
            this.prisma.user.delete({ where: { id: userId } }),
        ]);
        return { message: 'Account deleted successfully' };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map