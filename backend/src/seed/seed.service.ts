/* eslint-disable prettier/prettier */
import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../auth/entities/user.entity';
import { Event } from '../events/entities/event.entity';
import { Repository } from 'typeorm';
import { UserRole } from '../common/enums/user-role.enum';
import { SEED_EVENTS } from './events.seed';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
  ) { }

  async onModuleInit() {
    await this.seedAdmin();
    await this.seedEvents();
  }

  private async seedAdmin() {
    const adminEmail = 'hachiburrahman15@gmail.com';
    const adminPassword = 'Hachib@1234';

    const adminExists = await this.userRepository.findOne({
      where: { email: adminEmail },
    });

    if (adminExists) {
      console.log('Admin user with the new email already exists. Seeder is skipping.');
      return;
    }

    const oldAdminExists = await this.userRepository.findOne({
      where: { email: 'admin@eventlounge.com' },
    });
    if (oldAdminExists) {
      console.warn('WARNING: An old admin account ("admin@eventlounge.com") exists. Please remove it manually for security.');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);

    const newAdmin = this.userRepository.create({
      fullName: 'Admin Hachib',
      email: adminEmail,
      password: hashedPassword,
      role: UserRole.ADMIN,
    });

    await this.userRepository.save(newAdmin);
    console.log(`Admin user '${adminEmail}' has been successfully created.`);
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
