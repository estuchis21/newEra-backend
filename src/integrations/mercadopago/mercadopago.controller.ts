import {
  Body,
  Controller,
  Post,
} from '@nestjs/common';

import { MercadopagoService } from './mercadopago.service';

@Controller('pagos')
export class MercadopagoController {
  constructor(
    private readonly mercadopagoService:
      MercadopagoService,
  ) {}

  @Post('crear-preferencia')
  async crearPreferencia(
    @Body()
    body: {
      idCuota: number;
      monto: number;
      nombre: string;
      email: string;
    },
  ) {
    return await this.mercadopagoService.crearPreferencia(
      Number(body.idCuota),
      Number(body.monto),
      body.nombre,
      body.email,
      `Pago de cuota #${body.idCuota}`,
    );
  }

  @Post('webhook')
  async webhook(
    @Body() body: any,
  ) {
    console.log(
      'Webhook Mercado Pago:',
      body,
    );

    return {
      received: true,
    };
  }
}