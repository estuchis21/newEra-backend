import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CreateDisciplinaDto } from '../dto/disciplinas.dto';

@Injectable()
export class DisciplinasRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async obtenerDisciplina(idDisciplina: number) {
    const result = await this.databaseService.query(`SELECT * FROM buscar_disciplina($1)`, [idDisciplina]);
    return result.rows;
  }

  async crearDisciplina(dto: CreateDisciplinaDto) {
    await this.databaseService.query(`CALL insertar_disciplina($1)`, [dto.disciplina]);
  }

  async existeDisciplinaNombre(disciplina: string) {
    const result = await this.databaseService.query(
      `SELECT existe_disciplina_nombre($1) AS existe`,
      [disciplina],
    );
    return Boolean(result.rows[0]?.existe);
  }

  async obtenerTodas() {
    const result = await this.databaseService.query(`SELECT * FROM obtener_disciplinas()`);
    return result.rows;
  }
}
