import { Injectable } from '@nestjs/common';

import {
  DatabaseService,
} from '../../database/database.service';

@Injectable()
export class PagosRepository {
  constructor(
    private readonly databaseService:
      DatabaseService,
  ) {}

  // ============================================================
  // OBTENER CUOTA
  // ============================================================

  async obtenerCuota(
    idCuota: number,
  ) {
    const result =
      await this.databaseService.query(
        `
        SELECT *
        FROM obtener_cuota($1)
        `,
        [
          idCuota,
        ],
      );

    return result.rows[0] ?? null;
  }

  // ============================================================
  // OBTENER CUOTAS DE UN ALUMNO
  // ============================================================

  async obtenerCuotasAlumno(
    idAlumno: number,
  ) {
    const result =
      await this.databaseService.query(
        `
        SELECT *
        FROM obtener_cuotas_alumno($1)
        `,
        [
          idAlumno,
        ],
      );

    return result.rows;
  }

  // ============================================================
  // OBTENER PAGOS DE UN ALUMNO
  // ============================================================

  async obtenerPagosAlumno(
    idAlumno: number,
  ) {
    const result =
      await this.databaseService.query(
        `
        SELECT *
        FROM obtener_pagos_alumno($1)
        `,
        [
          idAlumno,
        ],
      );

    return result.rows;
  }

  // ============================================================
  // OBTENER PAGO POR MERCADO PAGO
  // ============================================================

  async obtenerPagoPorMercadoPago(
    idMercadoPago: number,
  ) {
    const result =
      await this.databaseService.query(
        `
        SELECT *
        FROM obtener_pago_mercado_pago($1)
        `,
        [
          idMercadoPago,
        ],
      );

    return result.rows[0] ?? null;
  }

  // ============================================================
  // VERIFICAR PAGO EXISTENTE
  // ============================================================

  async existePagoMercadoPago(
    idMercadoPago: number,
  ): Promise<boolean> {
    const result =
      await this.databaseService.query(
        `
        SELECT
          existe_pago_mercado_pago($1)
          AS existe
        `,
        [
          idMercadoPago,
        ],
      );

    return Boolean(
      result.rows[0]?.existe,
    );
  }

  // ============================================================
  // REGISTRAR PAGO
  // ============================================================

  async registrarPagoCuota(
    idCuota: number,
    monto: number,
    idMercadoPago: number,
    metodoPago: string,
  ) {
    await this.databaseService.query(
      `
      CALL registrar_pago_cuota(
        $1,
        $2,
        $3,
        $4
      )
      `,
      [
        idCuota,
        monto,
        idMercadoPago,
        metodoPago,
      ],
    );

    return {
      mensaje:
        'Pago registrado correctamente',
    };
  }
}