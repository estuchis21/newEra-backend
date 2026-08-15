import { Module } from '@nestjs/common';

import {
  PagosController,
} from './pagos.controller';

import {
  PagosService,
} from './pagos.service';

import {
  PagosRepository,
} from './pagos.repository/pagos.repository';

import {
  MercadopagoModule,
} from '../integrations/mercadopago/mercadopago.module';

@Module({
  imports: [
    MercadopagoModule,
  ],

  controllers: [
    PagosController,
  ],

  providers: [
    PagosService,
    PagosRepository,
  ],
})
export class PagosModule {}