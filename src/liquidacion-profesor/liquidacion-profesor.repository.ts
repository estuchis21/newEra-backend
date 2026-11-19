
import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { RegistrarCuentaCobroDto } from './dto/registrar-cuenta-cobro.dto';
import { RegistrarTransferenciaDto } from './dto/liquidacion-profesor.dto';

@Injectable()
export class LiquidacionProfesorRepository {
  constructor(
    private readonly databaseService: DatabaseService,
  ) {}

  // ============================================================
  // GENERAR LIQUIDACIONES A PARTIR DE UNA CUOTA PAGADA
  // ============================================================

  async generarPorCuota(idCuota: number) {
    const result = await this.databaseService.query(
      `
      WITH cuota_pagada AS (
        SELECT
          c.id_cuota,
          c.id_alumno,
          ROUND(c.monto * 100)::BIGINT AS total_centavos
        FROM public.cuota c
        WHERE c.id_cuota = $1
          AND LOWER(TRIM(c.estado)) = 'pagado'
          AND (
            SELECT COALESCE(SUM(p.monto), 0)
            FROM public.pago p
            WHERE p.id_cuota = c.id_cuota
              AND LOWER(TRIM(COALESCE(p.estado, '')))
                  IN ('aprobado', 'approved')
          ) >= c.monto
      ),

      profesores_alumno AS (
        SELECT DISTINCT
          cp.id_cuota,
          cp.id_alumno,
          cp.total_centavos,
          g.id_profesor
        FROM cuota_pagada cp
        INNER JOIN public.inscripcion i
          ON i.id_alumno = cp.id_alumno
        INNER JOIN public.grupos g
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

      distribucion AS (
        SELECT
          pa.id_cuota,
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

      bases AS (
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
        FROM distribucion
      ),

      importes AS (
        SELECT
          id_cuota,
          id_profesor,
          base_centavos,
          ROUND(base_centavos * 0.30)::BIGINT
            AS profesor_centavos,
          base_centavos
            - ROUND(base_centavos * 0.30)::BIGINT
            AS academia_centavos
        FROM bases
      ),

      insertadas AS (
        INSERT INTO public.liquidacion_profesor (
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

      SELECT *
      FROM insertadas
      ORDER BY id_profesor;
      `,
      [idCuota],
    );

    // Recuperamos también las liquidaciones existentes.
    // Esto permite que un webhook repetido sea idempotente.

    const existentes = await this.obtenerPorCuota(idCuota);

    return {
      success: true,
      cantidadGenerada:
        result.rowCount ?? result.rows.length,
      liquidaciones: existentes,
      mensaje: result.rows.length
        ? 'Liquidaciones generadas correctamente.'
        : 'No se insertaron nuevas liquidaciones; se muestran las existentes si las hubiera.',
    };
  }

  // ============================================================
  // OBTENER TODAS LAS LIQUIDACIONES
  // ============================================================

  async obtenerTodas() {
    const result = await this.databaseService.query(
      `
      SELECT
        l.*,
        c.mes_anio,
        c.id_alumno,
        u.nombre AS nombre_profesor,
        u.apellido AS apellido_profesor,
        u.email AS email_profesor
      FROM public.liquidacion_profesor l
      INNER JOIN public.profesores p
        ON p.id_profesor = l.id_profesor
      INNER JOIN public.users u
        ON u.id_usuario = p.id_usuario
      LEFT JOIN public.cuota c
        ON c.id_cuota = l.id_cuota
      ORDER BY l.fecha_generacion DESC;
      `,
    );

    return result.rows;
  }

  // ============================================================
  // OBTENER LIQUIDACIONES DE UN PROFESOR
  // ============================================================

  async obtenerPorProfesor(idProfesor: number) {
    const result = await this.databaseService.query(
      `
      SELECT
        l.*,
        c.mes_anio,
        c.id_alumno
      FROM public.liquidacion_profesor l
      LEFT JOIN public.cuota c
        ON c.id_cuota = l.id_cuota
      WHERE l.id_profesor = $1
      ORDER BY l.fecha_generacion DESC;
      `,
      [idProfesor],
    );

    return result.rows;
  }

  // ============================================================
  // OBTENER CUENTA ACTIVA DEL PROFESOR
  // ============================================================

  async obtenerCuentaActivaPorProfesor(
    idProfesor: number,
  ) {
    const result = await this.databaseService.query(
      `
      SELECT *
      FROM public.cuentas_cobro_profesor
      WHERE id_profesor = $1
        AND activa = TRUE
      LIMIT 1;
      `,
      [idProfesor],
    );

    return result.rows?.[0] ?? null;
  }

  // ============================================================
  // REGISTRAR / ACTUALIZAR CUENTA DE COBRO
  // ============================================================

  async guardarCuentaCobro(
    idProfesor: number,
    dto: RegistrarCuentaCobroDto,
  ) {
    // Se ejecuta dentro de una transacción para evitar
    // que queden dos cuentas activas para el mismo profesor.

    return this.databaseService.transaction(
      async (connection) => {
        await connection.query(
          `
          UPDATE public.cuentas_cobro_profesor
          SET
            activa = FALSE,
            fecha_actualizacion = CURRENT_TIMESTAMP
          WHERE id_profesor = $1
            AND activa = TRUE;
          `,
          [idProfesor],
        );

        const result = await connection.query(
          `
          INSERT INTO public.cuentas_cobro_profesor (
            id_profesor,
            alias,
            cbu_cvu,
            titular,
            cuit_cuil,
            tipo_cuenta,
            activa
          )
          VALUES ($1, $2, $3, $4, $5, $6, TRUE)
          RETURNING *;
          `,
          [
            idProfesor,
            dto.alias?.trim() || null,
            dto.cbu_cvu?.trim() || null,
            dto.titular.trim(),
            dto.cuit_cuil?.trim() || null,
            dto.tipo_cuenta,
          ],
        );

        return result.rows?.[0] ?? null;
      },
    );
  }

  // ============================================================
  // OBTENER CUENTA DE COBRO
  // ============================================================

  async obtenerCuentaCobro(idProfesor: number) {
    const result = await this.databaseService.query(
      `
      SELECT
        id_cuenta,
        id_profesor,
        alias,
        cbu_cvu,
        titular,
        tipo_cuenta,
        activa,
        fecha_creacion,
        fecha_actualizacion
      FROM public.cuentas_cobro_profesor
      WHERE id_profesor = $1
        AND activa = TRUE
      LIMIT 1;
      `,
      [idProfesor],
    );

    return result.rows?.[0] ?? null;
  }

  // ============================================================
  // HISTORIAL DE TRANSFERENCIAS
  // ============================================================

  async obtenerHistorialTransferencias(
    idLiquidacion: number,
  ) {
    const result = await this.databaseService.query(
      `
      SELECT
        t.*,
        c.alias,
        c.cbu_cvu,
        c.titular,
        c.tipo_cuenta
      FROM public.transferencias_profesores t
      LEFT JOIN public.cuentas_cobro_profesor c
        ON c.id_cuenta = t.id_cuenta
      WHERE t.id_liquidacion = $1
      ORDER BY t.fecha_registro DESC;
      `,
      [idLiquidacion],
    );

    return result.rows;
  }

  // ============================================================
  // OBTENER LIQUIDACIONES DE UNA CUOTA
  // ============================================================

  async obtenerPorCuota(idCuota: number) {
    const result = await this.databaseService.query(
      `
      SELECT
        l.*,
        u.nombre AS nombre_profesor,
        u.apellido AS apellido_profesor,
        u.email AS email_profesor
      FROM public.liquidacion_profesor l
      INNER JOIN public.profesores p
        ON p.id_profesor = l.id_profesor
      INNER JOIN public.users u
        ON u.id_usuario = p.id_usuario
      WHERE l.id_cuota = $1
      ORDER BY u.apellido, u.nombre;
      `,
      [idCuota],
    );

    return result.rows;
  }

  // ============================================================
  // OBTENER UNA LIQUIDACIÓN POR ID
  // ============================================================

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
      FROM public.liquidacion_profesor l
      LEFT JOIN public.cuota c
        ON c.id_cuota = l.id_cuota
      INNER JOIN public.profesores p
        ON p.id_profesor = l.id_profesor
      INNER JOIN public.users u
        ON u.id_usuario = p.id_usuario
      WHERE l.id_liquidacion = $1
      LIMIT 1;
      `,
      [idLiquidacion],
    );

    return result.rows[0] ?? null;
  }

  // ============================================================
  // REGISTRAR TRANSFERENCIA Y MARCAR LIQUIDACIÓN COMO PAGADA
  // ============================================================

  async marcarPagada(
    idLiquidacion: number,
    dto: RegistrarTransferenciaDto,
  ) {
    const sql = `
      WITH liquidacion_actualizada AS (
        UPDATE public.liquidacion_profesor lp
        SET
          estado = 'Pagado',
          monto_transferido = $2,
          fecha_transferencia = $3::timestamp,
          id_operacion_transferencia = $4,
          observaciones_transferencia = $5
        WHERE lp.id_liquidacion = $1
          AND lp.estado = 'Pendiente'
          AND ROUND(lp.monto_profesor, 2)
              = ROUND($2::numeric, 2)
          AND (
            $6::integer IS NULL
            OR EXISTS (
              SELECT 1
              FROM public.cuentas_cobro_profesor c
              WHERE c.id_cuenta = $6
                AND c.id_profesor = lp.id_profesor
                AND c.activa = TRUE
            )
          )
          AND NOT EXISTS (
            SELECT 1
            FROM public.transferencias_profesores t
            WHERE t.id_liquidacion = lp.id_liquidacion
              AND t.estado = 'Registrada'
          )
        RETURNING
          lp.id_liquidacion,
          lp.id_profesor,
          lp.monto_profesor,
          lp.monto_transferido,
          lp.fecha_transferencia,
          lp.id_operacion_transferencia,
          lp.observaciones_transferencia,
          lp.estado
      ),

      transferencia_insertada AS (
        INSERT INTO public.transferencias_profesores (
          id_liquidacion,
          id_cuenta,
          monto,
          fecha_transferencia,
          id_operacion_transferencia,
          observaciones
        )
        SELECT
          l.id_liquidacion,
          $6,
          l.monto_transferido,
          l.fecha_transferencia,
          l.id_operacion_transferencia,
          l.observaciones_transferencia
        FROM liquidacion_actualizada l
        RETURNING *
      )

      SELECT
        l.*,
        t.id_transferencia,
        t.id_cuenta,
        t.fecha_registro
      FROM liquidacion_actualizada l
      INNER JOIN transferencia_insertada t
        ON t.id_liquidacion = l.id_liquidacion;
    `;

    const result = await this.databaseService.query(
      sql,
      [
        idLiquidacion,
        dto.monto_transferido,
        dto.fecha_transferencia,
        dto.id_operacion_transferencia ?? null,
        dto.observaciones_transferencia ?? null,
        dto.id_cuenta ?? null,
      ],
    );

    return result.rows?.[0] ?? null;
  }

  // ============================================================
  // ANULAR LIQUIDACIÓN
  // ============================================================

  async anular(idLiquidacion: number) {
    const result = await this.databaseService.query(
      `
      UPDATE public.liquidacion_profesor
      SET estado = 'Anulado'
      WHERE id_liquidacion = $1
        AND estado = 'Pendiente'
      RETURNING *;
      `,
      [idLiquidacion],
    );

    return result.rows[0] ?? null;
  }

  // ============================================================
  // RESUMEN GENERAL DE LIQUIDACIONES
  // ============================================================

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
          SUM(monto_profesor)
          FILTER (WHERE estado <> 'Anulado'),
          0
        ) AS total_profesores,

        COALESCE(
          SUM(monto_academia)
          FILTER (WHERE estado <> 'Anulado'),
          0
        ) AS total_academia,

        COALESCE(
          SUM(monto_profesor)
          FILTER (WHERE estado = 'Pendiente'),
          0
        ) AS total_pendiente,

        COALESCE(
          SUM(monto_profesor)
          FILTER (WHERE estado = 'Pagado'),
          0
        ) AS total_pagado

      FROM public.liquidacion_profesor;
      `,
    );

    return result.rows[0];
  }
}
