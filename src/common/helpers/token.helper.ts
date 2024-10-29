import { JwtService } from '@nestjs/jwt';

export function generateTokens(jwtService: JwtService, payload) {
  const accessToken = jwtService.sign(payload, { expiresIn: '15m' });
  const refreshToken = jwtService.sign(payload, { expiresIn: '7d' });

  return { accessToken, refreshToken };
}
