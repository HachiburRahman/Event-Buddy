import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { VerifyResetCodeDto } from './dto/verify-reset-code.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) { }


  async register(createUserDto: CreateUserDto) {
    const { fullName, email, password } = createUserDto;

    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = this.userRepository.create({
      fullName,
      email,
      password: hashedPassword,
    });

    try {
      const savedUser = await this.userRepository.save(newUser);
      delete (savedUser as any).password;
      return savedUser;
    } catch (error) {
      throw new InternalServerErrorException(
        'An error occurred while creating the user.',
      );
    }
  }


  async login(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;

    const user = await this.userRepository.findOne({
      where: { email },
      select: ['id', 'fullName', 'email', 'password', 'role'],
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordMatching = await bcrypt.compare(password, user.password);
    if (!isPasswordMatching) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;

    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      // Don't reveal if email exists or not for security
      return { message: 'If an account exists with this email, a reset code has been sent.' };
    }

    // Generate a 6-digit reset code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const resetCodeExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now

    await this.userRepository.update(user.id, {
      resetCode,
      resetCodeExpires,
    });

    // Send the reset code via email
    await this.mailService.sendPasswordResetEmail(
      user.email,
      user.fullName,
      resetCode,
    );

    return { message: 'If an account exists with this email, a reset code has been sent.' };
  }

  async verifyResetCode(verifyResetCodeDto: VerifyResetCodeDto) {
    const { email, resetCode } = verifyResetCodeDto;

    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.resetCode || !user.resetCodeExpires) {
      throw new BadRequestException('No reset code requested for this account');
    }

    if (user.resetCode !== resetCode) {
      throw new BadRequestException('Invalid reset code');
    }

    if (new Date() > user.resetCodeExpires) {
      throw new BadRequestException('Reset code has expired. Please request a new one.');
    }

    return { message: 'Reset code verified successfully. You can now reset your password.' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { email, resetCode, newPassword } = resetPasswordDto;

    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.resetCode || !user.resetCodeExpires) {
      throw new BadRequestException('No reset code requested for this account');
    }

    if (user.resetCode !== resetCode) {
      throw new BadRequestException('Invalid reset code');
    }

    if (new Date() > user.resetCodeExpires) {
      throw new BadRequestException('Reset code has expired. Please request a new one.');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);


    await this.userRepository.update(user.id, {
      password: hashedPassword,
      resetCode: null,
      resetCodeExpires: null,
    });

    return { message: 'Password has been reset successfully. You can now login with your new password.' };
  }
}
