// src/app.module.ts
import { Module }        from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module'
import { ServeStaticModule } from '@nestjs/serve-static'
import * as path from 'path'
// import { PrismaService } from './prisma.service';
import { PoojaModule }   from './pooja/pooja.module';
import { PriestModule }  from './priest/priest.module';
import { BookingModule } from './booking/booking.module';
import { AuthModule }    from './auth/auth.module';
import { EventsModule } from './events/events.module';

import { DonationsModule } from './donations/donations.module'
import { SponsorshipModule } from './sponsorship/sponsorship.module';
import { SettingsModule } from './settings/settings.module';
import { UsersModule }   from './users/users.module';
import { RolesModule }   from './roles/roles.module';
import { PermissionsModule }        from './permissions/permissions.module';
import { RolePermissionsModule }    from './role-permissions/role-permissions.module';
import { RoleUsersModule } from './role-users/role-users.module';
import { StaticPagesModule } from './static-pages/static-pages.module'
import { NotificationsModule } from './notifications/notifications.module'
import { MediaModule } from './media/media.module'
import { AlbumsModule } from './albums/albums.module'

@Module({
  
  imports: [ ServeStaticModule.forRoot({
    rootPath: path.join(process.cwd(), 'uploads'),
    serveRoot: '/uploads',
  }), PrismaModule, NotificationsModule, RoleUsersModule, UsersModule, RolesModule, AuthModule, StaticPagesModule, PoojaModule, PriestModule, BookingModule, EventsModule, DonationsModule, SponsorshipModule, SettingsModule, PermissionsModule, RolePermissionsModule, MediaModule, AlbumsModule],

})
export class AppModule {}
