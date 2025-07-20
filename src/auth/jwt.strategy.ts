// src/auth/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      // grab the token from the Authorization header as “Bearer …”
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // assert that process.env.JWT_SECRET is a string
      secretOrKey:    process.env.JWT_SECRET!, 
    });
  }

  // this runs after the token is verified
  async validate(payload: { sub: number; email: string; roles: string[] }) {
    return {
      userId: payload.sub,
      email:  payload.email,
      roles:  payload.roles,
    };
  }
}
