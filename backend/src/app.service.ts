import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello I am Jalal Uddin Currently Working as a Full Stack Developer';
  }
}
