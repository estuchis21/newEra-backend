import {
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { MercadoPagoConfig, Payment, Preference } from 'mercadopago';

@Injectable()
export class MercadopagoService {
  private readonly client: MercadoPagoConfig;
  private readonly preference: Preference;
  private readonly payment: Payment;

  constructor() {
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!accessToken) {
      throw new Error('Falta configurar MERCADOPAGO_ACCESS_TOKEN.');
    }

    this.client = new MercadoPagoConfig({ accessToken });
    this.preference = new Preference(this.client);
    this.payment = new Payment(this.client);
  }

  async crearPreferencia(
    idCuota: number,
    monto: number,
    nombre: string,
    email: string,
    descripcion: string,
  ) {
    const backendUrl = (process.env.BACKEND_URL ?? '').replace(/\/$/, '');
    const frontendUrl = (process.env.FRONTEND_URL ?? '').replace(/\/$/, '');

    if (!backendUrl || !frontendUrl) {
      throw new InternalServerErrorException(
        'Faltan BACKEND_URL o FRONTEND_URL para configurar Mercado Pago.',
      );
    }

    return this.preference.create({
      body: {
        items: [{
          id: `cuota-${idCuota}`,
          title: descripcion,
          description: descripcion,
          quantity: 1,
          currency_id: 'ARS',
          unit_price: Number(monto.toFixed(2)),
        }],
        payer: {
          name: nombre || undefined,
          email,
        },
        external_reference: `cuota-${idCuota}`,
        back_urls: {
          success: `${frontendUrl}/pagos/resultado?estado=exitoso`,
          pending: `${frontendUrl}/pagos/resultado?estado=pendiente`,
          failure: `${frontendUrl}/pagos/resultado?estado=fallido`,
        },
        auto_return: 'approved',
        notification_url: `${backendUrl}/api/pagos/webhook`,
      },
    });
  }

  async obtenerPago(idMercadoPago: number) {
    return this.payment.get({ id: idMercadoPago });
  }
}
