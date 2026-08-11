import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import {
    MercadoPagoConfig,
    Payment,
    Preference,
} from 'mercadopago';

@Injectable()
export class MercadopagoService {

    private readonly preference: Preference;
    private readonly payment: Payment;

    constructor(
        private readonly configService: ConfigService,
    ) {

        const accessToken =
            this.configService.get<string>(
                'MERCADOPAGO_ACCESS_TOKEN',
            );

        if (!accessToken) {
            throw new Error(
                'MERCADOPAGO_ACCESS_TOKEN no configurado',
            );
        }

        const client =
            new MercadoPagoConfig({
                accessToken,
            });

        this.preference =
            new Preference(client);

        this.payment =
            new Payment(client);
    }


    // ============================================================
    // CREAR PREFERENCIA
    // ============================================================

    async crearPreferencia(
        idCuota: number,
        monto: number,
        nombre: string,
        email: string,
    ) {

        const frontendUrl =
            this.configService.get<string>(
                'FRONTEND_URL',
            );

        const backendUrl =
            this.configService.get<string>(
                'BACKEND_URL',
            );

        if (!frontendUrl) {
            throw new Error(
                'FRONTEND_URL no configurado',
            );
        }

        if (!backendUrl) {
            throw new Error(
                'BACKEND_URL no configurado',
            );
        }


        console.log(
            '================================',
        );

        console.log(
            'FRONTEND_URL:',
            frontendUrl,
        );

        console.log(
            'BACKEND_URL:',
            backendUrl,
        );

        console.log(
            'SUCCESS URL:',
            `${frontendUrl}/pago/exitoso`,
        );

        console.log(
            'WEBHOOK URL:',
            `${backendUrl}/pagos/webhook`,
        );

        console.log(
            '================================',
        );


        const response =
            await this.preference.create({

                body: {

                    items: [
                        {
                            id:
                                `cuota-${idCuota}`,

                            title:
                                `Pago de cuota ${idCuota}`,

                            quantity: 1,

                            currency_id: 'ARS',

                            unit_price:
                                Number(monto),
                        },
                    ],


                    payer: {
                        name: nombre,
                        email: email,
                    },


                    external_reference:
                        `cuota-${idCuota}`,


                    back_urls: {

                        success:
                            `${frontendUrl}/pago/exitoso`,

                        failure:
                            `${frontendUrl}/pago/fallido`,

                        pending:
                            `${frontendUrl}/pago/pendiente`,
                    },


                    auto_return:
                        'approved',


                    notification_url:
                        `${backendUrl}/pagos/webhook`,
                },
            });


        return {

            id:
                response.id,

            init_point:
                response.init_point,

            sandbox_init_point:
                response.sandbox_init_point,
        };
    }


    // ============================================================
    // OBTENER PAGO DE MERCADO PAGO
    // ============================================================

    async obtenerPago(
        idMercadoPago: number,
    ) {

        const response =
            await this.payment.get({
                id: idMercadoPago,
            });

        return response;
    }
}