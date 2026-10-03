import {
  Body,
  Controller,
  Post,
  Query,
} from '@nestjs/common';

import { MercadopagoService } from './mercadopago.service';

import { PagosService } from '../../pagos/pagos.service';

@Controller('pagos')
export class MercadopagoController {
  constructor(
    private readonly mercadopagoService:
      MercadopagoService,

    private readonly pagosService:
      PagosService,
  ) {}

  // ==========================================================
  // CREAR PREFERENCIA
  // ==========================================================

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

  // ==========================================================
  // WEBHOOK MERCADO PAGO
  // ==========================================================

  @Post('webhook')
  async webhook(
    @Body() body: any,
    @Query() query: any,
  ) {
    console.log(
      '================================',
    );

    console.log(
      'WEBHOOK RECIBIDO DE MERCADO PAGO',
    );

    console.log(
      'BODY:',
      body,
    );

    console.log(
      'QUERY:',
      query,
    );

    console.log(
      '================================',
    );

    // Mercado Pago puede enviar el ID
    // en body.data.id o mediante query params.

    const idMercadoPago =
      Number(
        body?.data?.id ??
        body?.id ??
        query?.['data.id'] ??
        query?.id,
      );

    console.log(
      'ID MERCADO PAGO DETECTADO:',
      idMercadoPago,
    );

    // ==========================================================
    // VALIDAR ID
    // ==========================================================

    if (
      !Number.isInteger(idMercadoPago) ||
      idMercadoPago <= 0
    ) {
      console.warn(
        'WEBHOOK SIN ID DE PAGO VÁLIDO',
      );

      return {
        received: true,
        procesado: false,
      };
    }

    // ==========================================================
    // PROCESAR PAGO
    // ==========================================================

    const resultado =
      await this.pagosService.procesarWebhookMercadoPago(
        idMercadoPago,
      );

    return {
      received: true,
      ...resultado,
    };
  }
}