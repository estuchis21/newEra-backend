import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class ClasesRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async crearClase(
    idGrupo: number | null,
    idTipoClase: number,
    _nombre: string,
    fecha: string,
    horaInicio: string,
    horaFin: string,
  ) {
    const result = await this.databaseService.query(
      `
      INSERT INTO clase (
        id_grupo,
        id_tipo_clase,
        fecha,
        hora_inicio,
        hora_fin,
        estado
      )
      VALUES ($1, $2, $3::date, $4::time, $5::time, 'Pendiente')
      RETURNING *
      `,
      [idGrupo, idTipoClase, fecha, horaInicio, horaFin],
    );

    return result.rows[0];
  }

  async actualizarClase(
    idClase: number,
    idGrupo: number | null,
    idTipoClase: number,
    _nombre: string,
    fecha: string,
    horaInicio: string,
    horaFin: string,
  ) {
    const result = await this.databaseService.query(
      `
      UPDATE clase
      SET
        id_grupo = $2,
        id_tipo_clase = $3,
        fecha = $4::date,
        hora_inicio = $5::time,
        hora_fin = $6::time
      WHERE id_clase = $1
      RETURNING *
      `,
      [idClase, idGrupo, idTipoClase, fecha, horaInicio, horaFin],
    );

    return result.rows[0] ?? null;
  }

  async cancelarClase(idClase: number) {
    const result = await this.databaseService.query(
      `
      UPDATE clase
      SET estado = 'Cancelada'
      WHERE id_clase = $1
      RETURNING *
      `,
      [idClase],
    );

    return result.rows[0] ?? null;
  }

  async sesionesPorAlumno(
    idAlumno: number,
    desde: string | null = null,
    hasta: string | null = null,
  ) {
    const result = await this.databaseService.query(
      `
      SELECT
        c.id_clase,
        c.fecha,
        c.hora_inicio,
        c.hora_fin,
        c.estado AS estado_clase,
        tc.tipo AS tipo_clase,
        c.id_grupo,
        d.disciplina,
        g.nivel,
        r.estado AS estado_reserva
      FROM reserva r
      INNER JOIN clase c ON c.id_clase = r.id_clase
      INNER JOIN tipos_clase tc ON tc.id_tipo_clase = c.id_tipo_clase
      LEFT JOIN grupos g ON g.id_grupo = c.id_grupo
      LEFT JOIN disciplinas d ON d.id_disciplina = g.id_disciplina
      WHERE r.id_alumno = $1
        AND ($2::date IS NULL OR c.fecha >= $2::date)
        AND ($3::date IS NULL OR c.fecha <= $3::date)
      ORDER BY c.fecha DESC, c.hora_inicio DESC
      `,
      [idAlumno, desde, hasta],
    );

    return result.rows;
  }

  async clasesPorProfesor(
    idProfesor: number,
    fecha: string | null = null,
  ) {
    const result = await this.databaseService.query(
      `
      SELECT
        c.id_clase,
        c.id_grupo,
        c.id_tipo_clase,
        tc.tipo AS tipo_clase,
        c.fecha,
        c.hora_inicio,
        c.hora_fin,
        c.estado,
        g.nivel,
        d.disciplina
      FROM clase c
      INNER JOIN grupos g ON g.id_grupo = c.id_grupo
      INNER JOIN disciplinas d ON d.id_disciplina = g.id_disciplina
      INNER JOIN tipos_clase tc ON tc.id_tipo_clase = c.id_tipo_clase
      WHERE g.id_profesor = $1
        AND ($2::date IS NULL OR c.fecha = $2::date)
      ORDER BY c.fecha, c.hora_inicio
      `,
      [idProfesor, fecha],
    );

    return result.rows;
  }
}