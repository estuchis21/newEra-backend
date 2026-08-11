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

    return this.mercadopagoService
      .crearPreferencia(
        body.idCuota,
        body.monto,
        body.nombre,
        body.email,
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