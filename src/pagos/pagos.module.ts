import { Module } from '@nestjs/common';
import { PagosService } from './pagos.service';
import { PagosController } from './pagos.controller';
import { PagosRepository } from './pagos.repository/pagos.repository';

@Module({
  controllers: [PagosController],
  providers: [PagosService, PagosRepository],
})
export class PagosModule {}
