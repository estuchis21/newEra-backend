import { Module } from '@nestjs/common';
import { InscripcionesService } from './inscripciones.service';
import { InscripcionesController } from './inscripciones.controller';
import { InscripcionesRepository } from './inscripciones.repository/inscripciones.repository';

@Module({
  controllers: [InscripcionesController],
  providers: [InscripcionesService, InscripcionesRepository],
})
export class InscripcionesModule {}
