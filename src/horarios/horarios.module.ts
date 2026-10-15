
import { Module } from '@nestjs/common';

import { HorariosController } from './horarios.controller';
import { HorariosService } from './horarios.service';
import { HorariosRepository } from './horarios.repository/horarios.repository';

@Module({
  controllers: [HorariosController],
  providers: [
    HorariosService,
    HorariosRepository,
  ],
  exports: [HorariosService],
})
export class HorariosModule {}
