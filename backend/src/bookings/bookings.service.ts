import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from '../events/entities/event.entity';
import { Booking } from './entities/booking.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { User } from 'src/auth/entities/user.entity';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    private readonly mailService: MailService,
  ) {}

  async create(createBookingDto: CreateBookingDto, currentUser: User): Promise<Booking> {
    const { eventId, numberOfSeats } = createBookingDto;
    const event = await this.eventRepository.findOneBy({ id: eventId });
    if (!event) throw new NotFoundException(`Event with ID "${eventId}" not found`);
    if (new Date(event.date) < new Date()) throw new BadRequestException('Cannot book a past event.');

    const { totalBookedSeats } = await this.bookingRepository
      .createQueryBuilder('booking')
      .select('SUM(booking.numberOfSeats)', 'totalBookedSeats')
      .where('booking.eventId = :eventId', { eventId })
      .getRawOne();

    const availableSeats = event.capacity - (totalBookedSeats || 0);
    if (numberOfSeats > availableSeats)
      throw new BadRequestException(`Not enough seats available. Only ${availableSeats} seats left.`);

    const newBooking = this.bookingRepository.create({
      event,
      user: currentUser,
      numberOfSeats,
    });

    const savedBooking = await this.bookingRepository.save(newBooking);

    // Send booking confirmation email
    await this.mailService.sendBookingConfirmation(
      currentUser.email,
      currentUser.fullName,
      event.title,
      event.date,
      event.location,
      numberOfSeats,
    );

    return savedBooking;
  }

  async findMyBookings(currentUser: User): Promise<Booking[]> {
    return this.bookingRepository.find({
      where: { user: { id: currentUser.id } },
      relations: { event: true },
      order: { event: { date: 'ASC' } },
    });
  }

  async cancelBooking(bookingId: string, currentUser: User): Promise<void> {
    const booking = await this.bookingRepository.findOne({ where: { id: bookingId } });
    if (!booking) throw new NotFoundException(`Booking with ID "${bookingId}" not found`);
    if (booking.userId !== currentUser.id)
      throw new ForbiddenException('You are not authorized to cancel this booking.');

    const fullBooking = await this.bookingRepository.findOne({
      where: { id: bookingId },
      relations: { event: true },
    });

    if (!fullBooking) throw new NotFoundException(`Booking with ID "${bookingId}" not found`);

    if (new Date(fullBooking.event.date) < new Date())
      throw new BadRequestException('You cannot cancel a booking for an event that has already passed.');

    await this.bookingRepository.remove(booking);
  }
}
