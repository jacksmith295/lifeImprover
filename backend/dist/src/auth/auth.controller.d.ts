import { AuthService } from './auth.service';
import { Request } from 'express';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto): Promise<{
        id: string;
        email: string;
    }>;
    login(dto: LoginDto): Promise<{
        access_token: string;
    }>;
    me(req: Request & {
        user: {
            id: string;
        };
    }): Promise<{
        id: string;
        streak: {
            currentStreak: number;
            longestStreak: number;
            lastCompletedDate: Date | null;
        } | null;
        email: string;
        coins: number;
        xp: number;
        createdAt: Date;
    }>;
    updateProfile(req: Request & {
        user: {
            id: string;
        };
    }, dto: UpdateProfileDto): Promise<{
        id: string;
        streak: {
            currentStreak: number;
            longestStreak: number;
            lastCompletedDate: Date | null;
        } | null;
        email: string;
        coins: number;
        xp: number;
        createdAt: Date;
    }>;
    changePassword(req: Request & {
        user: {
            id: string;
        };
    }, dto: ChangePasswordDto): Promise<{
        message: string;
    }>;
    deleteAccount(req: Request & {
        user: {
            id: string;
        };
    }): Promise<{
        message: string;
    }>;
}
