import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class CreditosRepository {
  constructor(
    private readonly databaseService: DatabaseService,
  ) {}

  async saldoPorAlumno(idAlumno: number) {
    const result = await this.databaseService.query(
      `
      SELECT
        tc.id_tipo_credito,
        tc.nombre AS tipo_credito,
        COALESCE(SUM(mc.cantidad), 0)::integer AS creditos_disponibles
      FROM tipos_credito tc
      LEFT JOIN movimiento_credito mc
        ON mc.id_tipo_credito = tc.id_tipo_credito
       AND mc.id_alumno = $1
      WHERE tc.activo = TRUE
      GROUP BY tc.id_tipo_credito, tc.nombre
      ORDER BY tc.id_tipo_credito
      `,
      [idAlumno],
    );

    return result.rows;
  }

  async comprarPaquete(idAlumno: number, idPaquete: number) {
    const alumno = await this.databaseService.query(
      `SELECT id_alumno FROM alumnos WHERE id_alumno = $1`,
      [idAlumno],
    );

    if (alumno.rows.length === 0) {
      throw new NotFoundException(
        `No existe el alumno ${idAlumno}.`,
      );
    }

    const result = await this.databaseService.query(
      `
      WITH paquete AS (
        SELECT
          id_paquete,
          id_tipo_credito,
          cantidad_creditos,
          precio
        FROM paquetes_creditos
        WHERE id_paquete = $2
          AND activo = TRUE
      ),
      compra AS (
        INSERT INTO compra_creditos (
          id_alumno,
          id_paquete,
          cantidad_creditos,
          precio_pagado,
          estado
        )
        SELECT
          $1,
          p.id_paquete,
          p.cantidad_creditos,
          p.precio,
          'Pagado'
        FROM paquete p
        RETURNING id_compra, id_alumno, id_paquete,
                  cantidad_creditos, precio_pagado
      ),
      movimiento AS (
        INSERT INTO movimiento_credito (
          id_alumno,
          id_tipo_credito,
          id_compra,
          cantidad,
          tipo,
          descripcion
        )
        SELECT
          c.id_alumno,
          p.id_tipo_credito,
          c.id_compra,
          c.cantidad_creditos,
          'COMPRA',
          'Compra de paquete de créditos'
        FROM compra c
        INNER JOIN paquete p ON p.id_paquete = c.id_paquete
        RETURNING id_movimiento
      )
      SELECT
        c.id_compra,
        c.id_alumno,
        c.id_paquete,
        c.cantidad_creditos,
        c.precio_pagado
      FROM compra c
      CROSS JOIN movimiento
      `,
      [idAlumno, idPaquete],
    );

    if (result.rows.length === 0) {
      throw new NotFoundException(
        `No existe el paquete activo ${idPaquete}.`,
      );
    }

    return result.rows[0];
  }
}