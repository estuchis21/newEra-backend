import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class HorariosRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async agregarHorarioGrupo(idGrupo: number, diaSemana: string, horaInicio: string, horaFin: string) {
    const result = await this.databaseService.query(
      `SELECT crear_horario_grupo($1, $2, $3::time, $4::time) AS id_horario`,
      [idGrupo, diaSemana, horaInicio, horaFin],
    );
    return { mensaje: 'Horario agregado correctamente', idHorario: result.rows[0]?.id_horario };
  }

  async horariosPorGrupo(idGrupo: number) {
    const result = await this.databaseService.query(`SELECT * FROM horarios_por_grupo($1)`, [idGrupo]);
    return result.rows;
  }

  async actualizarHorario(idHorario: number, diaSemana: string, horaInicio: string, horaFin: string) {
    await this.databaseService.query(`CALL actualizar_horario_grupo($1, $2, $3::time, $4::time)`, [idHorario, diaSemana, horaInicio, horaFin]);
    return { success: true };
  }

  async eliminarHorario(idHorario: number) {
    await this.databaseService.query(`CALL eliminar_horario_grupo($1)`, [idHorario]);
    return { success: true };
  }
}
