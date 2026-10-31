
import {
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

  // ============================================================
  // CREAR PAGO
  // ============================================================

  async crearPago(idCuota: number) {
    try {
      console.log('================================');
      console.log('INICIANDO PAGO');
      console.log('CUOTA:', idCuota);
      console.log('================================');

      // --------------------------------------------------------
      // VALIDAR ID
      // --------------------------------------------------------

      if (!Number.isInteger(idCuota) || idCuota <= 0) {
        throw new NotFoundException('ID de cuota inválido');
      }

      // --------------------------------------------------------
      // OBTENER CUOTA
      // --------------------------------------------------------

      const cuota = await this.pagosRepository.obtenerCuota(idCuota);

      if (!cuota) {
        throw new NotFoundException('La cuota no existe');
      }

      // --------------------------------------------------------
      // VALIDACIONES
      // --------------------------------------------------------

      const monto = Number(cuota.monto);

      if (!Number.isFinite(monto) || monto <= 0) {
        throw new InternalServerErrorException(
          'La cuota no tiene un monto válido',
        );
      }

      if (!cuota.email) {
        throw new InternalServerErrorException(
          'El alumno no tiene email registrado',
        );
      }

      // --------------------------------------------------------
      // DATOS DEL ALUMNO
      // --------------------------------------------------------

      const nombre = `${cuota.nombre ?? ''} ${cuota.apellido ?? ''}`.trim();

      const email = String(cuota.email).trim();

      const creditos = Number(cuota.paquete_creditos ?? 0);

      const descripcionItem = cuota.paquete_nombre
        ? `${cuota.paquete_nombre} - ${creditos} créditos`
        : `Pago de cuota #${idCuota}`;

      console.log('================================');
      console.log('DATOS DEL PAGO');
      console.log('CUOTA:', idCuota);
      console.log('ALUMNO:', nombre);
      console.log('EMAIL:', email);
      console.log('MONTO:', monto);
      console.log('DESCRIPCIÓN:', descripcionItem);
      console.log('================================');

      // --------------------------------------------------------
      // CREAR PREFERENCIA MERCADO PAGO
      // --------------------------------------------------------

      const preference =
        await this.mercadopagoService.crearPreferencia(
          idCuota,
          monto,
          nombre,
          email,
          descripcionItem,
        );

      if (!preference?.id || !preference?.init_point) {
        throw new InternalServerErrorException(
          'Mercado Pago no devolvió una preferencia válida',
        );
      }

      // --------------------------------------------------------
      // RESPUESTA
      // --------------------------------------------------------

      return {
        success: true,
        idCuota,
        monto,
        descripcion: descripcionItem,
        preferenceId: preference.id,
        init_point: preference.init_point,
      };
    } catch (error) {
      console.error('================================');
      console.error('ERROR CREANDO PAGO');
      console.error(error);
      console.error('================================');

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

  async procesarWebhookMercadoPago(idMercadoPago: number) {
    try {
      console.log('================================');
      console.log('PROCESANDO WEBHOOK MERCADO PAGO');
      console.log('ID MERCADO PAGO:', idMercadoPago);
      console.log('================================');

      // --------------------------------------------------------
      // VALIDAR ID
      // --------------------------------------------------------

      if (
        !Number.isSafeInteger(idMercadoPago) ||
        idMercadoPago <= 0
      ) {
        return {
          success: false,
          procesado: false,
          mensaje: 'ID de Mercado Pago inválido',
        };
      }

      // --------------------------------------------------------
      // OBTENER PAGO REAL DESDE MERCADO PAGO
      // --------------------------------------------------------

      const pagoMercadoPago =
        await this.mercadopagoService.obtenerPago(idMercadoPago);

      if (!pagoMercadoPago) {
        return {
          success: false,
          procesado: false,
          mensaje: 'No se encontró el pago en Mercado Pago',
        };
      }

      console.log('PAGO MERCADO PAGO:', pagoMercadoPago);

      // --------------------------------------------------------
      // VERIFICAR ESTADO
      // --------------------------------------------------------

      const estado = String(
        pagoMercadoPago.status ?? '',
      ).toLowerCase();

      console.log('ESTADO DEL PAGO:', estado);

      if (estado !== 'approved') {
        return {
          success: true,
          procesado: false,
          estado,
          mensaje: 'El pago todavía no está aprobado',
        };
      }

      // --------------------------------------------------------
      // VERIFICAR EXTERNAL REFERENCE
      // --------------------------------------------------------

      const externalReference = String(
        pagoMercadoPago.external_reference ?? '',
      );

      console.log('EXTERNAL REFERENCE:', externalReference);

      if (!externalReference.startsWith('cuota-')) {
        return {
          success: false,
          procesado: false,
          mensaje: 'El pago no contiene una cuota válida',
        };
      }

      const idCuota = Number(
        externalReference.replace('cuota-', ''),
      );

      if (!Number.isInteger(idCuota) || idCuota <= 0) {
        return {
          success: false,
          procesado: false,
          mensaje: 'ID de cuota inválido',
        };
      }

      // --------------------------------------------------------
      // VERIFICAR DUPLICADO
      // --------------------------------------------------------

      const yaExiste =
        await this.pagosRepository.existePagoMercadoPago(
          idMercadoPago,
        );

      if (yaExiste) {
        console.log('EL PAGO YA ESTÁ REGISTRADO');

        // Reintentar generación por si una ejecución anterior
        // registró el pago pero falló antes de generar liquidaciones.
        const liquidaciones =
          await this.liquidacionProfesorService.generarPorCuota(
            idCuota,
          );

        return {
          success: true,
          procesado: false,
          duplicado: true,
          idCuota,
          liquidaciones,
          mensaje: 'El pago ya estaba registrado',
        };
      }

      // --------------------------------------------------------
      // VALIDAR MONTO
      // --------------------------------------------------------

      const monto = Number(
        pagoMercadoPago.transaction_amount ?? 0,
      );

      if (!Number.isFinite(monto) || monto <= 0) {
        return {
          success: false,
          procesado: false,
          mensaje: 'Monto del pago inválido',
        };
      }

      // --------------------------------------------------------
      // VALIDAR CUOTA
      // --------------------------------------------------------

      const cuota =
        await this.pagosRepository.obtenerCuota(idCuota);

      if (!cuota) {
        return {
          success: false,
          procesado: false,
          mensaje: 'No se encontró la cuota asociada al pago',
        };
      }

      // --------------------------------------------------------
      // VALIDAR IMPORTE
      // --------------------------------------------------------

      const montoCuota = Number(cuota.monto);

      if (!Number.isFinite(montoCuota) || montoCuota <= 0) {
        return {
          success: false,
          procesado: false,
          mensaje: 'La cuota tiene un importe inválido',
        };
      }

      if (monto > montoCuota) {
        console.warn(
          'EL MONTO DEL PAGO SUPERA EL MONTO DE LA CUOTA',
          { monto, montoCuota, idCuota },
        );
      }

      // --------------------------------------------------------
      // MÉTODO DE PAGO
      // --------------------------------------------------------

      const metodoPago = String(
        pagoMercadoPago.payment_method_id ??
          pagoMercadoPago.payment_type_id ??
          'Mercado Pago',
      );

      // --------------------------------------------------------
      // REGISTRAR PAGO Y ACTUALIZAR CUOTA
      // --------------------------------------------------------

      console.log('================================');
      console.log('REGISTRANDO PAGO');
      console.log('CUOTA:', idCuota);
      console.log('MONTO:', monto);
      console.log('MERCADO PAGO:', idMercadoPago);
      console.log('MÉTODO:', metodoPago);
      console.log('================================');

      const pago = await this.pagosRepository.registrarPago(
        idCuota,
        monto,
        metodoPago,
        idMercadoPago,
      );

      console.log('PAGO REGISTRADO:', pago);

      // --------------------------------------------------------
      // GENERAR LIQUIDACIONES
      // --------------------------------------------------------

      let resultadoLiquidaciones: any = null;

      if (
        String(pago.estado_cuota ?? '').toLowerCase() === 'pagado'
      ) {
        console.log('================================');
        console.log('CUOTA COMPLETAMENTE PAGADA');
        console.log('GENERANDO LIQUIDACIONES');
        console.log('DISTRIBUCIÓN: 30% PROFESOR / 70% ACADEMIA');
        console.log('================================');

        resultadoLiquidaciones =
          await this.liquidacionProfesorService.generarPorCuota(
            idCuota,
          );

        console.log(
          'RESULTADO DE LIQUIDACIONES:',
          resultadoLiquidaciones,
        );
      } else {
        console.log(
          'LA CUOTA TODAVÍA TIENE SALDO PENDIENTE.',
        );
      }

      // --------------------------------------------------------
      // RESPUESTA
      // --------------------------------------------------------

      console.log('================================');
      console.log('WEBHOOK PROCESADO CORRECTAMENTE');
      console.log('CUOTA:', idCuota);
      console.log('PAGO:', idMercadoPago);
      console.log('MONTO:', monto);
      console.log('================================');

      return {
        success: true,
        procesado: true,
        idCuota,
        idMercadoPago,
        monto,
        metodoPago,
        pago,
        liquidaciones: resultadoLiquidaciones,
      };
    } catch (error) {
      console.error('================================');
      console.error('ERROR PROCESANDO WEBHOOK');
      console.error(error);
      console.error('================================');

      throw error;
    }
  }
}
