import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    example: 'Hachibur Rahman',
    description: 'Full name of the user',
  })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({
    example: 'hachiburrahman@gmail.com',
    description: 'Email address (must be @gmail.com)',
  })
  @IsEmail()
  @IsNotEmpty()
  @Matches(/^[\w-\.]+@gmail\.com$/, {
    message: 'Email must be a valid @gmail.com address',
  })
  email: string;

  @ApiProperty({
    example: 'Password123!',
    description: 'Password (min 8 chars, uppercase, lowercase, number, special char)',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters long.' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    {
      message:
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)',
    },
  )
  password: string;
}
