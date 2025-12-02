import { Injectable } from '@nestjs/common';
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
      throw new Error('User already exists');
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

    if (!user) throw new Error('Invalid email or password');

    const isValid = await this.validatePassword(password, user.passwordHash);
    if (!isValid) throw new Error('Invalid email or password');

    const token = await this.generateToken(user.id);

    return { access_token: token };
  }
}
