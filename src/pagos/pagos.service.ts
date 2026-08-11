import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';

import {
    PagosRepository,
} from './pagos.repository/pagos.repository';

import {
    MercadopagoService,
} from '../integrations/mercadopago/mercadopago.service';

@Injectable()
export class PagosService {

    constructor(
        private readonly pagosRepository:
            PagosRepository,

        private readonly mercadopagoService:
            MercadopagoService,
    ) {}


    // ============================================================
    // CREAR CHECKOUT
    // ============================================================

    async crearPago(
        idCuota: number,
        monto: number,
    ) {

        const cuota =
            await this.pagosRepository
                .obtenerCuota(idCuota);


        if (!cuota) {

            throw new NotFoundException(
                `La cuota ${idCuota} no existe`,
            );
        }


        const saldo =
            Number(cuota.saldo);


        if (saldo <= 0) {

            throw new BadRequestException(
                'La cuota ya está pagada',
            );
        }


        // ========================================================
        // VALIDAR MONTO
        // ========================================================

        if (!monto || monto <= 0) {

            throw new BadRequestException(
                'El monto debe ser mayor a 0',
            );
        }


        if (monto > saldo) {

            throw new BadRequestException(
                `El monto supera el saldo disponible de ${saldo}`,
            );
        }


        const nombre =
            cuota.nombre ??
            'Alumno';


        const apellido =
            cuota.apellido ??
            '';


        const email =
            cuota.email ??
            'test_user@test.com';


        const nombreCompleto =
            `${nombre} ${apellido}`.trim();


        // ========================================================
        // CREAR CHECKOUT
        // ========================================================

        return await this.mercadopagoService
            .crearPreferencia(
                idCuota,
                monto,
                nombreCompleto,
                email,
            );
    }


    // ============================================================
    // PROCESAR WEBHOOK
    // ============================================================

    async procesarPago(
        idMercadoPago: number,
    ) {

        // ========================================================
        // EVITAR DUPLICAR EL PAGO
        // ========================================================

        const existe =
            await this.pagosRepository
                .existePagoMercadoPago(
                    idMercadoPago,
                );


        if (existe) {

            return {
                mensaje:
                    'El pago ya fue procesado',
            };
        }


        // ========================================================
        // CONSULTAR PAGO EN MERCADO PAGO
        // ========================================================

        const pago =
            await this.mercadopagoService
                .obtenerPago(
                    idMercadoPago,
                );


        if (!pago) {

            throw new NotFoundException(
                'No se encontró el pago en Mercado Pago',
            );
        }


        console.log(
            'PAGO MERCADO PAGO:',
            pago,
        );


        // ========================================================
        // VERIFICAR ESTADO
        // ========================================================

        if (pago.status !== 'approved') {

            return {
                mensaje:
                    'El pago todavía no está aprobado',

                estado:
                    pago.status,
            };
        }


        // ========================================================
        // OBTENER MONTO
        // ========================================================

        const monto =
            Number(
                pago.transaction_amount,
            );


        if (!monto || monto <= 0) {

            throw new BadRequestException(
                'El pago no tiene un monto válido',
            );
        }


        // ========================================================
        // OBTENER CUOTA
        // ========================================================

        let idCuota: number | null = null;


        /*
         * Mercado Pago conserva external_reference:
         *
         * cuota-1
         * cuota-25
         * cuota-100
         *
         */

        if (pago.external_reference) {

            const referencia =
                String(
                    pago.external_reference,
                );


            if (
                referencia.startsWith(
                    'cuota-',
                )
            ) {

                idCuota =
                    Number(
                        referencia.replace(
                            'cuota-',
                            '',
                        ),
                    );
            }
        }


        if (!idCuota) {

            throw new BadRequestException(
                'No se pudo determinar la cuota asociada al pago',
            );
        }


        // ========================================================
        // REGISTRAR EN POSTGRESQL
        // ========================================================

        const resultado =
            await this.pagosRepository
                .registrarPagoCuota(
                    idCuota,
                    monto,
                    idMercadoPago,
                    'mercadopago',
                );


        return {

            mensaje:
                'Pago aprobado y registrado',

            id_mercado_pago:
                idMercadoPago,

            id_cuota:
                idCuota,

            monto,

            resultado,
        };
    }
}