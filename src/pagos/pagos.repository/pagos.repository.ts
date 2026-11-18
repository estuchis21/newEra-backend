import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

export interface CuotaParaPago {
  id_cuota: number;
  monto: number | string;
  estado: string;
  email: string | null;
  nombre: string | null;
  apellido: string | null;
}

@Injectable()
export class PagosRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async obtenerCuota(idCuota: number): Promise<CuotaParaPago | null> {
    const result = await this.databaseService.query(
      `
      SELECT c.id_cuota, c.monto, c.estado,
             u.email, u.nombre, u.apellido
      FROM public.cuota c
      INNER JOIN public.alumnos a ON a.id_alumno = c.id_alumno
      INNER JOIN public.users u ON u.id_usuario = a.id_usuario
      WHERE c.id_cuota = $1
      LIMIT 1
      `,
      [idCuota],
    );
    return result.rows[0] ?? null;
  }

  async existePagoMercadoPago(idMercadoPago: number | string): Promise<boolean> {
    const result = await this.databaseService.query(
      `SELECT EXISTS (
         SELECT 1 FROM public.pago WHERE id_mercado_pago = $1::bigint
       ) AS existe`,
      [String(idMercadoPago)],
    );
    return result.rows[0]?.existe === true;
  }

  
  async registrarPago(
    idCuota: number,
    monto: number,
    metodoPago: string,
    idMercadoPago: number | string,
    detalle: string | null,
  ) {
    const result = await this.databaseService.query(
      `
      WITH pago_insertado AS (
        INSERT INTO public.pago (
          id_cuota,
          monto,
          fecha_pago,
          estado,
          id_mercado_pago,
          metodo_pago,
          detalle
        )
        VALUES (
          $1,
          $2,
          CURRENT_TIMESTAMP,
          'Aprobado',
          $3::bigint,
          $4,
          $5
        )
        ON CONFLICT (id_mercado_pago)
          WHERE id_mercado_pago IS NOT NULL
        DO NOTHING
        RETURNING id_pago, id_cuota
      ),
      pago_existente AS (
        SELECT p.id_pago, p.id_cuota
        FROM public.pago p
        WHERE p.id_mercado_pago = $3::bigint
          AND NOT EXISTS (SELECT 1 FROM pago_insertado)
      ),
      pago_final AS (
        SELECT * FROM pago_insertado
        UNION ALL
        SELECT * FROM pago_existente
      ),
      cuota_actualizada AS (
        UPDATE public.cuota c
        SET estado = CASE
          WHEN (
            SELECT COALESCE(SUM(p.monto), 0)
            FROM public.pago p
            WHERE p.id_cuota = c.id_cuota
              AND LOWER(TRIM(COALESCE(p.estado, '')))
                  IN ('aprobado', 'approved')
          ) >= c.monto
          THEN 'Pagado'
          ELSE 'Pendiente'
        END
        WHERE c.id_cuota = $1
          AND EXISTS (
            SELECT 1 FROM pago_final pf
            WHERE pf.id_cuota = c.id_cuota
          )
        RETURNING c.id_cuota, c.estado
      )
      SELECT
        pf.id_pago,
        pf.id_cuota,
        ca.estado AS estado_cuota
      FROM pago_final pf
      INNER JOIN cuota_actualizada ca
        ON ca.id_cuota = pf.id_cuota
      `,
      [idCuota, monto, String(idMercadoPago), metodoPago, detalle],
    );

    if (!result.rows.length) {
      throw new NotFoundException(
        `No se pudo registrar o recuperar el pago de la cuota ${idCuota}.`,
      );
    }

    return result.rows[0];
  }

}
