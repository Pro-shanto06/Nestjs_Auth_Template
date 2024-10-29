export interface JwtPayload {
    email: string;
    sub: string;
    refreshToken?: string;
  }
  