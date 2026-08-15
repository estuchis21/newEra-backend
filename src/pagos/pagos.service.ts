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
    private readonly pagosRepository:
      PagosRepository,

    private readonly mercadopagoService:
      MercadopagoService,
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
        error instanceof
          NotFoundException ||
        error instanceof
          InternalServerErrorException
      ) {
        throw error;
      }

      throw new InternalServerErrorException(
        'No se pudo crear el pago',
      );
    }
  }
}