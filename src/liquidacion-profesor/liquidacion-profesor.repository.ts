import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class LiquidacionProfesorRepository {
  constructor(
    private readonly databaseService: DatabaseService,
  ) {}

  // =====================================================
  // GENERAR LIQUIDACIONES A PARTIR DE UNA CUOTA PAGADA
  // =====================================================

  async generarPorCuota(idCuota: number) {
    const result = await this.databaseService.query(
      `
      WITH cuota_pagada AS (
        SELECT
          c.id_cuota,
          c.id_alumno,
          ROUND(c.monto * 100)::BIGINT AS total_centavos
        FROM cuota c
        WHERE c.id_cuota = $1
          AND LOWER(TRIM(c.estado)) = 'pagado'
          AND (
            SELECT COALESCE(SUM(p.monto), 0)
            FROM pago p
            WHERE p.id_cuota = c.id_cuota
              AND LOWER(TRIM(p.estado)) <> 'anulado'
          ) >= c.monto
      ),

      profesores_alumno AS (
        SELECT DISTINCT
          cp.id_cuota,
          cp.id_alumno,
          cp.total_centavos,
          g.id_profesor
        FROM cuota_pagada cp
        INNER JOIN inscripcion i
          ON i.id_alumno = cp.id_alumno
        INNER JOIN grupos g
          ON g.id_grupo = i.id_grupo
        WHERE LOWER(TRIM(i.estado)) = 'activo'
          AND g.activo = TRUE
      ),

      cantidad_profesores AS (
        SELECT
          id_cuota,
          id_alumno,
          total_centavos,
          COUNT(*)::BIGINT AS cantidad
        FROM profesores_alumno
        GROUP BY
          id_cuota,
          id_alumno,
          total_centavos
      ),

      distribucion_ordenada AS (
        SELECT
          pa.id_cuota,
          pa.id_alumno,
          pa.id_profesor,
          cp.total_centavos,
          cp.cantidad,

          ROW_NUMBER() OVER (
            PARTITION BY pa.id_cuota
            ORDER BY pa.id_profesor
          ) AS orden

        FROM profesores_alumno pa
        INNER JOIN cantidad_profesores cp
          ON cp.id_cuota = pa.id_cuota
      ),

      bases_calculadas AS (
        SELECT
          id_cuota,
          id_profesor,

          (
            total_centavos / cantidad
            +
            CASE
              WHEN orden <= MOD(total_centavos, cantidad)
                THEN 1
              ELSE 0
            END
          )::BIGINT AS base_centavos

        FROM distribucion_ordenada
      ),

      importes AS (
        SELECT
          id_cuota,
          id_profesor,

          base_centavos,

          ROUND(base_centavos * 0.30)::BIGINT
            AS profesor_centavos,

          base_centavos -
          ROUND(base_centavos * 0.30)::BIGINT
            AS academia_centavos

        FROM bases_calculadas
      ),

      liquidaciones_insertadas AS (
        INSERT INTO liquidacion_profesor (
          id_profesor,
          id_cuota,
          monto_base,
          porcentaje,
          monto_profesor,
          monto_academia,
          estado
        )
        SELECT
          id_profesor,
          id_cuota,
          base_centavos / 100.0,
          30.00,
          profesor_centavos / 100.0,
          academia_centavos / 100.0,
          'Pendiente'
        FROM importes

        ON CONFLICT (id_cuota, id_profesor)
        DO NOTHING

        RETURNING *
      )

      SELECT
        l.id_liquidacion,
        l.id_profesor,
        l.id_cuota,
        l.monto_base,
        l.porcentaje,
        l.monto_profesor,
        l.monto_academia,
        l.fecha_generacion,
        l.estado
      FROM liquidaciones_insertadas l
      ORDER BY l.id_profesor
      `,
      [idCuota],
    );

    return {
      success: true,
      cantidadGenerada: result.rowCount ?? result.rows.length,
      liquidaciones: result.rows,
      mensaje:
        result.rows.length > 0
          ? 'Liquidaciones generadas correctamente.'
          : 'No se generaron liquidaciones. La cuota puede no estar pagada, el alumno no tener grupos activos o las liquidaciones ya existir.',
    };
  }

  // =====================================================
  // OBTENER TODAS LAS LIQUIDACIONES
  // =====================================================

  async obtenerTodas() {
    const result = await this.databaseService.query(
      `
      SELECT
        l.id_liquidacion,
        l.id_profesor,
        l.id_cuota,
        l.monto_base,
        l.porcentaje,
        l.monto_profesor,
        l.monto_academia,
        l.fecha_generacion,
        l.estado,

        c.mes_anio,
        c.id_alumno,

        u.nombre AS nombre_profesor,
        u.apellido AS apellido_profesor,
        u.email AS email_profesor

      FROM liquidacion_profesor l

      INNER JOIN profesores p
        ON p.id_profesor = l.id_profesor

      INNER JOIN users u
        ON u.id_usuario = p.id_usuario

      INNER JOIN cuota c
        ON c.id_cuota = l.id_cuota

      ORDER BY l.fecha_generacion DESC
      `,
    );

    return result.rows;
  }

  // =====================================================
  // OBTENER LIQUIDACIONES POR PROFESOR
  // =====================================================

  async obtenerPorProfesor(idProfesor: number) {
    const result = await this.databaseService.query(
      `
      SELECT
        l.id_liquidacion,
        l.id_profesor,
        l.id_cuota,
        l.monto_base,
        l.porcentaje,
        l.monto_profesor,
        l.monto_academia,
        l.fecha_generacion,
        l.estado,
        c.mes_anio,
        c.id_alumno

      FROM liquidacion_profesor l

      INNER JOIN cuota c
        ON c.id_cuota = l.id_cuota

      WHERE l.id_profesor = $1

      ORDER BY l.fecha_generacion DESC
      `,
      [idProfesor],
    );

    return result.rows;
  }

  // =====================================================
  // OBTENER LIQUIDACIONES POR CUOTA
  // =====================================================

  async obtenerPorCuota(idCuota: number) {
    const result = await this.databaseService.query(
      `
      SELECT
        l.id_liquidacion,
        l.id_profesor,
        l.id_cuota,
        l.monto_base,
        l.porcentaje,
        l.monto_profesor,
        l.monto_academia,
        l.fecha_generacion,
        l.estado,
        u.nombre AS nombre_profesor,
        u.apellido AS apellido_profesor

      FROM liquidacion_profesor l

      INNER JOIN profesores p
        ON p.id_profesor = l.id_profesor

      INNER JOIN users u
        ON u.id_usuario = p.id_usuario

      WHERE l.id_cuota = $1

      ORDER BY u.apellido, u.nombre
      `,
      [idCuota],
    );

    return result.rows;
  }

  // =====================================================
  // OBTENER UNA LIQUIDACIÓN
  // =====================================================

  async obtenerPorId(idLiquidacion: number) {
    const result = await this.databaseService.query(
      `
      SELECT
        l.*,
        c.mes_anio,
        c.id_alumno,
        u.nombre AS nombre_profesor,
        u.apellido AS apellido_profesor,
        u.email AS email_profesor

      FROM liquidacion_profesor l

      INNER JOIN cuota c
        ON c.id_cuota = l.id_cuota

      INNER JOIN profesores p
        ON p.id_profesor = l.id_profesor

      INNER JOIN users u
        ON u.id_usuario = p.id_usuario

      WHERE l.id_liquidacion = $1

      LIMIT 1
      `,
      [idLiquidacion],
    );

    return result.rows[0] ?? null;
  }

  // =====================================================
  // MARCAR COMO PAGADA
  // =====================================================

  async marcarPagada(idLiquidacion: number) {
    const result = await this.databaseService.query(
      `
      UPDATE liquidacion_profesor
      SET estado = 'Pagado'
      WHERE id_liquidacion = $1
        AND estado = 'Pendiente'
      RETURNING *
      `,
      [idLiquidacion],
    );

    return result.rows[0] ?? null;
  }

  // =====================================================
  // ANULAR LIQUIDACIÓN
  // =====================================================

  async anular(idLiquidacion: number) {
    const result = await this.databaseService.query(
      `
      UPDATE liquidacion_profesor
      SET estado = 'Anulado'
      WHERE id_liquidacion = $1
        AND estado = 'Pendiente'
      RETURNING *
      `,
      [idLiquidacion],
    );

    return result.rows[0] ?? null;
  }

  // =====================================================
  // RESUMEN FINANCIERO
  // =====================================================

  async obtenerResumen() {
    const result = await this.databaseService.query(
      `
      SELECT
        COUNT(*)::INTEGER AS cantidad_liquidaciones,

        COUNT(*) FILTER (
          WHERE estado = 'Pendiente'
        )::INTEGER AS pendientes,

        COUNT(*) FILTER (
          WHERE estado = 'Pagado'
        )::INTEGER AS pagadas,

        COUNT(*) FILTER (
          WHERE estado = 'Anulado'
        )::INTEGER AS anuladas,

        COALESCE(
          SUM(monto_profesor) FILTER (
            WHERE estado <> 'Anulado'
          ),
          0
        ) AS total_profesores,

        COALESCE(
          SUM(monto_academia) FILTER (
            WHERE estado <> 'Anulado'
          ),
          0
        ) AS total_academia,

        COALESCE(
          SUM(monto_profesor) FILTER (
            WHERE estado = 'Pendiente'
          ),
          0
        ) AS total_pendiente,

        COALESCE(
          SUM(monto_profesor) FILTER (
            WHERE estado = 'Pagado'
          ),
          0
        ) AS total_pagado

      FROM liquidacion_profesor
      `,
    );

    return result.rows[0];
  }
}