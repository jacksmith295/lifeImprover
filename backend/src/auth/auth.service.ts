import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async validatePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  private async generateToken(userId: string) {
    return this.jwt.signAsync({ sub: userId });
  }

  async register(email: string, password: string) {
    // 1. Check if user exists
    const existing = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      throw new ConflictException('User already exists');
    }

    // 2. Hash password
    const passwordHash = await this.hashPassword(password);

    // 3. Create user in DB
    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
      },
    });

    // 4. Return user (minus hash for safety)
    return {
      id: user.id,
      email: user.email,
    };
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isValid = await this.validatePassword(password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const token = await this.generateToken(user.id);

    return { access_token: token };
  }

  async getProfile(userId: string) {
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
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateProfile(userId: string, email?: string) {
    // Check if email is being changed and if it's already taken
    if (email) {
      const existing = await this.prisma.user.findUnique({
        where: { email },
      });

      if (existing && existing.id !== userId) {
        throw new ConflictException('Email already in use');
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

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify current password
    const isValid = await this.validatePassword(
      currentPassword,
      user.passwordHash,
    );
    if (!isValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Hash and update new password
    const passwordHash = await this.hashPassword(newPassword);

    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    return { message: 'Password changed successfully' };
  }

  async deleteAccount(userId: string) {
    // Delete all user data in a transaction
    await this.prisma.$transaction([
      // Delete related data first (due to foreign key constraints)
      this.prisma.task.deleteMany({ where: { userId } }),
      this.prisma.weeklyGoal.deleteMany({ where: { userId } }),
      this.prisma.reward.deleteMany({ where: { userId } }),
      this.prisma.userAchievement.deleteMany({ where: { userId } }),
      this.prisma.streak.deleteMany({ where: { userId } }),
      // Finally delete the user
      this.prisma.user.delete({ where: { id: userId } }),
    ]);

    return { message: 'Account deleted successfully' };
  }
}
