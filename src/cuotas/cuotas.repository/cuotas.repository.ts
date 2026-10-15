import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class CuotasRepository {
  constructor(
    private readonly databaseService: DatabaseService,
  ) {}

  async crearCuota(idAlumno: number, monto: number) {
    const result = await this.databaseService.query(
      `
      INSERT INTO cuota (
        id_alumno,
        mes_anio,
        monto,
        vencimiento,
        estado
      )
      VALUES (
        $1,
        TO_CHAR(CURRENT_DATE, 'MM/YYYY'),
        $2,
        MAKE_DATE(
          EXTRACT(YEAR FROM CURRENT_DATE)::integer,
          EXTRACT(MONTH FROM CURRENT_DATE)::integer,
          10
        ),
        'Pendiente'
      )
      RETURNING *
      `,
      [idAlumno, monto],
    );

    return result.rows[0] ?? null;
  }

  async generarCuotasMes(monto: number) {
    const result = await this.databaseService.query(
      `
      INSERT INTO cuota (
        id_alumno,
        mes_anio,
        monto,
        vencimiento,
        estado
      )
      SELECT
        a.id_alumno,
        TO_CHAR(CURRENT_DATE, 'MM/YYYY'),
        $1,
        MAKE_DATE(
          EXTRACT(YEAR FROM CURRENT_DATE)::integer,
          EXTRACT(MONTH FROM CURRENT_DATE)::integer,
          10
        ),
        'Pendiente'
      FROM alumnos a
      WHERE NOT EXISTS (
        SELECT 1
        FROM cuota c
        WHERE c.id_alumno = a.id_alumno
          AND c.mes_anio = TO_CHAR(CURRENT_DATE, 'MM/YYYY')
      )
      RETURNING *
      `,
      [monto],
    );

    return {
      success: true,
      cantidadGenerada: result.rowCount,
      cuotas: result.rows,
      mensaje: 'Cuotas del mes generadas correctamente.',
    };
  }

  async obtenerCuota(idCuota: number) {
    const result = await this.databaseService.query(
      `
      SELECT
        c.id_cuota,
        c.id_alumno,
        c.mes_anio,
        c.monto,
        c.vencimiento,
        c.estado,
        CASE
          WHEN SPLIT_PART(c.mes_anio, '/', 1) ~ '^[0-9]+$'
          THEN SPLIT_PART(c.mes_anio, '/', 1)::integer
          ELSE NULL
        END AS mes,
        CASE
          WHEN SPLIT_PART(c.mes_anio, '/', 2) ~ '^[0-9]+$'
          THEN SPLIT_PART(c.mes_anio, '/', 2)::integer
          ELSE NULL
        END AS anio,
        c.vencimiento AS fecha_vencimiento,
        u.id_usuario,
        u.nombre,
        u.apellido,
        u.email
      FROM cuota c
      INNER JOIN alumnos a ON a.id_alumno = c.id_alumno
      INNER JOIN users u ON u.id_usuario = a.id_usuario
      WHERE c.id_cuota = $1
      `,
      [idCuota],
    );

    return result.rows[0] ?? null;
  }

  async obtenerCuotasAlumno(idAlumno: number) {
    const result = await this.databaseService.query(
      `
      SELECT
        c.id_cuota,
        c.id_alumno,
        c.mes_anio,
        CASE
          WHEN SPLIT_PART(c.mes_anio, '/', 1) ~ '^[0-9]+$'
          THEN SPLIT_PART(c.mes_anio, '/', 1)::integer
          ELSE NULL
        END AS mes,
        CASE
          WHEN SPLIT_PART(c.mes_anio, '/', 2) ~ '^[0-9]+$'
          THEN SPLIT_PART(c.mes_anio, '/', 2)::integer
          ELSE NULL
        END AS anio,
        c.monto,
        c.vencimiento,
        c.vencimiento AS fecha_vencimiento,
        c.estado
      FROM cuota c
      WHERE c.id_alumno = $1
      ORDER BY c.id_cuota DESC
      `,
      [idAlumno],
    );

    return result.rows;
  }

  async saldoPendienteAlumno(idAlumno: number) {
    const result = await this.databaseService.query(
      `
      SELECT COALESCE(SUM(monto), 0) AS saldo
      FROM cuota
      WHERE id_alumno = $1
        AND estado <> 'Pagado'
      `,
      [idAlumno],
    );

    return Number(result.rows[0]?.saldo ?? 0);
  }

  async crearCuotaConRutina(
    idAlumno: number,
    _concepto: string,
    periodo: string,
    importe: number,
    vencimiento: string,
  ) {
    const result = await this.databaseService.query(
      `
      INSERT INTO cuota (
        id_alumno,
        mes_anio,
        monto,
        vencimiento,
        estado
      )
      VALUES ($1, $2, $3, $4::date, 'Pendiente')
      RETURNING *
      `,
      [idAlumno, periodo, importe, vencimiento],
    );

    return result.rows[0] ?? null;
  }
}