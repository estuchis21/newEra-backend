import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class CuotasRepository {
  constructor(
    private readonly databaseService: DatabaseService,
  ) {}

  async crearCuota(idAlumno: number, monto: number) {
    const result = await this.databaseService.query(
      `INSERT INTO cuota (
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
           EXTRACT(YEAR FROM CURRENT_DATE)::int,
           EXTRACT(MONTH FROM CURRENT_DATE)::int,
           10
         ),
         'Pendiente'
       )
       RETURNING *`,
      [idAlumno, monto],
    );

    return result.rows[0] ?? null;
  }

  async generarCuotasMes() {
    await this.databaseService.query(
      `CALL generar_cuotas_mes()`,
    );

    return {
      success: true,
      mensaje: 'Cuotas del mes generadas correctamente.',
    };
  }

  async obtenerCuota(idCuota: number) {
    const result = await this.databaseService.query(
      `SELECT
         c.id_cuota,
         c.id_alumno,
         c.mes_anio,
         c.monto,
         c.vencimiento,
         c.estado,
         CASE
           WHEN SPLIT_PART(c.mes_anio, '/', 1) ~ '^[0-9]+$'
           THEN SPLIT_PART(c.mes_anio, '/', 1)::int
           ELSE NULL
         END AS mes,
         CASE
           WHEN SPLIT_PART(c.mes_anio, '/', 2) ~ '^[0-9]+$'
           THEN SPLIT_PART(c.mes_anio, '/', 2)::int
           ELSE NULL
         END AS anio,
         c.vencimiento AS fecha_vencimiento,
         u.id_usuario,
         u.nombre,
         u.apellido,
         u.email
       FROM cuota c
       INNER JOIN alumnos a
         ON a.id_alumno = c.id_alumno
       INNER JOIN users u
         ON u.id_usuario = a.id_usuario
       WHERE c.id_cuota = $1`,
      [idCuota],
    );

    return result.rows[0] ?? null;
  }

  async obtenerCuotasAlumno(idAlumno: number) {
    const result = await this.databaseService.query(
      `SELECT
         c.id_cuota,
         c.id_alumno,
         c.mes_anio,
         CASE
           WHEN SPLIT_PART(c.mes_anio, '/', 1) ~ '^[0-9]+$'
           THEN SPLIT_PART(c.mes_anio, '/', 1)::int
           ELSE NULL
         END AS mes,
         CASE
           WHEN SPLIT_PART(c.mes_anio, '/', 2) ~ '^[0-9]+$'
           THEN SPLIT_PART(c.mes_anio, '/', 2)::int
           ELSE NULL
         END AS anio,
         c.monto,
         c.vencimiento,
         c.vencimiento AS fecha_vencimiento,
         c.estado
       FROM cuota c
       WHERE c.id_alumno = $1
       ORDER BY c.id_cuota DESC`,
      [idAlumno],
    );

    return result.rows;
  }

  async saldoPendienteAlumno(idAlumno: number) {
    const result = await this.databaseService.query(
      `SELECT saldo_pendiente_alumno($1) AS saldo`,
      [idAlumno],
    );

    return Number(result.rows[0]?.saldo ?? 0);
  }

  async crearCuotaConRutina(
    idAlumno: number,
    concepto: string,
    periodo: string,
    importe: number,
    vencimiento: string,
  ) {
    const result = await this.databaseService.query(
      `SELECT crear_cuota(
         $1,
         $2,
         $3::date,
         $4,
         $5::date
       ) AS id_cuota`,
      [idAlumno, concepto, periodo, importe, vencimiento],
    );

    return result.rows[0];
  }
}