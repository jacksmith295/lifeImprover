import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL!,
    });
    super({ adapter });
  }

  async onModuleInit() {
    console.log('DATABASE_URL raw:', process.env.DATABASE_URL);
    console.log('Type of DATABASE_URL:', typeof process.env.DATABASE_URL);
    console.log('JWT_SECRET:', process.env.JWT_SECRET);
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
