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

import {
  DatabaseModule,
} from '../database/database.module';

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