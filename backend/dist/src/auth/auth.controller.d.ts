import { AuthService } from './auth.service';
import { Request } from 'express';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    register(email: string, password: string): Promise<{
        id: string;
        email: string;
    }>;
    login(email: string, password: string): Promise<{
        access_token: string;
    }>;
    me(req: Request & {
        user: {
            id: string;
        };
    }): Promise<{
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
