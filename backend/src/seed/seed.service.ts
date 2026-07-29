/* eslint-disable prettier/prettier */
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../auth/entities/user.entity';
import { Event } from '../events/entities/event.entity';
import { Repository } from 'typeorm';
import { UserRole } from '../common/enums/user-role.enum';
import { SEED_EVENTS } from './events.seed';
import * as bcrypt from 'bcrypt';

// Used only when ADMIN_EMAIL / ADMIN_PASSWORD are not set. These are public in
// the repo, so set the env vars on any deployed environment.
const FALLBACK_ADMIN_EMAIL = 'hachiburrahman15@gmail.com';
const FALLBACK_ADMIN_PASSWORD = 'Hachib@1234';
const SALT_ROUNDS = 10;

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    private readonly configService: ConfigService,
  ) { }

  async onModuleInit() {
    await this.seedAdmin();
    await this.seedEvents();
  }

  // Creates the admin when missing, and reconciles it when it already exists.
  //
  // The old version returned early whenever the email was found, so editing the
  // password in source had no effect on any database that already had the row:
  // production kept rejecting the new password and accepting the original one.
  // Configured credentials are the source of truth, so a changed password now
  // takes effect on the next boot.
  private async seedAdmin() {
    const adminEmail = this.configService.get<string>('ADMIN_EMAIL') || FALLBACK_ADMIN_EMAIL;
    const adminPassword = this.configService.get<string>('ADMIN_PASSWORD') || FALLBACK_ADMIN_PASSWORD;

    if (!this.configService.get<string>('ADMIN_PASSWORD')) {
      console.warn(
        'WARNING: ADMIN_PASSWORD is not set, falling back to the password committed in seed.service.ts. ' +
        'Anyone who can read the repository can sign in as admin. Set ADMIN_EMAIL and ADMIN_PASSWORD.',
      );
    }

    const oldAdminExists = await this.userRepository.findOne({
      where: { email: 'admin@eventlounge.com' },
    });
    if (oldAdminExists) {
      console.warn('WARNING: An old admin account ("admin@eventlounge.com") exists. Please remove it manually for security.');
    }

    // password is select:false on the entity, so ask for it explicitly.
    const existingAdmin = await this.userRepository.findOne({
      where: { email: adminEmail },
      select: ['id', 'email', 'role', 'password'],
    });

    if (!existingAdmin) {
      const newAdmin = this.userRepository.create({
        fullName: 'Admin Hachib',
        email: adminEmail,
        password: await bcrypt.hash(adminPassword, SALT_ROUNDS),
        role: UserRole.ADMIN,
      });

      await this.userRepository.save(newAdmin);
      console.log(`Admin user '${adminEmail}' has been created.`);
      return;
    }

    const updates: Partial<User> = {};

    const passwordMatches = await bcrypt.compare(adminPassword, existingAdmin.password);
    if (!passwordMatches) {
      updates.password = await bcrypt.hash(adminPassword, SALT_ROUNDS);
    }

    // A row demoted by hand would otherwise lock everyone out of the admin panel.
    if (existingAdmin.role !== UserRole.ADMIN) {
      updates.role = UserRole.ADMIN;
    }

    if (Object.keys(updates).length === 0) {
      console.log(`Admin user '${adminEmail}' is already up to date. Seeder is skipping.`);
      return;
    }

    await this.userRepository.update(existingAdmin.id, updates);
    console.log(`Admin user '${adminEmail}' reconciled (${Object.keys(updates).join(', ')}).`);
  }

  // A deploy ships code, not data. A fresh database (new Render instance, reset
  // Postgres) comes up with empty tables, so the site would show "No events found".
  // Only seeds when the table is empty, so it never duplicates or overwrites real events.
  private async seedEvents() {
    const existing = await this.eventRepository.count();

    if (existing > 0) {
      console.log(`Events table already has ${existing} row(s). Event seeder is skipping.`);
      return;
    }

    if (SEED_EVENTS.length === 0) {
      console.warn('No seed events defined. Run "node scripts/export-events.mjs" to generate them.');
      return;
    }

    const events = SEED_EVENTS.map((seed) =>
      this.eventRepository.create({
        title: seed.title,
        description: seed.description,
        date: new Date(seed.date),
        location: seed.location,
        capacity: seed.capacity,
        tags: seed.tags,
        price: seed.price,
        imageUrl: seed.imageUrl ?? undefined,
      }),
    );

    await this.eventRepository.save(events);
    console.log(`Seeded ${events.length} events into an empty database.`);
  }
}
