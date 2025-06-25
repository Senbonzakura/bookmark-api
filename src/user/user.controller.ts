import { Controller, Get, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { User } from 'generated/prisma';
import { GetUser } from 'src/auth/decorator';
import { JwtGuard } from 'src/auth/guard/jwt.guard';

@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
  @Get('me')
  getMe(
    @GetUser() user: User,
    @GetUser('id') id: number,
    @GetUser('email') email: string,
  ): User {
    console.log('User request received:', user, id, email);
    return user;
  }
}
