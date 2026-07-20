import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlumnosService } from './alumnos.service';
import { AlumnosController } from './alumnos.controller';
import { AlumnosRepository } from './alumnos.repository/alumnos.repository';

@Module({
  imports: [
    TypeOrmModule,
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