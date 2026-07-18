import { Module } from '@nestjs/common';
import { CuotasService } from './cuotas.service';
import { CuotasController } from './cuotas.controller';
import { CuotasRepository } from './cuotas.repository/cuotas.repository';

@Module({
  controllers: [CuotasController],
  providers: [CuotasService, CuotasRepository],
})
export class CuotasModule {}
