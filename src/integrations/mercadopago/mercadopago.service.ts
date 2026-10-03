import {
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';

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
    const accessToken = this.configService
      .get<string>('MERCADOPAGO_ACCESS_TOKEN')
      ?.trim();

    if (!accessToken) {
      throw new Error(
        'MERCADOPAGO_ACCESS_TOKEN no configurado',
      );
    }

    console.log('================================');
    console.log('MERCADO PAGO');
    console.log(
      'TOKEN:',
      accessToken.substring(0, 12) + '...',
    );
    console.log(
      'ENTORNO:',
      accessToken.startsWith('APP_USR-')
        ? 'TEST / TESTING'
        : 'REVISAR CREDENCIAL',
    );
    console.log('================================');

    const client = new MercadoPagoConfig({
      accessToken,
    });

    this.preference = new Preference(client);
    this.payment = new Payment(client);
  }

  // ============================================================
  // CREAR PREFERENCIA
  // ============================================================

  async crearPreferencia(
    idCuota: number,
    monto: number,
    nombre: string,
    email: string,
    descripcionItem: string,
  ) {
    try {
      const frontendUrl = this.configService
        .get<string>('FRONTEND_URL')
        ?.trim()
        .replace(/\/$/, '');

      const backendUrl = this.configService
        .get<string>('BACKEND_URL')
        ?.trim()
        .replace(/\/$/, '');

      if (!frontendUrl) {
        throw new InternalServerErrorException(
          'FRONTEND_URL no configurado',
        );
      }

      if (!backendUrl) {
        throw new InternalServerErrorException(
          'BACKEND_URL no configurado',
        );
      }

      if (
        !Number.isFinite(Number(monto)) ||
        Number(monto) <= 0
      ) {
        throw new InternalServerErrorException(
          'El monto no es válido',
        );
      }

      if (!email) {
        throw new InternalServerErrorException(
          'El email no es válido',
        );
      }

      // ========================================================
      // PREFERENCIA
      // ========================================================

      const body: any = {
        items: [
          {
            id: `cuota-${idCuota}`,

            title:
              descripcionItem ||
              `Pago de cuota #${idCuota}`,

            description:
              `Pago de cuota #${idCuota}`,

            quantity: 1,

            currency_id: 'ARS',

            unit_price: Number(monto),
          },
        ],

        payer: {
          name: String(nombre || 'Alumno'),
          email: String(email),
        },

        /*
         * Lo usamos después en el webhook
         * para saber qué cuota se pagó.
         */
        external_reference:
          `cuota-${idCuota}`,

        // ======================================================
        // URLS DE RETORNO
        // ======================================================

        back_urls: {
          success:
            `${frontendUrl}/pago/exitoso`,

          failure:
            `${frontendUrl}/pago/fallido`,

          pending:
            `${frontendUrl}/pago/pendiente`,
        },

        // ======================================================
        // WEBHOOK
        // ======================================================

        /*
         * IMPORTANTE:
         *
         * Nest tiene:
         *
         * /api
         *
         * como prefijo global.
         *
         * Por eso el webhook real es:
         *
         * /api/pagos/webhook
         */

        notification_url:
          `${backendUrl}/api/pagos/webhook`,
      };

      // ========================================================
      // AUTO RETURN
      // ========================================================

      if (frontendUrl.startsWith('https://')) {
        body.auto_return = 'approved';
      }

      // ========================================================
      // LOGS
      // ========================================================

      console.log(
        '================================',
      );

      console.log(
        'CREANDO PREFERENCIA MERCADO PAGO',
      );

      console.log(
        'CUOTA:',
        idCuota,
      );

      console.log(
        'MONTO:',
        monto,
      );

      console.log(
        'DESCRIPCIÓN:',
        descripcionItem,
      );

      console.log(
        'EMAIL:',
        email,
      );

      console.log(
        'FRONTEND:',
        frontendUrl,
      );

      console.log(
        'BACKEND:',
        backendUrl,
      );

      console.log(
        'WEBHOOK:',
        `${backendUrl}/api/pagos/webhook`,
      );

      console.log(
        'EXTERNAL REFERENCE:',
        `cuota-${idCuota}`,
      );

      console.log(
        '================================',
      );

      // ========================================================
      // CREAR PREFERENCIA EN MERCADO PAGO
      // ========================================================

      const response =
        await this.preference.create({
          body,
        });

      // ========================================================
      // RESPUESTA
      // ========================================================

      console.log(
        '================================',
      );

      console.log(
        'PREFERENCIA CREADA',
      );

      console.log(
        'ID:',
        response.id,
      );

      console.log(
        'INIT POINT:',
        response.init_point,
      );

      console.log(
        'SANDBOX INIT POINT:',
        response.sandbox_init_point,
      );

      console.log(
        '================================',
      );

      return {
        success: true,

        id: response.id,

        init_point:
          response.init_point,

        sandbox_init_point:
          response.sandbox_init_point,
      };

    } catch (error) {
      console.error(
        '================================',
      );

      console.error(
        'ERROR MERCADO PAGO',
      );

      console.error(error);

      console.error(
        '================================',
      );

      if (
        error instanceof
        InternalServerErrorException
      ) {
        throw error;
      }

      throw new InternalServerErrorException(
        'No se pudo crear la preferencia de Mercado Pago',
      );
    }
  }

  // ============================================================
  // OBTENER PAGO
  // ============================================================

  async obtenerPago(
    idMercadoPago: number,
  ) {
    return await this.payment.get({
      id: idMercadoPago,
    });
  }
}