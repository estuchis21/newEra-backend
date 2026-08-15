import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class CuotasRepository {
  constructor(
    private readonly databaseService: DatabaseService,
  ) {}

  // ============================================================
  // CREAR CUOTA
  // ============================================================

  async crearCuota(
    idAlumno: number,
    idPaquete: number,
  ) {
    const result = await this.databaseService.query(
      `
      INSERT INTO cuota (
        id_alumno,
        id_paquete,
        mes_anio,
        monto,
        vencimiento,
        estado,
        saldo
      )
      SELECT
        $1,
        p.id_paquete,
        TO_CHAR(CURRENT_DATE, 'MM/YYYY'),
        p.precio,
        DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '9 days',
        'Pendiente',
        p.precio
      FROM paquetes_creditos p
      WHERE p.id_paquete = $2
        AND p.activo = TRUE

      RETURNING *
      `,
      [
        idAlumno,
        idPaquete,
      ],
    );

    if (result.rows.length === 0) {
      throw new Error(
        'El paquete de créditos no existe o está inactivo',
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
    const result = await this.databaseService.query(
      `
      SELECT
        c.id_cuota,
        c.id_alumno,
        c.id_paquete,
        c.mes_anio,
        c.monto,
        c.vencimiento,
        c.estado,
        c.saldo,

        u.id_user,
        u.nombre,
        u.apellido,
        u.email

      FROM cuota c

      INNER JOIN alumnos a
        ON a.id_alumno = c.id_alumno

      INNER JOIN users u
        ON u.id_user = a.id_user

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
    const result = await this.databaseService.query(
      `
      SELECT
        c.id_cuota,
        c.id_alumno,
        c.id_paquete,
        c.mes_anio,
        c.monto,
        c.vencimiento,
        c.estado,
        c.saldo

      FROM cuota c

      WHERE c.id_alumno = $1

      ORDER BY c.id_cuota DESC
      `,
      [
        idAlumno,
      ],
    );

    return result.rows;
  }
}