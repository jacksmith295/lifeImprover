import {
  Controller,
  Post,
  Body,
  HttpCode,
  UseGuards,
  Get,
  Patch,
  Delete,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';
import { Request } from 'express';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto.email, dto.password);
  }

  @Post('login')
  @HttpCode(200)
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Req() req: Request & { user: { id: string } }) {
    return await this.authService.getProfile(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updateProfile(
    @Req() req: Request & { user: { id: string } },
    @Body() dto: UpdateProfileDto,
  ) {
    return await this.authService.updateProfile(req.user.id, dto.email);
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  @HttpCode(200)
  async changePassword(
    @Req() req: Request & { user: { id: string } },
    @Body() dto: ChangePasswordDto,
  ) {
    return await this.authService.changePassword(
      req.user.id,
      dto.currentPassword,
      dto.newPassword,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete('me')
  async deleteAccount(@Req() req: Request & { user: { id: string } }) {
    return await this.authService.deleteAccount(req.user.id);
  }
}
