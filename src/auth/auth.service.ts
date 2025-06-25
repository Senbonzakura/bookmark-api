import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // Adjust the import path based on your project structure
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from 'generated/prisma/runtime/library';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable({})
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private readonly configService: ConfigService,
  ) {}
  test() {
    return 'Auth Service is working!';
  }

  async signIn(dto: AuthDto): Promise<any> {
    const user = (await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    })) as { id: number; email: string; hash: string; createdAt?: Date }; // Add other fields as needed
    if (!user) {
      throw new ForbiddenException('Invalid credentials');
    }

    const isPasswordValid = await argon.verify(user.hash, dto.password);
    if (!isPasswordValid) {
      throw new ForbiddenException('Invalid credentials');
    }

    console.log('User signed in successfully:', user.email);

    const { hash, ...userWithoutHash } = user;
    return this.signToken(userWithoutHash.id, userWithoutHash.email);
  }

  async signUp(dto: AuthDto): Promise<any> {
    console.log('User registration data:', dto);

    const hash = await argon.hash(dto.password);

    try {
      const newUser = await this.prisma.user.create({
        data: {
          email: dto.email,
          hash,
        },
        select: {
          id: true,
          email: true,
          createdAt: true,
        },
      });

      console.log('User registered successfully:', dto.email);
      return this.signToken(newUser.id, newUser.email);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Email already exists');
        }
      }
      console.error('Error during user registration:', error);
      throw new Error('User registration failed');
    }
  }

  async signToken(
    userId: number,
    email: string,
  ): Promise<{ access_token: string }> {
    console.log(`Signing token for user with ID ${userId} and email ${email}`);
    if (!userId || !email) {
      throw new ForbiddenException(
        'User ID and email are required to sign a token',
      );
    }
    const payload = { sub: userId, email };
    const secret = this.configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new ForbiddenException('JWT secret is not configured');
    }
    return {
      access_token: await this.jwt.signAsync(payload, {
        expiresIn: '6h',
        secret,
      }),
    };
  }

  async signOut(userId: number) {
    // Implement sign-out logic if needed, such as invalidating tokens or sessions
    console.log(`User with ID ${userId} signed out.`);
    return { message: 'User signed out successfully' };
  }

  async refreshToken(userId: number, email: string) {
    // Implement refresh token logic if needed
    console.log(`Refreshing token for user with ID ${userId}`);
    const newToken = await this.signToken(userId, email);
    return { accessToken: newToken };
  }
}
