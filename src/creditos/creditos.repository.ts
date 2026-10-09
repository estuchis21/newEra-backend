import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class CreditosRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async saldoPorAlumno(idAlumno: number) {
    const result = await this.databaseService.query(`SELECT * FROM saldo_creditos_alumno($1)`, [idAlumno]);
    return result.rows;
  }

  async comprarPaquete(idAlumno: number, idPaquete: number) {
    const result = await this.databaseService.query(`SELECT comprar_creditos($1, $2) AS id_compra`, [idAlumno, idPaquete]);
    return result.rows[0];
  }
}
