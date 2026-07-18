import { Module } from '@nestjs/common';
import { AsistenciasService } from './asistencias.service';
import { AsistenciasController } from './asistencias.controller';
import { AsistenciasRepository } from './asistencias.repository/asistencias.repository';

@Module({
  controllers: [AsistenciasController],
  providers: [AsistenciasService, AsistenciasRepository],
})
export class AsistenciasModule {}
