import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class HorariosRepository {
  constructor(
    private readonly databaseService: DatabaseService,
  ) {}

  async agregarHorarioGrupo(
    idGrupo: number,
    diaSemana: string,
    horaInicio: string,
    horaFin: string,
  ) {
    const result = await this.databaseService.query(
      `
      INSERT INTO horario_grupo (
        id_grupo,
        dia_semana,
        hora_inicio,
        hora_fin
      )
      VALUES ($1, $2, $3::time, $4::time)
      RETURNING *
      `,
      [idGrupo, diaSemana, horaInicio, horaFin],
    );

    return {
      mensaje: 'Horario agregado correctamente',
      ...result.rows[0],
    };
  }

  async horariosPorGrupo(idGrupo: number) {
    const result = await this.databaseService.query(
      `
      SELECT
        h.id_horario,
        h.id_grupo,
        h.dia_semana,
        h.hora_inicio,
        h.hora_fin
      FROM horario_grupo h
      WHERE h.id_grupo = $1
      ORDER BY
        CASE LOWER(h.dia_semana)
          WHEN 'lunes' THEN 1
          WHEN 'martes' THEN 2
          WHEN 'miércoles' THEN 3
          WHEN 'miercoles' THEN 3
          WHEN 'jueves' THEN 4
          WHEN 'viernes' THEN 5
          WHEN 'sábado' THEN 6
          WHEN 'sabado' THEN 6
          WHEN 'domingo' THEN 7
          ELSE 8
        END,
        h.hora_inicio
      `,
      [idGrupo],
    );

    return result.rows;
  }

  async actualizarHorario(
    idHorario: number,
    diaSemana: string,
    horaInicio: string,
    horaFin: string,
  ) {
    const result = await this.databaseService.query(
      `
      UPDATE horario_grupo
      SET
        dia_semana = $2,
        hora_inicio = $3::time,
        hora_fin = $4::time
      WHERE id_horario = $1
      RETURNING *
      `,
      [idHorario, diaSemana, horaInicio, horaFin],
    );

    return result.rows[0] ?? null;
  }

  async eliminarHorario(idHorario: number) {
    const result = await this.databaseService.query(
      `
      DELETE FROM horario_grupo
      WHERE id_horario = $1
      RETURNING id_horario
      `,
      [idHorario],
    );

    const eliminado = (result.rowCount ?? 0) > 0;

    return {
      success: eliminado,
      message: eliminado
        ? 'Horario eliminado correctamente.'
        : 'No se encontró el horario.',
    };
  }
}