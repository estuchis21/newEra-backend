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
                body.id_cuota,
                body.monto,
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


        // ========================================================
        // OBTENER PAYMENT ID
        // ========================================================

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


        // ========================================================
        // PROCESAR
        // ========================================================

        try {

            const resultado =
                await this.pagosService
                    .procesarPago(
                        Number(paymentId),
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
             * Mercado Pago puede volver a enviar
             * una notificación.
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