import { Injectable } from '@nestjs/common';

import {
  DatabaseService,
} from '../../database/database.service';

@Injectable()
export class PagosRepository {
  constructor(
    private readonly databaseService: DatabaseService,
  ) {}

  // ============================================================
  // OBTENER CUOTA
  // ============================================================

  async obtenerCuota(idCuota: number) {
    const result =
      await this.databaseService.query(
        `
        SELECT
            c.id_cuota,
            c.id_alumno,
            c.mes_anio,
            c.monto,
            c.vencimiento,
            c.estado,
            c.saldo,
            u.nombre,
            u.apellido,
            u.email
        FROM cuota c
        INNER JOIN alumnos a
            ON a.id_alumno = c.id_alumno
        INNER JOIN users u
            ON u.id_usuario = a.id_usuario
        WHERE c.id_cuota = $1
        `,
        [idCuota],
      );

    return result.rows[0] ?? null;
  }

  // ============================================================
  // OBTENER CUOTAS DEL ALUMNO
  // ============================================================

  async obtenerCuotasAlumno(idAlumno: number) {
    const result =
      await this.databaseService.query(
        `
        SELECT
            c.id_cuota,
            c.id_alumno,
            c.mes_anio,
            c.monto,
            c.vencimiento,
            c.estado,
            c.saldo
        FROM cuota c
        WHERE c.id_alumno = $1
        ORDER BY c.id_cuota DESC
        `,
        [idAlumno],
      );

    return result.rows;
  }

  // ============================================================
  // OBTENER PAGOS DEL ALUMNO
  // ============================================================

  async obtenerPagosAlumno(idAlumno: number) {
    const result =
      await this.databaseService.query(
        `
        SELECT *
        FROM obtener_pagos_alumno($1)
        `,
        [idAlumno],
      );

    return result.rows;
  }

  // ============================================================
  // VERIFICAR SI YA EXISTE EL PAGO DE MERCADO PAGO
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
        [idMercadoPago],
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
      mensaje: 'Pago registrado correctamente',
    };
  }
}