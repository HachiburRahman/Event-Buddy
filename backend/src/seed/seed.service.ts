/* eslint-disable prettier/prettier */
import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../auth/entities/user.entity';
import { Repository } from 'typeorm';
import { UserRole } from '../common/enums/user-role.enum';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async onModuleInit() {
    await this.seedAdmin();
  }

  private async seedAdmin() {
    const adminEmail = 'hachiburrahman15@gmail.com';
    const adminPassword = 'AdminHachib123@';

    const adminExists = await this.userRepository.findOne({
      where: { email: adminEmail },
    });

    if (adminExists) {
      console.log('Admin user with the new email already exists. Seeder is skipping.');
      return;
    }

    const oldAdminExists = await this.userRepository.findOne({
      where: { email: 'admin@eventbuddy.com' },
    });
    if (oldAdminExists) {
      console.warn('WARNING: An old admin account ("admin@eventbuddy.com") exists. Please remove it manually for security.');
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
}
