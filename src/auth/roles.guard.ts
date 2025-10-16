// src/auth/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { ROLES_KEY } from './roles.decorator'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ])
    if (!required || required.length === 0) return true

    const req = ctx.switchToHttp().getRequest()
    const user = req.user
    if (!user?.roles) return false

    const need = required.map(r => String(r).toLowerCase())
    const have = (Array.isArray(user.roles) ? user.roles : [])
      .map((r: string) => String(r).toLowerCase())

    return need.some(r => have.includes(r))
  }
}
