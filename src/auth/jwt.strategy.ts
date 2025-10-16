// src/auth/jwt.strategy.ts
import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'

type JwtPayload = {
  sub: number
  email: string
  roles: string[]
  priestId?: number | null
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET!,
      ignoreExpiration: false,
    })
  }

  async validate(payload: JwtPayload) {
    // This becomes req.user
    return {
      id: payload.sub,
      email: payload.email,
      roles: payload.roles || [],
      priestId: payload.priestId ?? null,
    }
  }
}
