import { BadRequestException, ForbiddenException, Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from '../events/entities/event.entity';
import { Booking } from './entities/booking.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { User } from 'src/auth/entities/user.entity';
import { MailService } from 'src/mail/mail.service';
import { PaymentsService } from '../payments/payments.service';
import { whereHoldsASeat } from './booking-seats';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    private readonly mailService: MailService,
    @Inject(forwardRef(() => PaymentsService))
    private readonly paymentsService: PaymentsService,
  ) {}

  async create(createBookingDto: CreateBookingDto, currentUser: User): Promise<any> {
    const { eventId, numberOfSeats } = createBookingDto;
    const event = await this.eventRepository.findOneBy({ id: eventId });
    if (!event) throw new NotFoundException(`Event with ID "${eventId}" not found`);
    if (new Date(event.date) < new Date()) throw new BadRequestException('Cannot book a past event.');

    const { totalBookedSeats } = await whereHoldsASeat(
      this.bookingRepository
        .createQueryBuilder('booking')
        .select('SUM(booking.numberOfSeats)', 'totalBookedSeats')
        .where('booking.eventId = :eventId', { eventId }),
    ).getRawOne();

    const availableSeats = event.capacity - (totalBookedSeats || 0);
    if (numberOfSeats > availableSeats)
      throw new BadRequestException(`Not enough seats available. Only ${availableSeats} seats left.`);

    const isPaidEvent = event.price && Number(event.price) > 0;

    const newBooking = this.bookingRepository.create({
      event,
      user: currentUser,
      numberOfSeats,
      paymentStatus: isPaidEvent ? 'PENDING' : 'PAID',
      amountPaid: 0,
    });

    const savedBooking = await this.bookingRepository.save(newBooking);

    if (isPaidEvent) {
      // The row is already written, so a throw here would strand it at PENDING
      // holding seats nobody paid for. Nothing else cleans it up: the
      // /booking/cancel page only runs when Stripe redirects back, which cannot
      // happen if the session was never created.
      try {
        const checkoutUrl = await this.paymentsService.createCheckoutSession(
          savedBooking.id,
          event.title,
          Number(event.price),
          numberOfSeats,
        );
        return { booking: savedBooking, checkoutUrl };
      } catch (error) {
        await this.bookingRepository.remove(savedBooking);
        throw error;
      }
    }

    // Send booking confirmation email for free events
    await this.mailService.sendBookingConfirmation(
      currentUser.email,
      currentUser.fullName,
      event.title,
      event.date,
      event.location,
      numberOfSeats,
    );

    return { booking: savedBooking };
  }

  async completePayment(bookingId: string, stripeSessionId: string, amountPaid: number): Promise<void> {
    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId },
      relations: { event: true, user: true },
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID "${bookingId}" not found`);
    }

    if (booking.paymentStatus === 'PAID') {
      return;
    }

    booking.paymentStatus = 'PAID';
    booking.stripeSessionId = stripeSessionId;
    booking.amountPaid = amountPaid;

    await this.bookingRepository.save(booking);

    // Send booking confirmation email for paid events upon payment completion
    await this.mailService.sendBookingConfirmation(
      booking.user.email,
      booking.user.fullName,
      booking.event.title,
      booking.event.date,
      booking.event.location,
      booking.numberOfSeats,
    );
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

  async cancelPendingBooking(bookingId: string): Promise<void> {
    const booking = await this.bookingRepository.findOne({ where: { id: bookingId } });
    if (!booking) {
      throw new NotFoundException(`Booking with ID "${bookingId}" not found`);
    }
    if (booking.paymentStatus !== 'PENDING') {
      throw new BadRequestException('Only pending bookings can be cancelled this way.');
    }
    await this.bookingRepository.remove(booking);
  }
}
