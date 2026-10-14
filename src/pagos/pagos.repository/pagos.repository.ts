import { Injectable } from '@nestjs/common';
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
      INNER JOIN alumnos a
        ON a.id_alumno = c.id_alumno
      INNER JOIN users u
        ON u.id_usuario = a.id_usuario
      WHERE c.id_cuota = $1::integer
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
      SELECT existe_pago_mercado_pago($1::bigint) AS existe
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
      FROM obtener_pago_mercado_pago($1::bigint)
      `,
      [String(idMercadoPago)],
    );

    return result.rows[0] ?? null;
  }

  /**
   * Registra un pago usando el procedimiento real de PostgreSQL.
   *
   * Se conserva el orden de los argumentos del método:
   * (idCuota, monto, metodoPago, idMercadoPago).
   */
  async registrarPago(
    idCuota: number,
    monto: number,
    metodoPago: string,
    idMercadoPago: number | string,
  ) {
    await this.databaseService.query(
      `
      CALL registrar_pago_cuota(
        $1::integer,
        $2::numeric,
        $3::bigint,
        $4::varchar
      )
      `,
      [
        idCuota,
        monto,
        String(idMercadoPago),
        metodoPago,
      ],
    );

    const result = await this.databaseService.query(
      `
      SELECT id_pago
      FROM pago
      WHERE id_mercado_pago = $1::bigint
      LIMIT 1
      `,
      [String(idMercadoPago)],
    );

    return result.rows[0] ?? null;
  }

  async anularPago(idPago: number) {
    await this.databaseService.query(
      `CALL anular_pago($1::integer)`,
      [idPago],
    );

    return {
      success: true,
      message: 'Pago anulado correctamente.',
    };
  }
}
