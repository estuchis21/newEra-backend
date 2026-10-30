import { Module } from '@nestjs/common';

import { LiquidacionProfesorController } from './liquidacion-profesor.controller';
import { LiquidacionProfesorService } from './liquidacion-profesor.service';
import { LiquidacionProfesorRepository } from './liquidacion-profesor.repository';

@Module({
  controllers: [LiquidacionProfesorController],
  providers: [
    LiquidacionProfesorService,
    LiquidacionProfesorRepository,
  ],
  exports: [
    LiquidacionProfesorService,
    LiquidacionProfesorRepository,
  ],
})
export class LiquidacionProfesorModule {}