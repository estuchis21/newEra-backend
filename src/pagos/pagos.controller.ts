import {
  Body,
  Controller,
  Post,
  Query,
} from '@nestjs/common';

import {
  PagosService,
} from './pagos.service';

@Controller('pagos')
export class PagosController {
  constructor(
    private readonly pagosService:
      PagosService,
  ) {}

  // ============================================================
  // CREAR CHECKOUT
  // ============================================================

  @Post('crear')
  async crearPago(
    @Body()
    body: {
      id_cuota: number;
      monto: number;
    },
  ) {
    return await this.pagosService
      .crearPago(
        Number(body.id_cuota),
        Number(body.monto),
      );
  }

  // ============================================================
  // WEBHOOK MERCADO PAGO
  // ============================================================

  @Post('webhook')
  async webhook(
    @Query('id') id: string,
    @Query('topic') topic: string,
    @Query('type') type: string,

    @Body() body: any,
  ) {
    console.log(
      '================================',
    );

    console.log(
      'WEBHOOK MERCADO PAGO',
    );

    console.log(
      'QUERY:',
      {
        id,
        topic,
        type,
      },
    );

    console.log(
      'BODY:',
      body,
    );

    console.log(
      '================================',
    );

    // ----------------------------------------------------------
    // OBTENER PAYMENT ID
    // ----------------------------------------------------------

    const paymentId =
      body?.data?.id ??
      id;

    if (!paymentId) {
      return {
        received: true,

        mensaje:
          'Webhook recibido sin payment ID',
      };
    }

    // ----------------------------------------------------------
    // VALIDAR PAYMENT ID
    // ----------------------------------------------------------

    const paymentIdNumber =
      Number(paymentId);

    if (
      !Number.isInteger(
        paymentIdNumber,
      ) ||
      paymentIdNumber <= 0
    ) {
      return {
        received: true,

        mensaje:
          'Payment ID inválido',
      };
    }

    // ----------------------------------------------------------
    // PROCESAR PAGO
    // ----------------------------------------------------------

    try {
      const resultado =
        await this.pagosService
          .procesarPago(
            paymentIdNumber,
          );

      return {
        received: true,

        resultado,
      };
    } catch (error) {
      console.error(
        'Error procesando webhook:',
        error,
      );

      /*
       * Mercado Pago puede reenviar
       * la notificación.
       *
       * El repository verifica si el
       * pago ya fue registrado.
       */

      return {
        received: true,

        error:
          error instanceof Error
            ? error.message
            : 'Error procesando pago',
      };
    }
  }
}