import { Module } from '@nestjs/common';
import { HorariosService } from './horarios.service';
import { HorariosController } from './horarios.controller';
import { HorariosRepository } from './horarios.repository/horarios.repository';

@Module({
  controllers: [HorariosController],
  providers: [HorariosService, HorariosRepository],
})
export class HorariosModule {}
