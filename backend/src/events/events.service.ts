// backend/src/events/events.service.ts

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, LessThan, In, ILike } from 'typeorm';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Event } from './entities/event.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import { Booking } from '../bookings/entities/booking.entity';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
  ) {}

  private async mapBookingCountsToEvents(events: Event[]): Promise<any[]> {
    if (events.length === 0) {
      return [];
    }
    const eventIds = events.map(event => event.id);

    const bookingCounts = await this.bookingRepository
      .createQueryBuilder('booking')
      .select('booking.eventId', 'eventId')
      .addSelect('SUM(booking.numberOfSeats)', 'totalBooked')
      .where('booking.eventId IN (:...eventIds)', { eventIds })
      .groupBy('booking.eventId')
      .getRawMany();

    const countsMap = new Map<string, number>();
    bookingCounts.forEach(count => {
      countsMap.set(count.eventId, parseInt(count.totalBooked, 10));
    });

    return events.map(event => {
      const bookedSeats = countsMap.get(event.id) || 0;
      return {
        ...event,
        bookedSeats,
        spotsLeft: event.capacity - bookedSeats,
      };
    });
  }

  private combineDateAndTime(date: string, time: string): Date {
    const timeRegex = /(\d{1,2}):(\d{2})\s*(AM|PM)?/i;
    const match = time.match(timeRegex);
    if (!match) {
      throw new BadRequestException('Invalid time format. Please use "10:00AM" or "02:30 PM".');
    }
    let hours = parseInt(match[1], 10), minutes = parseInt(match[2], 10);
    const modifier = match[3]?.toUpperCase();
    if (isNaN(hours) || isNaN(minutes)) { throw new BadRequestException('Invalid time values.'); }
    if (modifier === 'PM' && hours < 12) { hours += 12; }
    if (modifier === 'AM' && hours === 12) { hours = 0; }
    const eventDate = new Date(date);
    eventDate.setUTCHours(hours, minutes, 0, 0); 
    return eventDate;
  }

  async create(createEventDto: CreateEventDto): Promise<Event> {
    const { date, time, imageUrl, capacity, tags, ...restDto } = createEventDto;
    if (!date || !time) { throw new BadRequestException("Date and time are required."); }
    const numericCapacity = parseInt(String(capacity), 10);
    if (isNaN(numericCapacity) || numericCapacity <= 0) { throw new BadRequestException("Capacity must be a valid positive number."); }
    let tagsArray: string[] = [];
    if (tags && typeof tags === 'string' && (tags as string).trim() !== '') {
        tagsArray = (tags as string).split(',').map(tag => tag.trim()).filter(Boolean);
    } else if (Array.isArray(tags)) { tagsArray = tags; }
    const eventDate = this.combineDateAndTime(date, time);
    const newEvent = this.eventRepository.create({ ...restDto, imageUrl, date: eventDate, capacity: numericCapacity, tags: tagsArray });
    return this.eventRepository.save(newEvent);
  }

  async update(id: string, updateEventDto: UpdateEventDto): Promise<Event> {
    const event = await this.eventRepository.findOneBy({ id });
    if (!event) throw new NotFoundException(`Event with ID "${id}" not found`);
    if (updateEventDto.tags && typeof updateEventDto.tags === 'string') {
        (updateEventDto.tags as any) = (updateEventDto.tags as string).split(',').map(tag => tag.trim()).filter(Boolean);
    }
    const dtoWithConvertedTypes = { ...updateEventDto, capacity: updateEventDto.capacity ? parseInt(String(updateEventDto.capacity), 10) : event.capacity, };
    Object.assign(event, dtoWithConvertedTypes);
    if (updateEventDto.date && updateEventDto.time) { event.date = this.combineDateAndTime(updateEventDto.date, updateEventDto.time); }
    return this.eventRepository.save(event);
  }

  async findUpcoming(paginationDto: PaginationDto) {
    const page = paginationDto.page || 1;
    const limit = paginationDto.limit || 6;
    const skip = (page - 1) * limit;
    const search = paginationDto.search;

    const whereCondition = search 
      ? [
          { date: MoreThan(new Date()), title: ILike(`%${search}%`) },
          { date: MoreThan(new Date()), description: ILike(`%${search}%`) }
        ]
      : { date: MoreThan(new Date()) };

    const [events, total] = await this.eventRepository.findAndCount({
      where: whereCondition,
      order: { date: 'ASC' },
      skip, take: limit,
    });
    
    const dataWithCounts = await this.mapBookingCountsToEvents(events);
    return { data: dataWithCounts, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findPast(paginationDto: PaginationDto) {
    const page = paginationDto.page || 1;
    const limit = paginationDto.limit || 6;
    const skip = (page - 1) * limit;
    const search = paginationDto.search;

    const whereCondition = search 
      ? [
          { date: LessThan(new Date()), title: ILike(`%${search}%`) },
          { date: LessThan(new Date()), description: ILike(`%${search}%`) }
        ]
      : { date: LessThan(new Date()) };

    const [events, total] = await this.eventRepository.findAndCount({
        where: whereCondition,
        order: { date: 'DESC' },
        skip, take: limit,
    });
    const dataWithCounts = await this.mapBookingCountsToEvents(events);
    return { data: dataWithCounts, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
  
  async findAll(): Promise<any[]> {
    const events = await this.eventRepository.find({ order: { date: 'ASC' } });
    return this.mapBookingCountsToEvents(events);
  }
  
  async findOne(id: string): Promise<any> {
    const event = await this.eventRepository.findOneBy({ id });
    if (!event) {
      throw new NotFoundException(`Event with ID "${id}" not found`);
    }

    const result = await this.bookingRepository
        .createQueryBuilder('booking')
        .select('SUM(booking.numberOfSeats)', 'totalBooked')
        .where('booking.eventId = :id', { id })
        .getRawOne();
        
    const bookedSeats = parseInt(result?.totalBooked, 10) || 0;
    return { ...event, bookedSeats, spotsLeft: event.capacity - bookedSeats };
  }

  async remove(id: string): Promise<void> {
    const result = await this.eventRepository.delete(id);
    if (result.affected === 0) throw new NotFoundException(`Event with ID "${id}" not found`);
  }
}
