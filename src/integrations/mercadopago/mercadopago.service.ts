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

    /*
     * Para TEST:
     *
     * El Access Token de testing de Mercado Pago
     * comienza normalmente con APP_USR-
     *
     * NO uses el Access Token de producción.
     */

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
        ?.trim();

      const backendUrl = this.configService
        .get<string>('BACKEND_URL')
        ?.trim();

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

        notification_url:
          `${backendUrl}/pagos/webhook`,
      };

      /*
       * IMPORTANTE:
       *
       * Si estás trabajando localmente con
       * http://localhost, NO agregamos auto_return.
       *
       * auto_return requiere HTTPS.
       */

      if (
        frontendUrl.startsWith('https://')
      ) {
        body.auto_return = 'approved';
      }

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
        '================================',
      );

      const response =
        await this.preference.create({
          body,
        });

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

      /*
       * Para Checkout Pro, usamos init_point.
       *
       * En pruebas, Mercado Pago recomienda realizar
       * la compra con una cuenta de comprador de prueba.
       */

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