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
    // ----------------------------------------------------------
    // VALIDAR ID
    // ----------------------------------------------------------

    if (
      !Number.isInteger(idCuota) ||
      idCuota <= 0
    ) {
      throw new BadRequestException(
        'El id de cuota no es válido',
      );
    }

    // ----------------------------------------------------------
    // OBTENER CUOTA
    // ----------------------------------------------------------

    const cuota =
      await this.pagosRepository
        .obtenerCuota(idCuota);

    if (!cuota) {
      throw new NotFoundException(
        `La cuota ${idCuota} no existe`,
      );
    }

    // ----------------------------------------------------------
    // OBTENER SALDO
    // ----------------------------------------------------------

    const saldo =
      Number(cuota.saldo);

    if (
      Number.isNaN(saldo) ||
      saldo < 0
    ) {
      throw new BadRequestException(
        'El saldo de la cuota no es válido',
      );
    }

    if (saldo <= 0) {
      throw new BadRequestException(
        'La cuota ya está pagada',
      );
    }

    // ----------------------------------------------------------
    // VALIDAR MONTO
    // ----------------------------------------------------------

    const montoNumerico =
      Number(monto);

    if (
      !Number.isFinite(montoNumerico) ||
      montoNumerico <= 0
    ) {
      throw new BadRequestException(
        'El monto debe ser mayor a 0',
      );
    }

    if (
      montoNumerico > saldo
    ) {
      throw new BadRequestException(
        `El monto supera el saldo disponible de ${saldo}`,
      );
    }

    // ----------------------------------------------------------
    // DATOS DEL ALUMNO
    // ----------------------------------------------------------

    const nombre =
      cuota.nombre ??
      'Alumno';

    const apellido =
      cuota.apellido ??
      '';

    const email =
      cuota.email;

    if (!email) {
      throw new BadRequestException(
        'La cuota no tiene un email asociado',
      );
    }

    const nombreCompleto =
      `${nombre} ${apellido}`.trim();

    // ----------------------------------------------------------
    // CREAR PREFERENCIA
    // ----------------------------------------------------------

    return await this.mercadopagoService
      .crearPreferencia(
        idCuota,
        montoNumerico,
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
    // ----------------------------------------------------------
    // VALIDAR ID
    // ----------------------------------------------------------

    if (
      !Number.isInteger(idMercadoPago) ||
      idMercadoPago <= 0
    ) {
      throw new BadRequestException(
        'El ID del pago de Mercado Pago no es válido',
      );
    }

    // ----------------------------------------------------------
    // IDEMPOTENCIA
    // ----------------------------------------------------------

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

    // ----------------------------------------------------------
    // CONSULTAR PAGO EN MERCADO PAGO
    // ----------------------------------------------------------

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
      '================================',
    );

    console.log(
      'PAGO MERCADO PAGO:',
      pago,
    );

    console.log(
      '================================',
    );

    // ----------------------------------------------------------
    // VERIFICAR ESTADO
    // ----------------------------------------------------------

    if (
      pago.status !== 'approved'
    ) {
      return {
        mensaje:
          'El pago todavía no está aprobado',

        estado:
          pago.status,
      };
    }

    // ----------------------------------------------------------
    // OBTENER MONTO
    // ----------------------------------------------------------

    const monto =
      Number(
        pago.transaction_amount,
      );

    if (
      !Number.isFinite(monto) ||
      monto <= 0
    ) {
      throw new BadRequestException(
        'El pago no tiene un monto válido',
      );
    }

    // ----------------------------------------------------------
    // OBTENER REFERENCIA
    // ----------------------------------------------------------

    const externalReference =
      pago.external_reference;

    if (!externalReference) {
      throw new BadRequestException(
        'El pago no tiene external_reference',
      );
    }

    const referencia =
      String(
        externalReference,
      );

    if (
      !referencia.startsWith(
        'cuota-',
      )
    ) {
      throw new BadRequestException(
        'La referencia del pago no corresponde a una cuota',
      );
    }

    // ----------------------------------------------------------
    // OBTENER ID CUOTA
    // ----------------------------------------------------------

    const idCuota =
      Number(
        referencia.replace(
          'cuota-',
          '',
        ),
      );

    if (
      !Number.isInteger(idCuota) ||
      idCuota <= 0
    ) {
      throw new BadRequestException(
        'El ID de cuota asociado al pago no es válido',
      );
    }

    // ----------------------------------------------------------
    // VERIFICAR CUOTA
    // ----------------------------------------------------------

    const cuota =
      await this.pagosRepository
        .obtenerCuota(
          idCuota,
        );

    if (!cuota) {
      throw new NotFoundException(
        `La cuota ${idCuota} no existe`,
      );
    }

    const saldo =
      Number(cuota.saldo);

    if (
      !Number.isFinite(saldo) ||
      saldo <= 0
    ) {
      throw new BadRequestException(
        'La cuota no tiene saldo pendiente',
      );
    }

    // ----------------------------------------------------------
    // VALIDAR MONTO CONTRA SALDO
    // ----------------------------------------------------------

    if (
      monto > saldo
    ) {
      throw new BadRequestException(
        `El pago de ${monto} supera el saldo de la cuota (${saldo})`,
      );
    }

    // ----------------------------------------------------------
    // REGISTRAR PAGO
    // ----------------------------------------------------------

    const resultado =
      await this.pagosRepository
        .registrarPagoCuota(
          idCuota,
          monto,
          idMercadoPago,
          'mercadopago',
        );

    // ----------------------------------------------------------
    // RESPUESTA
    // ----------------------------------------------------------

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