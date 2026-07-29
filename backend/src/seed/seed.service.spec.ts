import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { SeedService } from './seed.service';
import { User } from '../auth/entities/user.entity';
import { Event } from '../events/entities/event.entity';
import { UserRole } from '../common/enums/user-role.enum';
import { SEED_EVENTS } from './events.seed';

describe('SeedService', () => {
  let service: SeedService;
  let eventRepository: { count: jest.Mock; create: jest.Mock; save: jest.Mock };
  let userRepository: { findOne: jest.Mock; create: jest.Mock; save: jest.Mock; update: jest.Mock };
  let config: Record<string, string | undefined>;

  // The seeder looks up the old admin address first, then the configured one.
  // This lets a test describe just the configured admin row.
  const withAdminRow = (row: Partial<User> | null) =>
    jest.fn(async (options: any) => (options?.where?.email === 'admin@eventlounge.com' ? null : row));

  beforeEach(async () => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});

    config = { ADMIN_EMAIL: 'admin@example.com', ADMIN_PASSWORD: 'configured-password' };

    eventRepository = {
      count: jest.fn().mockResolvedValue(6), // events already present unless a test says otherwise
      create: jest.fn((dto) => dto),
      save: jest.fn(async (rows) => rows),
    };

    userRepository = {
      findOne: withAdminRow(null),
      create: jest.fn((dto) => dto),
      save: jest.fn(async (row) => row),
      update: jest.fn(async () => ({ affected: 1 })),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SeedService,
        { provide: getRepositoryToken(User), useValue: userRepository },
        { provide: getRepositoryToken(Event), useValue: eventRepository },
        { provide: ConfigService, useValue: { get: (key: string) => config[key] } },
      ],
    }).compile();

    service = module.get<SeedService>(SeedService);
  });

  afterEach(() => jest.restoreAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('admin seeding', () => {
    it('creates the admin when the database has no matching user', async () => {
      await service.onModuleInit();

      expect(userRepository.save).toHaveBeenCalledTimes(1);
      const created = userRepository.save.mock.calls[0][0];
      expect(created.email).toBe('admin@example.com');
      expect(created.role).toBe(UserRole.ADMIN);
      await expect(bcrypt.compare('configured-password', created.password)).resolves.toBe(true);
    });

    it('updates the stored password when it no longer matches the configured one', async () => {
      // Exactly the production situation: the row was seeded by an earlier
      // deploy with a different password, so login rejects the current one.
      userRepository.findOne = withAdminRow({
        id: 'admin-1',
        email: 'admin@example.com',
        role: UserRole.ADMIN,
        password: await bcrypt.hash('password-from-an-old-deploy', 10),
      });

      await service.onModuleInit();

      expect(userRepository.update).toHaveBeenCalledTimes(1);
      const [id, updates] = userRepository.update.mock.calls[0];
      expect(id).toBe('admin-1');
      await expect(bcrypt.compare('configured-password', updates.password)).resolves.toBe(true);
    });

    it('leaves the row alone when the password already matches', async () => {
      userRepository.findOne = withAdminRow({
        id: 'admin-1',
        email: 'admin@example.com',
        role: UserRole.ADMIN,
        password: await bcrypt.hash('configured-password', 10),
      });

      await service.onModuleInit();

      expect(userRepository.update).not.toHaveBeenCalled();
      expect(userRepository.save).not.toHaveBeenCalled();
    });

    it('restores the ADMIN role if the account was demoted', async () => {
      userRepository.findOne = withAdminRow({
        id: 'admin-1',
        email: 'admin@example.com',
        role: UserRole.USER,
        password: await bcrypt.hash('configured-password', 10),
      });

      await service.onModuleInit();

      expect(userRepository.update.mock.calls[0][1]).toEqual({ role: UserRole.ADMIN });
    });

    it('uses ADMIN_EMAIL and ADMIN_PASSWORD from the environment', async () => {
      config = { ADMIN_EMAIL: 'someone@else.com', ADMIN_PASSWORD: 'from-render' };

      await service.onModuleInit();

      const created = userRepository.save.mock.calls[0][0];
      expect(created.email).toBe('someone@else.com');
      await expect(bcrypt.compare('from-render', created.password)).resolves.toBe(true);
    });

    it('warns loudly when ADMIN_PASSWORD is unset and the committed default is used', async () => {
      config = {};
      const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});

      await service.onModuleInit();

      expect(warn.mock.calls.flat().join(' ')).toContain('ADMIN_PASSWORD is not set');
    });
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
