import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

export interface CuotaParaPago {
  id_cuota: number;
  monto: number | string;
  email: string | null;
  nombre: string | null;
  apellido: string | null;
  paquete_creditos: number | string | null;
  paquete_nombre: string | null;
}

@Injectable()
export class PagosRepository {
  constructor(
    private readonly databaseService: DatabaseService,
  ) {}

  async obtenerCuota(
    idCuota: number,
  ): Promise<CuotaParaPago | null> {
    const result = await this.databaseService.query(
      `
      SELECT
        c.id_cuota,
        c.monto,
        u.email,
        u.nombre,
        u.apellido,
        NULL::integer AS paquete_creditos,
        NULL::varchar AS paquete_nombre
      FROM cuota c
      INNER JOIN alumnos a ON a.id_alumno = c.id_alumno
      INNER JOIN users u ON u.id_usuario = a.id_usuario
      WHERE c.id_cuota = $1
      LIMIT 1
      `,
      [idCuota],
    );

    return result.rows[0] ?? null;
  }

  async existePagoMercadoPago(
    idMercadoPago: number | string,
  ): Promise<boolean> {
    const result = await this.databaseService.query(
      `
      SELECT EXISTS (
        SELECT 1
        FROM pago
        WHERE id_mercado_pago = $1::bigint
      ) AS existe
      `,
      [String(idMercadoPago)],
    );

    return result.rows[0]?.existe === true;
  }

  async obtenerPagoMercadoPago(
    idMercadoPago: number | string,
  ) {
    const result = await this.databaseService.query(
      `
      SELECT *
      FROM pago
      WHERE id_mercado_pago = $1::bigint
      LIMIT 1
      `,
      [String(idMercadoPago)],
    );

    return result.rows[0] ?? null;
  }

  async registrarPago(
    idCuota: number,
    monto: number,
    metodoPago: string,
    idMercadoPago: number | string,
  ) {
    // El INSERT y la actualización de la cuota se realizan
    // dentro de una única sentencia SQL.
    const result = await this.databaseService.query(
      `
      WITH nuevo_pago AS (
        INSERT INTO pago (
          id_cuota,
          monto,
          fecha_pago,
          estado,
          id_mercado_pago,
          metodo_pago
        )
        VALUES (
          $1,
          $2,
          CURRENT_TIMESTAMP,
          'Aprobado',
          $3::bigint,
          $4
        )
        RETURNING id_pago, id_cuota
      ),
      cuota_actualizada AS (
        UPDATE cuota c
        SET estado = CASE
          WHEN (
            SELECT COALESCE(SUM(p.monto), 0)
            FROM pago p
            WHERE p.id_cuota = c.id_cuota
              AND p.estado <> 'Anulado'
          ) >= c.monto
          THEN 'Pagado'
          ELSE 'Pendiente'
        END
        FROM nuevo_pago np
        WHERE c.id_cuota = np.id_cuota
        RETURNING c.id_cuota
      )
      SELECT np.id_pago
      FROM nuevo_pago np
      INNER JOIN cuota_actualizada ca
        ON ca.id_cuota = np.id_cuota
      `,
      [
        idCuota,
        monto,
        String(idMercadoPago),
        metodoPago,
      ],
    );

    if (result.rows.length === 0) {
      throw new NotFoundException(
        `No se pudo registrar el pago de la cuota ${idCuota}.`,
      );
    }

    return result.rows[0];
  }

  async anularPago(idPago: number) {
    const result = await this.databaseService.query(
      `
      WITH pago_anulado AS (
        UPDATE pago
        SET estado = 'Anulado'
        WHERE id_pago = $1
        RETURNING id_pago, id_cuota
      ),
      cuota_actualizada AS (
        UPDATE cuota c
        SET estado = CASE
          WHEN (
            SELECT COALESCE(SUM(p.monto), 0)
            FROM pago p
            WHERE p.id_cuota = c.id_cuota
              AND p.estado <> 'Anulado'
          ) >= c.monto
          THEN 'Pagado'
          ELSE 'Pendiente'
        END
        FROM pago_anulado pa
        WHERE c.id_cuota = pa.id_cuota
        RETURNING c.id_cuota
      )
      SELECT pa.id_pago
      FROM pago_anulado pa
      INNER JOIN cuota_actualizada ca
        ON ca.id_cuota = pa.id_cuota
      `,
      [idPago],
    );

    return {
      success: result.rows.length > 0,
      message:
        result.rows.length > 0
          ? 'Pago anulado correctamente.'
          : 'No se encontró el pago.',
    };
  }
}