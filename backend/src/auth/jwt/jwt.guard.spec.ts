import { JwtAuthGuard } from './jwt.guard';
import { JwtService } from '@nestjs/jwt';

describe('JwtAuthGuard', () => {
  it('should be defined', () => {
    const mockJwtService = {} as JwtService;
    expect(new JwtAuthGuard(mockJwtService)).toBeDefined();
  });
});
