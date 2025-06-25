import { Injectable } from '@nestjs/common';
import { PrismaClient } from '../../generated/prisma/client'; // Adjust the import path based on your project structure
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor(config: ConfigService) {
    console.log(
      'Initializing PrismaService with database URL:',
      config.get<string>('DATABASE_URL'),
    );
    super({
      datasources: {
        db: {
          url: config.get<string>('DATABASE_URL'),
        },
      },
    });
  }
}
