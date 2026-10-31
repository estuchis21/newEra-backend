import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AlumnosService } from './alumnos.service';
import { AlumnosController } from './alumnos.controller';

import { AlumnosRepository } from './alumnos.repository/alumnos.repository';

import { MailModule } from '../mail/mail.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule,
    MailModule,
    AuthModule,
  ],

  controllers: [
    AlumnosController,
  ],

  providers: [
    AlumnosService,
    AlumnosRepository,
  ],

  exports: [
    AlumnosRepository,
  ],
})
export class AlumnosModule {}