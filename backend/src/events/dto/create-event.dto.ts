// backend/src/events/dto/create-event.dto.ts

import { Type, Transform } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsInt,
  Min,
  IsOptional,
  IsArray,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEventDto {
  @ApiProperty({
    example: 'Tech Conference 2024',
    description: 'Title of the event',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: 'Annual technology conference featuring latest innovations',
    description: 'Detailed description of the event',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    example: '2024-12-25T14:00:00.000Z',
    description: 'Date and time of the event (ISO 8601 format)',
  })
  @IsString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({
    example: '14:00',
    description: 'Time of the event',
  })
  @IsString()
  @IsNotEmpty()
  time: string;

  @ApiProperty({
    example: 'Main Auditorium, Tech Center',
    description: 'Location where the event will be held',
  })
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiProperty({
    example: 500,
    description: 'Maximum number of attendees',
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  capacity: number;

  @ApiPropertyOptional({
    example: ['technology', 'conference', 'innovation'],
    description: 'Tags for categorizing the event (comma-separated)',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => {
    if (typeof value === 'string' && value.trim() !== '') {
      return value.split(',').map(tag => tag.trim());
    }
    return value;
  })
  tags?: string[];

  @ApiPropertyOptional({
    example: 'http://localhost:5007/uploads/event-image.jpg',
    description: 'URL of the event image',
  })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({
    description: 'Event image file (multipart/form-data)',
    type: 'string',
    format: 'binary',
  })
  @IsOptional()
  image?: any;
}
