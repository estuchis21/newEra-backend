import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import { PagosRepository } from './pagos.repository/pagos.repository';

import { MercadopagoService } from '../integrations/mercadopago/mercadopago.service';

@Injectable()
export class PagosService {
  constructor(
    private readonly pagosRepository: PagosRepository,

    private readonly mercadopagoService: MercadopagoService,
  ) {}

  // ============================================================
  // CREAR PAGO
  // ============================================================

  async crearPago(
    idCuota: number,
  ) {
    try {
      console.log(
        '================================',
      );

      console.log(
        'INICIANDO PAGO',
      );

      console.log(
        'CUOTA:',
        idCuota,
      );

      console.log(
        '================================',
      );

      // ========================================================
      // OBTENER CUOTA
      // ========================================================

      const cuota =
        await this.pagosRepository.obtenerCuota(
          idCuota,
        );

      if (!cuota) {
        throw new NotFoundException(
          'La cuota no existe',
        );
      }

      // ========================================================
      // VALIDACIONES
      // ========================================================

      if (!cuota.monto) {
        throw new InternalServerErrorException(
          'La cuota no tiene un monto válido',
        );
      }

      if (!cuota.email) {
        throw new InternalServerErrorException(
          'El alumno no tiene email',
        );
      }

      // ========================================================
      // DATOS
      // ========================================================

      const monto =
        Number(cuota.monto);

      const nombre =
        `${cuota.nombre} ${cuota.apellido}`.trim();

      const email =
        String(cuota.email).trim();

      const creditos =
        Number(cuota.paquete_creditos);

      const descripcionItem =
        cuota.paquete_nombre
          ? `${cuota.paquete_nombre} - ${creditos} créditos`
          : `Pago de cuota #${idCuota}`;

      // ========================================================
      // LOG
      // ========================================================

      console.log(
        '================================',
      );

      console.log(
        'DATOS DEL PAGO',
      );

      console.log(
        'CUOTA:',
        idCuota,
      );

      console.log(
        'ALUMNO:',
        nombre,
      );

      console.log(
        'EMAIL:',
        email,
      );

      console.log(
        'MONTO:',
        monto,
      );

      console.log(
        'CRÉDITOS:',
        creditos,
      );

      console.log(
        'DESCRIPCIÓN:',
        descripcionItem,
      );

      console.log(
        '================================',
      );

      // ========================================================
      // CREAR PREFERENCIA MERCADO PAGO
      // ========================================================

      const preference =
        await this.mercadopagoService.crearPreferencia(
          idCuota,
          monto,
          nombre,
          email,
          descripcionItem,
        );

      // ========================================================
      // RESPUESTA
      // ========================================================

      return {
        success: true,

        idCuota,

        monto,

        descripcion:
          descripcionItem,

        preferenceId:
          preference.id,

        init_point:
          preference.init_point,
      };

    } catch (error) {
      console.error(
        '================================',
      );

      console.error(
        'ERROR CREANDO PAGO',
      );

      console.error(error);

      console.error(
        '================================',
      );

      if (
        error instanceof NotFoundException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }

      throw new InternalServerErrorException(
        'No se pudo crear el pago',
      );
    }
  }

  // ============================================================
  // PROCESAR WEBHOOK MERCADO PAGO
  // ============================================================

  async procesarWebhookMercadoPago(
    idMercadoPago: number,
  ) {
    try {
      console.log(
        '================================',
      );

      console.log(
        'PROCESANDO WEBHOOK MERCADO PAGO',
      );

      console.log(
        'ID MERCADO PAGO:',
        idMercadoPago,
      );

      console.log(
        '================================',
      );

      // ========================================================
      // VALIDAR ID
      // ========================================================

      if (
        !Number.isInteger(idMercadoPago) ||
        idMercadoPago <= 0
      ) {
        console.error(
          'ID DE MERCADO PAGO INVÁLIDO:',
          idMercadoPago,
        );

        return {
          success: false,
          procesado: false,
          mensaje:
            'ID de Mercado Pago inválido',
        };
      }

      // ========================================================
      // OBTENER PAGO REAL DESDE MERCADO PAGO
      // ========================================================

      const pago =
        await this.mercadopagoService.obtenerPago(
          idMercadoPago,
        );

      console.log(
        'PAGO OBTENIDO DE MERCADO PAGO:',
        pago,
      );

      if (!pago) {
        console.error(
          'NO SE ENCONTRÓ EL PAGO',
        );

        return {
          success: false,
          procesado: false,
          mensaje:
            'Pago no encontrado',
        };
      }

      // ========================================================
      // VERIFICAR ESTADO
      // ========================================================

      const estado =
        String(
          pago.status || '',
        ).toLowerCase();

      console.log(
        'ESTADO DEL PAGO:',
        estado,
      );

      // Solamente registramos pagos aprobados

      if (estado !== 'approved') {
        console.log(
          'EL PAGO NO ESTÁ APROBADO.',
        );

        return {
          success: true,
          procesado: false,
          estado,
        };
      }

      // ========================================================
      // VERIFICAR DUPLICADO
      // ========================================================

      const yaExiste =
        await this.pagosRepository.existePagoMercadoPago(
          idMercadoPago,
        );

      if (yaExiste) {
        console.log(
          'EL PAGO YA ESTÁ REGISTRADO:',
          idMercadoPago,
        );

        return {
          success: true,
          procesado: false,
          duplicado: true,
        };
      }

      // ========================================================
      // OBTENER EXTERNAL REFERENCE
      // ========================================================

      const externalReference =
        String(
          pago.external_reference || '',
        );

      console.log(
        'EXTERNAL REFERENCE:',
        externalReference,
      );

      if (
        !externalReference.startsWith(
          'cuota-',
        )
      ) {
        console.error(
          'EXTERNAL REFERENCE INVÁLIDA:',
          externalReference,
        );

        return {
          success: false,
          procesado: false,
          mensaje:
            'El pago no contiene una cuota válida',
        };
      }

      // ========================================================
      // OBTENER ID DE CUOTA
      // ========================================================

      const idCuota = Number(
        externalReference.replace(
          'cuota-',
          '',
        ),
      );

      if (
        !Number.isInteger(idCuota) ||
        idCuota <= 0
      ) {
        console.error(
          'ID DE CUOTA INVÁLIDO:',
          idCuota,
        );

        return {
          success: false,
          procesado: false,
          mensaje:
            'ID de cuota inválido',
        };
      }

      // ========================================================
      // OBTENER MONTO
      // ========================================================

      const monto =
        Number(
          pago.transaction_amount ?? 0,
        );

      if (
        !Number.isFinite(monto) ||
        monto <= 0
      ) {
        console.error(
          'MONTO INVÁLIDO:',
          monto,
        );

        return {
          success: false,
          procesado: false,
          mensaje:
            'Monto del pago inválido',
        };
      }

      // ========================================================
      // OBTENER MÉTODO DE PAGO
      // ========================================================

      const metodoPago =
        String(
          pago.payment_method_id ??
          pago.payment_type_id ??
          'Mercado Pago',
        );

      console.log(
        '================================',
      );

      console.log(
        'DATOS A REGISTRAR',
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
        'ID MERCADO PAGO:',
        idMercadoPago,
      );

      console.log(
        'MÉTODO DE PAGO:',
        metodoPago,
      );

      console.log(
        '================================',
      );

      // ========================================================
      // REGISTRAR EN BASE DE DATOS
      // ========================================================

      await this.pagosRepository.registrarPagoCuota(
        idCuota,
        monto,
        idMercadoPago,
        metodoPago,
      );

      // ========================================================
      // ÉXITO
      // ========================================================

      console.log(
        '================================',
      );

      console.log(
        'PAGO REGISTRADO CORRECTAMENTE',
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
        'ID MERCADO PAGO:',
        idMercadoPago,
      );

      console.log(
        '================================',
      );

      return {
        success: true,
        procesado: true,
        idCuota,
        idMercadoPago,
        monto,
        metodoPago,
      };

    } catch (error) {
      console.error(
        '================================',
      );

      console.error(
        'ERROR PROCESANDO WEBHOOK',
      );

      console.error(error);

      console.error(
        '================================',
      );

      throw error;
    }
  }
}