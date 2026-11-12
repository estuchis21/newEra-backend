
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

import { PoolClient } from 'pg';

@Injectable()
export class CuotasRepository {
  constructor(
    private readonly databaseService: DatabaseService,
  ) {}

  // ============================================================
  // NORMALIZACIÓN DE PERÍODOS
  // ============================================================

  /**
   * Acepta:
   * MM/YYYY
   * YYYY-MM
   * YYYY-MM-DD
   *
   * Devuelve siempre YYYY-MM-01.
   */
  private normalizarPeriodo(periodo: string): string {
    const valor = String(periodo ?? '').trim();

    let anio: number;
    let mes: number;

    const formatoMesAnio = valor.match(/^(\d{1,2})\/(\d{4})$/);
    const formatoAnioMes = valor.match(/^(\d{4})-(\d{1,2})(?:-\d{1,2})?$/);

    if (formatoMesAnio) {
      mes = Number(formatoMesAnio[1]);
      anio = Number(formatoMesAnio[2]);
    } else if (formatoAnioMes) {
      anio = Number(formatoAnioMes[1]);
      mes = Number(formatoAnioMes[2]);
    } else {
      throw new BadRequestException(
        'Formato de período inválido. Utilizá MM/YYYY o YYYY-MM-DD.',
      );
    }

    if (
      !Number.isInteger(anio) ||
      !Number.isInteger(mes) ||
      anio < 2000 ||
      mes < 1 ||
      mes > 12
    ) {
      throw new BadRequestException('El período indicado no es válido.');
    }

    return `${anio}-${String(mes).padStart(2, '0')}-01`;
  }

  // ============================================================
  // CONTROL DE ACCESO ACADÉMICO
  // ============================================================

  /**
   * Regla:
   * - Del día 1 al 10: acceso permitido.
   * - Desde el día 11: debe estar pagada la cuota del mes actual.
   *
   * Se consideran los pagos aprobados y no solamente el estado
   * almacenado en cuota.estado.
   */

  
  
  async recalcularCuotaMes(
      client: PoolClient,
      idAlumno: number,
  ) {
      // Serializa los recálculos del mismo alumno.
      const alumno = await client.query(
          `
          SELECT id_alumno
          FROM public.alumnos
          WHERE id_alumno = $1
          FOR UPDATE
          `,
          [idAlumno],
      );

      if (alumno.rows.length === 0) {
          throw new NotFoundException(
              `No existe el alumno con ID ${idAlumno}.`,
          );
      }

      // Contar únicamente inscripciones y grupos activos.
      const gruposResult = await client.query(
          `
          SELECT COUNT(*)::INTEGER AS cantidad
          FROM public.inscripcion i
          INNER JOIN public.grupos g
              ON g.id_grupo = i.id_grupo
          WHERE i.id_alumno = $1
            AND LOWER(TRIM(i.estado)) = 'activo'
            AND g.activo = TRUE
          `,
          [idAlumno],
      );

      const cantidadGrupos = Number(
          gruposResult.rows[0].cantidad,
      );

      // Si no tiene grupos activos, conservar la cuota existente.
      if (cantidadGrupos === 0) {
          return {
              actualizada: false,
              motivo: 'El alumno no tiene grupos activos. Se conserva la cuota.',
          };
      }

      // Leer la configuración persistente.
      const configuracion = await client.query(
          `
          SELECT
              precio_base,
              porcentaje_adicional_grupo
          FROM public.configuracion_cuotas
          WHERE id = 1
          `,
      );

      if (configuracion.rows.length === 0) {
          throw new NotFoundException(
              'No existe la configuración de cuotas.',
          );
      }

      const precioBase = Number(
          configuracion.rows[0].precio_base,
      );

      const porcentajeAdicional = Number(
          configuracion.rows[0].porcentaje_adicional_grupo,
      );

      if (
          !Number.isFinite(precioBase) ||
          precioBase <= 0 ||
          !Number.isFinite(porcentajeAdicional) ||
          porcentajeAdicional < 0
      ) {
          throw new BadRequestException(
              'La configuración de cuotas no es válida.',
          );
      }

      // Calcular el importe mensual.
      const nuevoMonto = Number(
          (
              precioBase *
              (
                  1 +
                  (porcentajeAdicional / 100) *
                  (cantidadGrupos - 1)
              )
          ).toFixed(2),
      );

      // Buscar y bloquear la cuota del período actual.
      const cuotaResult = await client.query(
          `
          SELECT
              id_cuota,
              monto
          FROM public.cuota
          WHERE id_alumno = $1
            AND periodo = DATE_TRUNC('month', CURRENT_DATE)::DATE
          FOR UPDATE
          `,
          [idAlumno],
      );

      let cuota = cuotaResult.rows[0];

      // Si no existe, crearla.
      if (!cuota) {
          const insertResult = await client.query(
              `
              INSERT INTO public.cuota (
                  id_alumno,
                  periodo,
                  monto,
                  vencimiento,
                  estado,
                  mes_anio
              )
              VALUES (
                  $1,
                  DATE_TRUNC('month', CURRENT_DATE)::DATE,
                  $2,
                  (
                      DATE_TRUNC('month', CURRENT_DATE)
                      + INTERVAL '9 days'
                  )::DATE,
                  'Pendiente',
                  TO_CHAR(CURRENT_DATE, 'MM/YYYY')
              )
              ON CONFLICT (id_alumno, periodo)
              DO NOTHING
              RETURNING id_cuota, monto
              `,
              [idAlumno, nuevoMonto],
          );

          cuota = insertResult.rows[0];

          // Puede existir si otra operación insertó la cuota.
          if (!cuota) {
              const existente = await client.query(
                  `
                  SELECT id_cuota, monto
                  FROM public.cuota
                  WHERE id_alumno = $1
                    AND periodo = DATE_TRUNC('month', CURRENT_DATE)::DATE
                  FOR UPDATE
                  `,
                  [idAlumno],
              );

              cuota = existente.rows[0];
          }

          if (!cuota) {
              throw new BadRequestException(
                  'No se pudo obtener la cuota del período actual.',
              );
          }
      }

      // Consultar únicamente pagos aprobados.
      const pagosResult = await client.query(
          `
          SELECT COALESCE(SUM(monto), 0) AS total_pagado
          FROM public.pago
          WHERE id_cuota = $1
            AND LOWER(TRIM(estado)) IN ('aprobado', 'approved')
          `,
          [cuota.id_cuota],
      );

      const totalPagado = Number(
          pagosResult.rows[0].total_pagado,
      );

      const montoAnterior = Number(cuota.monto);

      // Una cuota completamente pagada no se modifica.
      if (totalPagado >= montoAnterior) {
          return {
              actualizada: false,
              motivo: 'La cuota ya estaba completamente pagada.',
              idCuota: cuota.id_cuota,
              monto: montoAnterior,
              totalPagado,
              saldoPendiente: 0,
          };
      }

      // Actualizar el importe sin modificar los pagos registrados.
      const actualizacion = await client.query(
          `
          UPDATE public.cuota
          SET monto = $2
          WHERE id_cuota = $1
          RETURNING id_cuota, monto
          `,
          [cuota.id_cuota, nuevoMonto],
      );

      return {
          actualizada: true,
          idCuota: actualizacion.rows[0].id_cuota,
          cantidadGrupos,
          montoAnterior,
          nuevoMonto,
          totalPagado,
          saldoPendiente: Math.max(
              nuevoMonto - totalPagado,
              0,
          ),
      };
  }

  async puedeAccederAlumno(idAlumno: number): Promise<boolean> {
    const resultado = await this.databaseService.query(
      `
      SELECT
        CASE
          WHEN EXTRACT(DAY FROM CURRENT_DATE) <= 10 THEN TRUE

          ELSE EXISTS (
            SELECT 1
            FROM cuota c
            WHERE c.id_alumno = $1
              AND DATE_TRUNC('month', c.periodo) =
                  DATE_TRUNC('month', CURRENT_DATE)
              AND (
                LOWER(COALESCE(c.estado, '')) = 'pagado'
                OR COALESCE(
                  (
                    SELECT SUM(p.monto)
                    FROM pago p
                    WHERE p.id_cuota = c.id_cuota
                      AND LOWER(COALESCE(p.estado, '')) IN (
                        'aprobado',
                        'approved'
                      )
                  ),
                  0
                ) >= c.monto
              )
          )
        END AS puede_acceder
      `,
      [idAlumno],
    );

    return resultado.rows[0]?.puede_acceder === true;
  }



  // ============================================================
  // CREAR CUOTA DEL MES ACTUAL
  // ============================================================

  async crearCuota(idAlumno: number, monto: number) {
    this.validarImporte(monto);

    const result = await this.databaseService.query(
      `
      INSERT INTO public.cuota (
        id_alumno,
        periodo,
        monto,
        vencimiento,
        estado,
        mes_anio
      )
      VALUES (
        $1,
        DATE_TRUNC('month', CURRENT_DATE)::DATE,
        $2,
        MAKE_DATE(
          EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER,
          EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER,
          10
        ),
        'Pendiente',
        TO_CHAR(CURRENT_DATE, 'MM/YYYY')
      )
      ON CONFLICT (id_alumno, periodo)
      DO NOTHING
      RETURNING
        *,
        TO_CHAR(periodo, 'MM/YYYY') AS mes_anio,
        EXTRACT(MONTH FROM periodo)::INTEGER AS mes,
        EXTRACT(YEAR FROM periodo)::INTEGER AS anio,
        vencimiento AS fecha_vencimiento;
      `,
      [idAlumno, monto],
    );

    if (result.rows.length > 0) {
      return result.rows[0];
    }

    const existente = await this.obtenerCuotaPorPeriodo(
      idAlumno,
      this.periodoActual(),
    );

    return existente;
  }

  // ============================================================
  // GENERAR CUOTAS PARA TODOS LOS ALUMNOS
  // ============================================================

  async generarCuotasMes(monto: number) {
    this.validarImporte(monto);

    const result = await this.databaseService.query(
      `
      INSERT INTO public.cuota (
        id_alumno,
        periodo,
        monto,
        vencimiento,
        estado,
        mes_anio
      )
      SELECT
        a.id_alumno,
        DATE_TRUNC('month', CURRENT_DATE)::DATE,
        $1,
        MAKE_DATE(
          EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER,
          EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER,
          10
        ),
        'Pendiente',
        TO_CHAR(CURRENT_DATE, 'MM/YYYY')
      FROM public.alumnos a
      ON CONFLICT (id_alumno, periodo)
      DO NOTHING
      RETURNING
        *,
        TO_CHAR(periodo, 'MM/YYYY') AS mes_anio,
        EXTRACT(MONTH FROM periodo)::INTEGER AS mes,
        EXTRACT(YEAR FROM periodo)::INTEGER AS anio,
        vencimiento AS fecha_vencimiento;
      `,
      [monto],
    );

    return {
      success: true,
      cantidadGenerada: result.rows.length,
      cuotas: result.rows,
      mensaje: 'Cuotas del mes generadas correctamente.',
    };
  }

  // ============================================================
  // OBTENER CUOTA POR ID
  // ============================================================

  async obtenerCuota(idCuota: number) {
    const result = await this.databaseService.query(
      `
      SELECT
        c.id_cuota,
        c.id_alumno,
        c.periodo,
        TO_CHAR(c.periodo, 'MM/YYYY') AS mes_anio,
        EXTRACT(MONTH FROM c.periodo)::INTEGER AS mes,
        EXTRACT(YEAR FROM c.periodo)::INTEGER AS anio,
        c.monto,
        c.vencimiento,
        c.vencimiento AS fecha_vencimiento,
        c.estado,

        COALESCE(p.total_pagado, 0) AS total_pagado,

        GREATEST(
          c.monto - COALESCE(p.total_pagado, 0),
          0
        ) AS saldo_pendiente,

        u.id_usuario,
        u.nombre,
        u.apellido,
        u.email

      FROM public.cuota c

      INNER JOIN public.alumnos a
        ON a.id_alumno = c.id_alumno

      INNER JOIN public.users u
        ON u.id_usuario = a.id_usuario

      LEFT JOIN LATERAL (
        SELECT SUM(pg.monto) AS total_pagado
        FROM public.pago pg
        WHERE pg.id_cuota = c.id_cuota
          AND LOWER(TRIM(pg.estado)) IN ('aprobado', 'approved')
      ) p ON TRUE

      WHERE c.id_cuota = $1;
      `,
      [idCuota],
    );

    if (!result.rows.length) {
      throw new NotFoundException('La cuota solicitada no existe.');
    }

    return result.rows[0];
  }

  // ============================================================
  // OBTENER CUOTA DE UN ALUMNO PARA UN PERÍODO
  // ============================================================

  async obtenerCuotaPorPeriodo(idAlumno: number, periodo: string) {
    const periodoNormalizado = this.normalizarPeriodo(periodo);

    const result = await this.databaseService.query(
      `
      SELECT
        c.*,
        TO_CHAR(c.periodo, 'MM/YYYY') AS mes_anio,

        COALESCE(p.total_pagado, 0) AS total_pagado,

        GREATEST(
          c.monto - COALESCE(p.total_pagado, 0),
          0
        ) AS saldo_pendiente

      FROM public.cuota c

      LEFT JOIN LATERAL (
        SELECT SUM(pg.monto) AS total_pagado
        FROM public.pago pg
        WHERE pg.id_cuota = c.id_cuota
          AND LOWER(TRIM(pg.estado)) IN ('aprobado', 'approved')
      ) p ON TRUE

      WHERE c.id_alumno = $1
        AND c.periodo = $2::DATE

      LIMIT 1;
      `,
      [idAlumno, periodoNormalizado],
    );

    return result.rows[0] ?? null;
  }

  // ============================================================
  // OBTENER CUOTAS DE UN ALUMNO
  // ============================================================

  async obtenerCuotasAlumno(idAlumno: number) {
    const result = await this.databaseService.query(
      `
      SELECT
        c.id_cuota,
        c.id_alumno,
        c.periodo,
        TO_CHAR(c.periodo, 'MM/YYYY') AS mes_anio,
        EXTRACT(MONTH FROM c.periodo)::INTEGER AS mes,
        EXTRACT(YEAR FROM c.periodo)::INTEGER AS anio,
        c.monto,
        c.vencimiento,
        c.vencimiento AS fecha_vencimiento,

        COALESCE(p.total_pagado, 0) AS total_pagado,

        GREATEST(
          c.monto - COALESCE(p.total_pagado, 0),
          0
        ) AS saldo_pendiente,

        CASE
          WHEN COALESCE(p.total_pagado, 0) >= c.monto
            THEN 'Pagado'
          WHEN COALESCE(p.total_pagado, 0) > 0
            THEN 'Parcial'
          ELSE 'Pendiente'
        END AS estado

      FROM public.cuota c

      LEFT JOIN LATERAL (
        SELECT SUM(pg.monto) AS total_pagado
        FROM public.pago pg
        WHERE pg.id_cuota = c.id_cuota
          AND LOWER(TRIM(pg.estado)) IN ('aprobado', 'approved')
      ) p ON TRUE

      WHERE c.id_alumno = $1

      ORDER BY c.periodo DESC, c.id_cuota DESC;
      `,
      [idAlumno],
    );

    return result.rows;
  }

  // ============================================================
  // SALDO PENDIENTE DE UN ALUMNO
  // ============================================================

  async saldoPendienteAlumno(idAlumno: number) {
    const result = await this.databaseService.query(
      `
      SELECT
        COALESCE(
          SUM(
            GREATEST(
              c.monto - COALESCE(p.total_pagado, 0),
              0
            )
          ),
          0
        ) AS saldo

      FROM public.cuota c

      LEFT JOIN LATERAL (
        SELECT SUM(pg.monto) AS total_pagado
        FROM public.pago pg
        WHERE pg.id_cuota = c.id_cuota
          AND LOWER(TRIM(pg.estado)) IN ('aprobado', 'approved')
      ) p ON TRUE

      WHERE c.id_alumno = $1;
      `,
      [idAlumno],
    );

    return Number(result.rows[0]?.saldo ?? 0);
  }

  // ============================================================
  // CREAR CUOTA CON RUTINA
  // ============================================================

  async crearCuotaConRutina(
    idAlumno: number,
    _concepto: string,
    periodo: string,
    importe: number,
    vencimiento: string,
  ) {
    this.validarImporte(importe);

    const periodoNormalizado = this.normalizarPeriodo(periodo);

    const result = await this.databaseService.query(
      `
      INSERT INTO public.cuota (
        id_alumno,
        periodo,
        monto,
        vencimiento,
        estado,
        mes_anio
      )
      VALUES (
        $1,
        $2::DATE,
        $3,
        $4::DATE,
        'Pendiente',
        TO_CHAR($2::DATE, 'MM/YYYY')
      )
      ON CONFLICT (id_alumno, periodo)
      DO NOTHING
      RETURNING
        *,
        TO_CHAR(periodo, 'MM/YYYY') AS mes_anio,
        EXTRACT(MONTH FROM periodo)::INTEGER AS mes,
        EXTRACT(YEAR FROM periodo)::INTEGER AS anio,
        vencimiento AS fecha_vencimiento;
      `,
      [
        idAlumno,
        periodoNormalizado,
        importe,
        vencimiento,
      ],
    );

    if (result.rows.length > 0) {
      return result.rows[0];
    }

    return this.obtenerCuotaPorPeriodo(idAlumno, periodoNormalizado);
  }

  // ============================================================
  // VALIDACIONES Y AUXILIARES
  // ============================================================

  private validarImporte(monto: number): void {
    if (!Number.isFinite(monto) || monto <= 0) {
      throw new BadRequestException(
        'El importe de la cuota debe ser mayor que cero.',
      );
    }
  }

  private periodoActual(): string {
    // Se utiliza PostgreSQL como referencia temporal en las consultas.
    // Este método solo proporciona una fecha para normalizar la consulta.
    const fecha = new Date();
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');

    return `${anio}-${mes}-01`;
  }
}
