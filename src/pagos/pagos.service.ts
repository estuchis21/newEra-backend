
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import { PagosRepository } from './pagos.repository/pagos.repository';
import { LiquidacionProfesorService } from '../liquidacion-profesor/liquidacion-profesor.service';
import { MercadopagoService } from '../integrations/mercadopago/mercadopago.service';

@Injectable()
export class PagosService {
  constructor(
    private readonly pagosRepository: PagosRepository,
    private readonly liquidacionProfesorService: LiquidacionProfesorService,
    private readonly mercadopagoService: MercadopagoService,
  ) {}

  async crearPago(idCuota: number) {
    if (!Number.isSafeInteger(idCuota) || idCuota <= 0) {
      throw new BadRequestException('ID de cuota inválido.');
    }

    const cuota = await this.pagosRepository.obtenerCuota(idCuota);

    if (!cuota) {
      throw new NotFoundException('La cuota no existe.');
    }

    if (String(cuota.estado).trim().toLowerCase() === 'pagado') {
      throw new BadRequestException('La cuota ya está pagada.');
    }

    const monto = Number(cuota.monto);

    if (!Number.isFinite(monto) || monto <= 0) {
      throw new InternalServerErrorException(
        'La cuota tiene un importe inválido.',
      );
    }

    if (!cuota.email) {
      throw new BadRequestException(
        'El alumno no tiene email registrado.',
      );
    }

    const nombre = `${cuota.nombre ?? ''} ${cuota.apellido ?? ''}`.trim();
    const descripcion = `Pago de cuota #${idCuota}`;

    const preference = await this.mercadopagoService.crearPreferencia(
      idCuota,
      monto,
      nombre,
      cuota.email.trim(),
      descripcion,
    );

    if (!preference?.id || !preference?.init_point) {
      throw new InternalServerErrorException(
        'Mercado Pago no devolvió una preferencia válida.',
      );
    }

    return {
      success: true,
      idCuota,
      monto,
      preferenceId: preference.id,
      init_point: preference.init_point,
    };
  }

  async procesarWebhookMercadoPago(idMercadoPago: number) {
    // 1. Validar el identificador recibido.
    if (
      !Number.isSafeInteger(idMercadoPago) ||
      idMercadoPago <= 0
    ) {
      return {
        success: false,
        procesado: false,
        mensaje: 'ID de pago inválido.',
      };
    }

    // 2. Consultar el pago directamente en Mercado Pago.
    const mp = await this.mercadopagoService.obtenerPago(idMercadoPago);

    if (!mp) {
      return {
        success: false,
        procesado: false,
        mensaje: 'Pago inexistente en Mercado Pago.',
      };
    }

    // 3. Procesar exclusivamente pagos aprobados.
    if (String(mp.status ?? '').toLowerCase() !== 'approved') {
      return {
        success: true,
        procesado: false,
        estado: mp.status ?? 'desconocido',
        mensaje: 'El pago todavía no está aprobado.',
      };
    }

    // 4. Recuperar el ID de cuota desde external_reference.
    const externalReference = String(mp.external_reference ?? '');

    const match = /^cuota-(\d+)$/.exec(externalReference);

    if (!match) {
      return {
        success: false,
        procesado: false,
        mensaje: 'Referencia de cuota inválida.',
      };
    }

    const idCuota = Number(match[1]);

    if (!Number.isSafeInteger(idCuota) || idCuota <= 0) {
      return {
        success: false,
        procesado: false,
        mensaje: 'ID de cuota inválido en la referencia de Mercado Pago.',
      };
    }

    // 5. Verificar que la cuota exista.
    const cuota = await this.pagosRepository.obtenerCuota(idCuota);

    if (!cuota) {
      return {
        success: false,
        procesado: false,
        mensaje: 'No existe la cuota indicada.',
      };
    }

    // 6. Validar importes.
    const monto = Number(mp.transaction_amount);
    const montoCuota = Number(cuota.monto);

    if (
      !Number.isFinite(monto) ||
      monto <= 0 ||
      !Number.isFinite(montoCuota) ||
      montoCuota <= 0
    ) {
      return {
        success: false,
        procesado: false,
        mensaje: 'Importe inválido.',
      };
    }

    // Esta integración genera preferencias por el total de la cuota.
    // No se aceptan pagos parciales ni superiores.
    if (Math.abs(monto - montoCuota) > 0.01) {
      return {
        success: false,
        procesado: false,
        mensaje: `El importe aprobado (${monto}) no coincide con la cuota (${montoCuota}).`,
      };
    }

    // 7. Validar moneda.
    if (mp.currency_id && mp.currency_id !== 'ARS') {
      return {
        success: false,
        procesado: false,
        mensaje: 'La moneda del pago no es ARS.',
      };
    }

    // 8. Preparar información del pago.
    const metodoPago = String(
      mp.payment_method_id ??
        mp.payment_type_id ??
        'Mercado Pago',
    );

    const detalle = [
      `status=${mp.status}`,
      `currency=${mp.currency_id ?? 'no_informada'}`,
      `collector_id=${mp.collector_id ?? 'no_informado'}`,
      `payment_type=${mp.payment_type_id ?? 'no_informado'}`,
    ].join('; ');

    // 9. Registrar o recuperar el pago.
    // El repositorio utiliza ON CONFLICT para evitar duplicados.
    // También actualiza el estado de la cuota aunque el pago ya exista.
    const pago = await this.pagosRepository.registrarPago(
      idCuota,
      monto,
      metodoPago,
      idMercadoPago,
      detalle,
    );

    // 10. Generar liquidaciones solamente cuando la cuota esté pagada.
    const cuotaPagada =
      String(pago.estado_cuota).trim().toLowerCase() === 'pagado';

    const liquidaciones = cuotaPagada
      ? await this.liquidacionProfesorService.generarPorCuota(idCuota)
      : null;

    // 11. Devolver el resultado.
    return {
      success: true,
      procesado: true,
      idCuota,
      idMercadoPago,
      monto,
      metodoPago,
      pago,
      liquidaciones,
      mensaje: cuotaPagada
        ? 'Pago registrado y cuota actualizada correctamente.'
        : 'Pago registrado, pero todavía no se alcanzó el importe total de la cuota.',
    };
  }
}
