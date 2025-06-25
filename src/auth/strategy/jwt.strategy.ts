import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { User } from 'generated/prisma';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    // Adjust the type of config based on your configuration setup
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET') || 'defaultSecretKey',
    });
    console.log('JwtStrategy initialized');
  }

  async validate(payload: { sub: number; email: string }): Promise<User> {
    console.log('Validating JWT payload:', payload);
    const user = (await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        createdAt: true,
        firstName: true,
        lastName: true,
      },
    })) as User;
    if (!user) {
      console.error('User not found for JWT payload:', payload);
      throw new Error('User not found');
    }
    return user;
  }
}
