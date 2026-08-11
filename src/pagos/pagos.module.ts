import { Module } from '@nestjs/common';

import { PagosService } from './pagos.service';
import { PagosController } from './pagos.controller';
import { PagosRepository } from './pagos.repository/pagos.repository';

import { MercadopagoModule } from '../integrations/mercadopago/mercadopago.module';

import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [
    DatabaseModule,
    MercadopagoModule,
  ],

  controllers: [
    PagosController,
  ],

  providers: [
    PagosService,
    PagosRepository,
  ],

  exports: [
    PagosService,
  ],
})
export class PagosModule {}