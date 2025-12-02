import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
export declare class AuthService {
    private prisma;
    private jwt;
    constructor(prisma: PrismaService, jwt: JwtService);
    hashPassword(password: string): Promise<string>;
    validatePassword(password: string, hash: string): Promise<boolean>;
    private generateToken;
    register(email: string, password: string): Promise<{
        id: string;
        email: string;
    }>;
    login(email: string, password: string): Promise<{
        access_token: string;
    }>;
    getProfile(userId: string): Promise<{
        id: string;
        email: string;
        coins: number;
        xp: number;
        createdAt: Date;
        streak: {
            currentStreak: number;
            longestStreak: number;
            lastCompletedDate: Date | null;
        } | null;
    }>;
}
