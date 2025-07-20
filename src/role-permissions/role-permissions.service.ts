import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class RolePermissionsService {
  constructor(private prisma: PrismaService) {}

  async assign(roleId: number, permissionIds: number[]) {
    // remove any existing duplicates first (optional)
    await this.prisma.rolePermission.deleteMany({ where: { roleId } });

    return this.prisma.$transaction(
      permissionIds.map(pid =>
        this.prisma.rolePermission.create({
          data: { roleId, permissionId: pid },
        })
      )
    );
  }

  async findByRole(roleId: number) {
    const rps = await this.prisma.rolePermission.findMany({
      where: { roleId },
      include: { permission: true },
    });
    return rps.map(rp => rp.permission);
  }

  async remove(roleId: number, permissionId: number) {
    await this.prisma.rolePermission.delete({
      where: { roleId_permissionId: { roleId, permissionId } },
    });
  }
}
