import { Module } from '@nestjs/common';
import { ProfesoresService } from './profesores.service';
import { ProfesoresController } from './profesores.controller';
import { ProfesoresRepository } from './profesores.repository/profesores.repository';

@Module({
  controllers: [ProfesoresController],
  providers: [ProfesoresService, ProfesoresRepository],
})
export class ProfesoresModule {}
