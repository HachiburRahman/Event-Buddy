import { IsUUID, IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBookingDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID of the event to book',
  })
  @IsUUID()
  eventId: string;

  @ApiProperty({
    example: 2,
    description: 'Number of seats to book (1-4)',
    minimum: 1,
    maximum: 4,
  })
  @IsInt()
  @Min(1, { message: 'You must book at least 1 seat.' })
  @Max(4, { message: 'You cannot book more than 4 seats.' })
  numberOfSeats: number;
}
