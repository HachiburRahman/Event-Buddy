import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Get,
  Delete,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { DeleteBookingDto } from './dto/delete-booking.dto';
import { GetCurrentUser } from '../common/decorators/get-current-user.decorator';
import { User } from '../auth/entities/user.entity';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Bookings')
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.USER)
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Book an event (User only)' })
  @ApiResponse({ status: 201, description: 'Event booked successfully' })
  @ApiResponse({ status: 400, description: 'Bad request (event not found, past event, no seats available, duplicate booking)' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@Body() createBookingDto: CreateBookingDto, @GetCurrentUser() currentUser: User) {
    return this.bookingsService.create(createBookingDto, currentUser);
  }

  @Get('my-bookings')
  @UseGuards(RolesGuard)
  @Roles(UserRole.USER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get my booked events (User only)' })
  @ApiResponse({ status: 200, description: 'Returns all bookings for the current user' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findMyBookings(@GetCurrentUser() currentUser: User) {
    return this.bookingsService.findMyBookings(currentUser);
  }

  @Delete('cancel')
  @UseGuards(RolesGuard)
  @Roles(UserRole.USER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Cancel event booking (User only)' })
  @ApiResponse({ status: 204, description: 'Booking cancelled successfully' })
  @ApiResponse({ status: 400, description: 'Bad request (booking not found, event already passed)' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - can only cancel own bookings' })
  cancel(@Body() deleteBookingDto: DeleteBookingDto, @GetCurrentUser() currentUser: User) {
    return this.bookingsService.cancelBooking(deleteBookingDto.bookingId, currentUser);
  }
}
