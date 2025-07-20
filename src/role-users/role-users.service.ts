import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class RoleUsersService {
  constructor(private readonly prisma: PrismaService) {}

  /** list all users in a role */
  async findByRole(roleId: number) {
    return this.prisma.userRole.findMany({
      where: { roleId },
      include: { user: true },
    });
  }

  /** assign a user into a role */
  async assign(roleId: number, userId: number) {
    // optional: verify both exist
    await this.ensureRole(roleId);
    await this.ensureUser(userId);

    return this.prisma.userRole.create({
      data: { roleId, userId },
      include: { user: true },
    });
  }

  /** unassign */
  async remove(roleId: number, userId: number) {
    await this.prisma.userRole.delete({
      where: { userId_roleId: { roleId, userId } },
    });
    return { removed: true };
  }

  private async ensureRole(id: number) {
    const r = await this.prisma.role.findUnique({ where: { id } });
    if (!r) throw new NotFoundException(`Role ${id} not found`);
  }

  private async ensureUser(id: number) {
    const u = await this.prisma.user.findUnique({ where: { id } });
    if (!u) throw new NotFoundException(`User ${id} not found`);
  }
}
