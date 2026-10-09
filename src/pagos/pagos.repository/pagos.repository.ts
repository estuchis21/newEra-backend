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

  /**
   * Obtiene la cuota y los datos necesarios para crear
   * la preferencia de pago de Mercado Pago.
   *
   * IMPORTANTE:
   * Esta consulta supone que alumnos.id_usuario relaciona
   * alumnos con users, y que cuota.id_paquete relaciona
   * cuota con paquetes_creditos.
   */
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
        pc.creditos AS paquete_creditos,
        pc.nombre AS paquete_nombre
      FROM cuota c
      INNER JOIN alumnos a
        ON a.id_alumno = c.id_alumno
      INNER JOIN users u
        ON u.id_usuario = a.id_usuario
      LEFT JOIN paquetes_creditos pc
        ON pc.id_paquete = c.id_paquete
      WHERE c.id_cuota = $1
      LIMIT 1
      `,
      [idCuota],
    );

    return result.rows[0] ?? null;
  }

  /**
   * Comprueba si el identificador externo ya está registrado.
   * La referencia se compara como texto para conservar su formato.
   *
   * Se presupone que pago.referencia almacena la referencia
   * enviada a registrar_pago.
   */
  async existePagoMercadoPago(
    idMercadoPago: number,
  ): Promise<boolean> {
    const result = await this.databaseService.query(
      `
      SELECT EXISTS (
        SELECT 1
        FROM pago
        WHERE referencia = $1
      ) AS existe
      `,
      [String(idMercadoPago)],
    );

    return result.rows[0]?.existe === true;
  }

  /**
   * Registra el pago mediante la función SQL existente.
   * El orden de los argumentos coincide con:
   * registrar_pago(idCuota, monto, metodoPago, referencia).
   */
  async registrarPago(
    idCuota: number,
    monto: number,
    metodoPago: string,
    referencia: string | null = null,
  ) {
    const result = await this.databaseService.query(
      `
      SELECT registrar_pago($1, $2, $3, $4) AS id_pago
      `,
      [idCuota, monto, metodoPago, referencia],
    );

    return result.rows[0];
  }

  /**
   * Anula un pago mediante el procedimiento SQL existente.
   */
  async anularPago(idPago: number) {
    await this.databaseService.query(
      `CALL anular_pago($1)`,
      [idPago],
    );

    return {
      success: true,
      message: 'Pago anulado correctamente.',
    };
  }
}
