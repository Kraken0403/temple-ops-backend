// src/auth/auth.service.ts
import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { SignupDto } from './dto/signup.dto';

interface JwtUser {
  id:    number;
  email: string;
  roles: string[];
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  /** Validate credentials for LocalStrategy */
  async validateUser(email: string, pass: string): Promise<JwtUser | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        // pull in the pivot rows _and_ the related Role record
        roles: { include: { role: true } }
      }
    });
    if (!user) return null;
    if (!(await bcrypt.compare(pass, user.password))) return null;

    return {
      id:    user.id,
      email: user.email,
      roles: user.roles.map(r => r.role.name),
    };
  }

  /** Signup a new user (assign "user" role) and return JWT */
  async signup(dto: SignupDto): Promise<{ access_token: string }> {
    const hashed = await bcrypt.hash(dto.password, 10);

    let user;
    try {
      user = await this.prisma.user.create({
        data: {
          email:    dto.email,
          password: hashed,
          roles: {
            // create a pivot row whose nested `role` is connectOrCreate’d
            create: [
              {
                role: {
                  connectOrCreate: {
                    where:  { name: 'user' },
                    create: { name: 'user' }
                  }
                }
              }
            ]
          }
        },
        include: {
          roles: { include: { role: true } }
        }
      });
    } catch (e: any) {
      if (e.code === 'P2002') {
        throw new BadRequestException('Email already in use');
      }
      throw e;
    }

    const jwtUser: JwtUser = {
      id:    user.id,
      email: user.email,
      roles: user.roles.map(r => r.role.name),
    };
    const token = this.getToken(jwtUser);
    return { access_token: token };
  }

  /** Login returns JWT for an already-validated user */
  async login(user: JwtUser): Promise<{ access_token: string }> {
    // If you need to re-fetch roles from DB, do so here.
    return { access_token: this.getToken(user) };
  }

  /** Helper: signs a JWT from JwtUser */
  private getToken(user: JwtUser): string {
    const payload = { sub: user.id, email: user.email, roles: user.roles };
    return this.jwt.sign(payload, { expiresIn: process.env.JWT_EXPIRES_IN });
  }
}
