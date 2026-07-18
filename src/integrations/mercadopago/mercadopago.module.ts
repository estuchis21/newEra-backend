import { Module } from '@nestjs/common';
import { MercadopagoService } from './mercadopago.service';

@Module({
  providers: [MercadopagoService]
})
export class MercadopagoModule {}
