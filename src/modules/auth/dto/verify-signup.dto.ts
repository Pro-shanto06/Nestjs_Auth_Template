import { IsNotEmpty, IsString } from 'class-validator';

export class VerifySignupDto {
  @IsString()
  @IsNotEmpty()
  code: string;
}
