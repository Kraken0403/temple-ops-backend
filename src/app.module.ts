// src/app.module.ts
import { Module }        from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module'
// import { PrismaService } from './prisma.service';
import { PoojaModule }   from './pooja/pooja.module';
import { PriestModule }  from './priest/priest.module';
import { BookingModule } from './booking/booking.module';
import { AuthModule }    from './auth/auth.module';
import { EventsModule } from './events/events.module';
import { PagesModule } from './pages/pages.module'
import { DonationsModule } from './donations/donations.module'
import { SponsorshipModule } from './sponsorship/sponsorship.module';
import { SettingsModule } from './settings/settings.module';
import { UsersModule }   from './users/users.module';
import { RolesModule }   from './roles/roles.module';
import { PermissionsModule }        from './permissions/permissions.module';
import { RolePermissionsModule }    from './role-permissions/role-permissions.module';
import { RoleUsersModule } from './role-users/role-users.module';

@Module({
  imports: [PrismaModule, RoleUsersModule, UsersModule, RolesModule, AuthModule, PoojaModule, PriestModule, BookingModule, EventsModule, PagesModule, DonationsModule, SponsorshipModule, SettingsModule, PermissionsModule, RolePermissionsModule],

})
export class AppModule {}
