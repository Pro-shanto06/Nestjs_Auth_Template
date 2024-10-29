import { IsString } from 'class-validator';

export class VerifySignupDto {
  @IsString()
  code: string;
}
