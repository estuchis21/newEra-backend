import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class PagosRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async registrarPago(idCuota: number, monto: number, metodoPago: string, referencia: string | null = null) {
    const result = await this.databaseService.query(
      `SELECT registrar_pago($1, $2, $3, $4) AS id_pago`,
      [idCuota, monto, metodoPago, referencia],
    );
    return result.rows[0];
  }

  async anularPago(idPago: number) {
    await this.databaseService.query(`CALL anular_pago($1)`, [idPago]);
    return { success: true, message: 'Pago anulado correctamente.' };
  }
}
