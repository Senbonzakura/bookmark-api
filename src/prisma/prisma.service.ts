import { Injectable } from '@nestjs/common';
import { PrismaClient } from '../../generated/prisma/client'; // Adjust the import path based on your project structure

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    super({
      datasources: {
        db: {
          url:
            process.env.DATABASE_URL ||
            'postgresql://postgres:123@localhost:5434/bookmark?schema=public',
        },
      },
    });
  }
}
