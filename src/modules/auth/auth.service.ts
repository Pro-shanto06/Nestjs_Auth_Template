import { Injectable, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { User } from '../user/schemas/user.schema';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { LoginUserDto } from './dto/login_user.dto';
import { MailService } from '../mail/mail.service';
import { VerifySignupDto } from './dto/verify-signup.dto';
import { generateTokens } from 'src/common/helpers/token.helper';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ExceptionHelper } from '../../common/helpers/exception.helper';
import { InviteUserDto } from './dto/invite-user.dto';

@Injectable()
export class AuthService {
  private unverifiedUsers = new Map<
    string,
    { userDto: CreateUserDto; code: string; role: string }
  >();

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  async inviteUser(inviteUserDto: InviteUserDto): Promise<{ message: string }> {
    const { email, role } = inviteUserDto;
    const token = this.jwtService.sign({ email, role }, { expiresIn: '1d' });

    await this.mailService.sendInvitationEmail(email, token);

    return { message: 'Invitation sent successfully.' };
  }

  async signup(
    createUserDto: CreateUserDto,
    invitationToken?: string,
  ): Promise<{ message: string }> {
    let role = 'user';

    if (invitationToken) {
      try {
        const payload = this.jwtService.verify(invitationToken);
        role = payload.role;
      } catch (error) {
        ExceptionHelper.getInstance().defaultError(
          'Invalid or expired invitation token',
          'Invalid_or_expired_invitation_token',
          HttpStatus.UNAUTHORIZED,
        );
      }
    }

    const existingUser = await this.userService.findByEmail(
      createUserDto.email,
    );
    if (existingUser) {
      ExceptionHelper.getInstance().defaultError(
        'Email is already in use.',
        'Email_is_already_in_use.',
        HttpStatus.CONFLICT,
      );
    }

    const verificationCode = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();
    this.unverifiedUsers.set(createUserDto.email, {
      userDto: createUserDto,
      code: verificationCode,
      role,
    });

    await this.mailService.sendVerificationEmail(
      createUserDto.email,
      verificationCode,
    );

    return { message: 'Verification code sent to email.' };
  }

  async verifySignup(verifySignupDto: VerifySignupDto): Promise<User> {
    const { code } = verifySignupDto;
    const userEntry = [...this.unverifiedUsers.entries()].find(
      ([, entry]) => entry.code === code,
    );

    if (!userEntry) {
      ExceptionHelper.getInstance().defaultError(
        'Invalid verification code.',
        'invalid_verification_code',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const [email, { userDto, role }] = userEntry;
    const hashedPassword = await bcrypt.hash(userDto.password, 10);

    const savedUser = await this.userService.create({
      ...userDto,
      password: hashedPassword,
      isEmailVerified: true,
      role,
    });

    this.unverifiedUsers.delete(email);
    return savedUser;
  }

  async login(loginUserDto: LoginUserDto) {
    const user = await this.userService.findByEmail(loginUserDto.email);

    if (!user) {
      ExceptionHelper.getInstance().defaultError(
        'email not found',
        'email_not_found',
        HttpStatus.NOT_FOUND,
      );
    }

    const passwordMatches = await bcrypt.compare(
      loginUserDto.password,
      user.password,
    );

    if (!passwordMatches) {
      ExceptionHelper.getInstance().defaultError(
        'Invalid email or password.',
        'invalid_credentials',
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (!user.isEmailVerified) {
      ExceptionHelper.getInstance().defaultError(
        'Email is not verified.',
        'email_not_verified',
        HttpStatus.BAD_REQUEST,
      );
    }

    const { accessToken, refreshToken } = generateTokens(this.jwtService, {
      email: user.email,
      sub: user._id,
    });

    user.refreshToken = refreshToken;
    await user.save();

    return { access_token: accessToken, refresh_token: refreshToken };
  }

  async validateGoogleUser(googleUser: CreateUserDto) {
    const user = await this.userService.findByEmail(googleUser.email);
    if (user) return user;
    return await this.userService.create(googleUser);
  }

  async googleLogin(googleUser: CreateUserDto) {
    const user = await this.validateGoogleUser(googleUser);
    const { accessToken, refreshToken } = generateTokens(this.jwtService, {
      email: user.email,
      sub: user._id,
    });

    user.refreshToken = refreshToken;
    await user.save();

    return { access_token: accessToken, refresh_token: refreshToken };
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.userService.findById(userId);
    if (!user || user.refreshToken !== refreshToken) {
      ExceptionHelper.getInstance().defaultError(
        'Invalid refresh token',
        'invalid_refresh_token',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const payload = { email: user.email, sub: user._id, refreshToken };
    const newAccessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const newRefreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    user.refreshToken = newRefreshToken;
    await user.save();

    return { access_token: newAccessToken, refresh_token: newRefreshToken };
  }

  async logout(userId: string) {
    const user = await this.userService.findById(userId);
    if (user) {
      user.refreshToken = null;
      await user.save();
    }
    return { message: 'Logged out successfully' };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.userService.findByEmail(forgotPasswordDto.email);
    if (!user) {
      ExceptionHelper.getInstance().defaultError(
        'User with this email does not exist.',
        'user_not_found',
        HttpStatus.NOT_FOUND,
      );
    }

    const resetToken = this.jwtService.sign(
      { email: user.email, sub: user._id },
      { expiresIn: '1h' },
    );

    await this.mailService.sendPasswordResetEmail(user.email, resetToken);

    return { message: 'Password reset link sent to your email.' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const payload = this.jwtService.verify(resetPasswordDto.token);
    const user = await this.userService.findByEmail(payload.email);

    const hashedPassword = await bcrypt.hash(resetPasswordDto.newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return { message: 'Password reset successfully.' };
  }
}
