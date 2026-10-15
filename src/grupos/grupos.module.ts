
import { Module } from '@nestjs/common';

import { GruposController } from './grupos.controller';
import { GruposService } from './grupos.service';
import { GruposRepository } from './grupos.repository/grupos.repository';
import { HorariosRepository } from '../horarios/horarios.repository/horarios.repository';

@Module({
  controllers: [GruposController],
  providers: [
    GruposService,
    GruposRepository,
    HorariosRepository,
  ],
  exports: [GruposService],
})
export class GruposModule {}
