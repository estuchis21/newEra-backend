import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class CuotasRepository {
  constructor(
    private readonly databaseService: DatabaseService,
  ) {}

  // ============================================================
  // CREAR CUOTA MANUAL
  // ============================================================

  async crearCuota(
    idAlumno: number,
    monto: number,
  ) {
    const result =
      await this.databaseService.query(
        `
        INSERT INTO cuota (
          id_alumno,
          mes_anio,
          monto,
          vencimiento,
          estado,
          saldo
        )

        VALUES (
          $1,

          TO_CHAR(
            CURRENT_DATE,
            'MM/YYYY'
          ),

          $2,

          MAKE_DATE(
            EXTRACT(
              YEAR FROM CURRENT_DATE
            )::INTEGER,

            EXTRACT(
              MONTH FROM CURRENT_DATE
            )::INTEGER,

            10
          ),

          'Pendiente',

          $2
        )

        RETURNING *
        `,
        [
          idAlumno,
          monto,
        ],
      );

    if (result.rows.length === 0) {
      throw new Error(
        'No se pudo crear la cuota',
      );
    }

    return result.rows[0];
  }

  // ============================================================
  // GENERAR CUOTAS DEL MES
  // ============================================================

  async generarCuotasMes() {
    await this.databaseService.query(
      `
      CALL generar_cuotas_mes()
      `,
    );

    return {
      success: true,
      mensaje:
        'Cuotas del mes generadas correctamente',
    };
  }

  // ============================================================
  // OBTENER CUOTA
  // ============================================================

  async obtenerCuota(
    idCuota: number,
  ) {
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

          SPLIT_PART(
            c.mes_anio,
            '/',
            1
          )::INTEGER AS mes,

          SPLIT_PART(
            c.mes_anio,
            '/',
            2
          )::INTEGER AS anio,

          c.vencimiento
            AS fecha_vencimiento,

          u.id_user,
          u.nombre,
          u.apellido,
          u.email

        FROM cuota c

        INNER JOIN alumnos a
          ON a.id_alumno =
             c.id_alumno

        INNER JOIN users u
          ON u.id_user =
             a.id_user

        WHERE c.id_cuota = $1
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
        SELECT

          c.id_cuota,
          c.id_alumno,

          c.mes_anio,

          SPLIT_PART(
            c.mes_anio,
            '/',
            1
          )::INTEGER AS mes,

          SPLIT_PART(
            c.mes_anio,
            '/',
            2
          )::INTEGER AS anio,

          c.monto,

          c.vencimiento,

          c.vencimiento
            AS fecha_vencimiento,

          c.estado,

          c.saldo

        FROM cuota c

        WHERE c.id_alumno = $1

        ORDER BY
          c.id_cuota DESC
        `,
        [
          idAlumno,
        ],
      );

    return result.rows;
  }
}