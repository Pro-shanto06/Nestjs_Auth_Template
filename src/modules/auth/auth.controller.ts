import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  Res,
  Param,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { User } from '../user/schemas/user.schema';
import { VerifySignupDto } from './dto/verify-signup.dto';
import { RefreshTokenGuard } from './guards/refresh-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { InviteUserDto } from './dto/invite-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('invite')
  async invite(@Body() inviteUserDto: InviteUserDto) {
    return this.authService.inviteUser(inviteUserDto);
  }

  @Post('signup/:invitationToken?')
  async signup(
    @Body() createUserDto: CreateUserDto,
    @Param('invitationToken') invitationToken?: string,
  ) {
    return this.authService.signup(createUserDto, invitationToken);
  }

  @Post('verify-signup')
  async verifySignup(@Body() verifySignupDto: VerifySignupDto): Promise<User> {
    return this.authService.verifySignup(verifySignupDto);
  }

  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @UseGuards(RefreshTokenGuard)
  @Post('refresh-token')
  async refreshTokens(@Req() req) {
    const user = req.user;
    return this.authService.refreshTokens(user._id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Req() req) {
    const user = req.user;
    return this.authService.logout(user._id);
  }

  @UseGuards(GoogleAuthGuard)
  @Get('google/login')
  async googleAuth() {}

  @UseGuards(GoogleAuthGuard)
  @Get('google/callback')
  async googleAuthRedirect(@Req() req, @Res() res) {
    const response = await this.authService.googleLogin(req.user);
    return res.redirect(
      `http://nestjs-auth-lel4.onrender.com?access_token=${response.access_token}&refresh_token=${response.refresh_token}`,
    );
  }

  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password/:token')
  async resetPassword(
    @Param('token') token: string,
    @Body() resetPasswordDto: ResetPasswordDto,
  ) {
    return this.authService.resetPassword(token, resetPasswordDto);
  }
}
