import { Controller, Post, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { MailService } from './mail.service';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiProperty } from '@nestjs/swagger';

class TestEmailDto {
  @ApiProperty({
    example: 'test@example.com',
    description: 'Email address to send test email to',
  })
  email: string;
}

@ApiTags('Mail')
@Controller('mail')
@UseGuards(RolesGuard)
@Roles(UserRole.ADMIN)
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post('test-booking')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Send test booking email (Admin only)' })
  @ApiResponse({ status: 200, description: 'Test booking email sent successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  async testBookingEmail(@Body() body: TestEmailDto) {
    await this.mailService.sendBookingConfirmation(
      body.email,
      'Test User',
      'Sample Event',
      new Date(),
      'Sample Location',
      2,
    );
    return { message: 'Test booking email sent successfully' };
  }

  @Post('test-reset')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Send test password reset email (Admin only)' })
  @ApiResponse({ status: 200, description: 'Test reset email sent successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  async testResetEmail(@Body() body: TestEmailDto) {
    await this.mailService.sendPasswordResetEmail(
      body.email,
      'Test User',
      '123456',
    );
    return { message: 'Test reset email sent successfully' };
  }
}
