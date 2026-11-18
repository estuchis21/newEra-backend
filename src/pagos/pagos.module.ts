import { Module } from '@nestjs/common';
import { PagosController } from './pagos.controller';
import { PagosService } from './pagos.service';
import { PagosRepository } from './pagos.repository/pagos.repository';
import { MercadopagoModule } from '../integrations/mercadopago/mercadopago.module';
import { MercadopagoController } from '../integrations/mercadopago/mercadopago.controller';
import { LiquidacionProfesorModule } from '../liquidacion-profesor/liquidacion-profesor.module';

@Module({
  imports: [MercadopagoModule, LiquidacionProfesorModule],
  // El webhook queda definido solamente en MercadopagoController.
  controllers: [PagosController, MercadopagoController],
  providers: [PagosService, PagosRepository],
  exports: [PagosService],
})
export class PagosModule {}
