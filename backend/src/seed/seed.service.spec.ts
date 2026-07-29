import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { User } from '../auth/entities/user.entity';
import { Event } from '../events/entities/event.entity';
import { SEED_EVENTS } from './events.seed';

describe('SeedService', () => {
  let service: SeedService;
  let eventRepository: { count: jest.Mock; create: jest.Mock; save: jest.Mock };
  let userRepository: { findOne: jest.Mock; create: jest.Mock; save: jest.Mock };

  beforeEach(async () => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});

    eventRepository = {
      count: jest.fn(),
      create: jest.fn((dto) => dto),
      save: jest.fn(async (rows) => rows),
    };

    userRepository = {
      // An admin already exists, so seedAdmin() short-circuits and these tests
      // stay focused on the event seeder.
      findOne: jest.fn().mockResolvedValue({ id: 'existing-admin' }),
      create: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SeedService,
        { provide: getRepositoryToken(User), useValue: userRepository },
        { provide: getRepositoryToken(Event), useValue: eventRepository },
      ],
    }).compile();

    service = module.get<SeedService>(SeedService);
  });

  afterEach(() => jest.restoreAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('event seeding', () => {
    it('populates an empty database so a fresh deploy does not show "No events found"', async () => {
      eventRepository.count.mockResolvedValue(0);

      await service.onModuleInit();

      expect(eventRepository.save).toHaveBeenCalledTimes(1);
      expect(eventRepository.save.mock.calls[0][0]).toHaveLength(SEED_EVENTS.length);
    });

    it('converts the ISO date string into a Date the entity can store', async () => {
      eventRepository.count.mockResolvedValue(0);

      await service.onModuleInit();

      const [saved] = eventRepository.save.mock.calls[0][0];
      expect(saved.date).toBeInstanceOf(Date);
      expect(saved.date.toISOString()).toBe(new Date(SEED_EVENTS[0].date).toISOString());
    });

    it('skips seeding when events already exist, so real data is never duplicated', async () => {
      eventRepository.count.mockResolvedValue(6);

      await service.onModuleInit();

      expect(eventRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('seed fixture', () => {
    it('is not empty, otherwise a fresh deploy silently has nothing to show', () => {
      expect(SEED_EVENTS.length).toBeGreaterThan(0);
    });

    it('has the fields the Event entity requires', () => {
      for (const event of SEED_EVENTS) {
        expect(typeof event.title).toBe('string');
        expect(event.title.length).toBeGreaterThan(0);
        expect(typeof event.description).toBe('string');
        expect(Number.isInteger(event.capacity)).toBe(true);
        expect(event.capacity).toBeGreaterThan(0);
        expect(Array.isArray(event.tags)).toBe(true);
        expect(Number.isNaN(new Date(event.date).getTime())).toBe(false);
      }
    });

    it('references uploads by relative path, so the URL works on any host', () => {
      for (const event of SEED_EVENTS) {
        if (event.imageUrl === null) continue;
        expect(event.imageUrl.startsWith('/uploads/')).toBe(true);
      }
    });
  });
});
