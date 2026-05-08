import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './entities/event.entity';
import { AuthModule } from '../auth/auth.module'; 
import { Booking } from '../bookings/entities/booking.entity'; 


@Module({
  imports: [TypeOrmModule.forFeature([Event, Booking]), AuthModule,],
  controllers: [EventsController],
  providers: [EventsService],
})
export class EventsModule {}