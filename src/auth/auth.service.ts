// src/auth/auth.service.ts
import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { SignupDto } from './dto/signup.dto'

interface JwtUser {
  id:       number
  email:    string
  roles:    string[]
  priestId: number | null
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  /* ───────────────────────── Validate (LocalStrategy) ───────────────────────── */
  /** Validate credentials for LocalStrategy */
  async validateUser(email: string, pass: string): Promise<JwtUser | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        roles: { include: { role: true } }, // UserRole[] -> Role
      },
    })
    if (!user) return null
    const ok = await bcrypt.compare(pass, user.password)
    if (!ok) return null

    const roleNames = (user.roles || [])
      .map((r) => r.role?.name)
      .filter(Boolean) as string[]

    return {
      id: user.id,
      email: user.email,
      roles: roleNames,
      priestId: user.priestId ?? null,
    }
  }

  /* ─────────────────────────────── Signup ─────────────────────────────── */
  /** Signup a new user (assign "user" role) and return JWT */
  async signup(dto: SignupDto): Promise<{ access_token: string }> {
    const hashed = await bcrypt.hash(dto.password, 10)

    let user
    try {
      user = await this.prisma.user.create({
        data: {
          email: dto.email,
          password: hashed,
          roles: {
            create: [
              {
                role: {
                  connectOrCreate: {
                    where: { name: 'user' },
                    create: { name: 'user' },
                  },
                },
              },
            ],
          },
        },
        include: { roles: { include: { role: true } } },
      })
    } catch (e: any) {
      if (e?.code === 'P2002') {
        throw new BadRequestException('Email already in use')
      }
      throw e
    }

    const roleNames = (user.roles || [])
      .map((r) => r.role?.name)
      .filter(Boolean) as string[]

    const jwtUser: JwtUser = {
      id: user.id,
      email: user.email,
      roles: roleNames,
      priestId: user.priestId ?? null, // usually null on signup
    }

    const token = this.signToken(jwtUser)
    return { access_token: token }
  }

  /* ─────────────────────────────── Login ─────────────────────────────── */
  /**
   * Login returns JWT for an already-validated user.
   * We re-fetch from DB to ensure we always include up-to-date roles & priestId
   * (in case LocalStrategy’s user payload is stale/minimal).
   */
  async login(user: JwtUser): Promise<{ access_token: string }> {
    const dbUser = await this.prisma.user.findUnique({
      where: { id: user.id },
      include: { roles: { include: { role: true } } },
    })
    if (!dbUser) throw new UnauthorizedException()

    const roleNames = (dbUser.roles || [])
      .map((r) => r.role?.name)
      .filter(Boolean) as string[]

    const jwtUser: JwtUser = {
      id: dbUser.id,
      email: dbUser.email,
      roles: roleNames,
      priestId: dbUser.priestId ?? null,
    }

    return { access_token: this.signToken(jwtUser) }
  }

  /* ───────────────────────────── Helper ───────────────────────────── */
  /** Helper: sign a JWT from JwtUser (includes priestId for priest-only routes) */
  private signToken(user: JwtUser): string {
    const payload = {
      sub: user.id,
      email: user.email,
      roles: user.roles,         // e.g., ['Admin'] | ['Priest'] | ['user']
      priestId: user.priestId,   // number | null
    }
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d'
    return this.jwt.sign(payload, { expiresIn })
  }
}
