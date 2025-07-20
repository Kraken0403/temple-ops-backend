// src/auth/auth.module.ts
import { Module }            from '@nestjs/common';
import { AuthService }       from './auth.service';
import { AuthController }    from './auth.controller';
import { PrismaService }     from '../prisma.service';
import { LocalStrategy }     from './local.strategy';
import { JwtStrategy }       from './jwt.strategy';
import { JwtModule }         from '@nestjs/jwt';
import { PassportModule }    from '@nestjs/passport';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({ secret: process.env.JWT_SECRET })
  ],
  providers: [
    AuthService,
    PrismaService,
    LocalStrategy,
    JwtStrategy
  ],
  controllers: [AuthController]
})
export class AuthModule {}
