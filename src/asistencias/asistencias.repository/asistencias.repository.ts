import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class AsistenciasRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  
  
  async verAsistencias(idAlumno: number) {
    const result = await this.databaseService.query(
      `
      SELECT
        a.id_asistencia,
        a.id_alumno,
        a.id_clase,
        a.estado AS estado,
        a.observaciones,
        c.fecha,
        c.hora_inicio,
        c.hora_fin,
        c.estado AS estado_clase,
        tc.tipo AS tipo_clase,
        c.id_grupo,
        d.disciplina,
        CONCAT(d.disciplina, ' - ', g.nivel) AS grupo
      FROM asistencia a
      INNER JOIN clase c
        ON c.id_clase = a.id_clase
      INNER JOIN tipos_clase tc
        ON tc.id_tipo_clase = c.id_tipo_clase
      LEFT JOIN grupos g
        ON g.id_grupo = c.id_grupo
      LEFT JOIN disciplinas d
        ON d.id_disciplina = g.id_disciplina
      WHERE a.id_alumno = $1
      ORDER BY c.fecha DESC, c.hora_inicio DESC;
      `,
      [idAlumno],
    );

    return result.rows;
  }


  async verAsistenciaAlumnoClase(idAlumno: number, idClase: number) {
    const result = await this.databaseService.query(
      `
      SELECT
        a.id_asistencia,
        a.id_alumno,
        a.id_clase,
        a.estado,
        a.observaciones,
        c.fecha,
        c.hora_inicio,
        c.hora_fin
      FROM asistencia a
      INNER JOIN clase c ON c.id_clase = a.id_clase
      WHERE a.id_alumno = $1
        AND a.id_clase = $2
      `,
      [idAlumno, idClase],
    );

    return result.rows;
  }

  async buscarAsistencia(idAlumno: number, idClase: number) {
    const result = await this.databaseService.query(
      `
      SELECT *
      FROM asistencia
      WHERE id_alumno = $1
        AND id_clase = $2
      LIMIT 1
      `,
      [idAlumno, idClase],
    );

    return result.rows[0] ?? null;
  }

  async registrarAsistencia(
    idAlumno: number,
    idClase: number,
    estado: string,
    observaciones = '',
  ) {
    try {
      const result = await this.databaseService.query(
        `
        INSERT INTO asistencia (
          id_alumno,
          id_clase,
          estado,
          observaciones
        )
        VALUES ($1, $2, $3, $4)
        RETURNING id_asistencia
        `,
        [idAlumno, idClase, estado, observaciones || null],
      );

      return {
        success: true,
        idAsistencia: result.rows[0].id_asistencia,
        message: 'Asistencia registrada correctamente.',
      };
    } catch (error: any) {
      if (error?.code === '23505') {
        throw new ConflictException(
          `Ya existe una asistencia para el alumno ${idAlumno} y la clase ${idClase}.`,
        );
      }

      if (error?.code === '23503') {
        throw new NotFoundException(
          'El alumno o la clase indicada no existe.',
        );
      }

      throw error;
    }
  }

  // Se mantiene el método por compatibilidad con los servicios existentes.
  async registrarAsistenciaConRutinaAnterior(
    idAlumno: number,
    idClase: number,
    estado: string,
    observaciones = '',
  ) {
    return this.registrarAsistencia(
      idAlumno,
      idClase,
      estado,
      observaciones,
    );
  }

  
  async obtenerAsistenciasPorGrupoYProfesor(
      idGrupo: number,
      idProfesor: number,
  ) {
      const query = `
          SELECT
              a.id_asistencia,
              a.id_alumno,
              a.id_clase,
              a.estado AS estado_asistencia,
              a.observaciones,
              c.fecha,
              c.hora_inicio,
              c.hora_fin,
              g.id_grupo,
              p.id_profesor,
              up.nombre AS nombre_profesor,
              up.apellido AS apellido_profesor,
              ua.nombre AS nombre_alumno,
              ua.apellido AS apellido_alumno
          FROM asistencia a
          INNER JOIN clase c
              ON c.id_clase = a.id_clase
          INNER JOIN grupos g
              ON g.id_grupo = c.id_grupo
          INNER JOIN profesores p
              ON p.id_profesor = g.id_profesor
          INNER JOIN users up
              ON up.id_usuario = p.id_usuario
          INNER JOIN alumnos al
              ON al.id_alumno = a.id_alumno
          INNER JOIN users ua
              ON ua.id_usuario = al.id_usuario
          WHERE g.id_grupo = $1
            AND p.id_profesor = $2
          ORDER BY c.fecha DESC, ua.apellido, ua.nombre;
      `;

      const result = await this.databaseService.query(query, [
          idGrupo,
          idProfesor,
      ]);

      return result.rows;
  }


  
async obtenerAsistenciasPorClase(idClase: number) {
    const query = `
        SELECT
            al.id_alumno,
            ua.nombre AS nombre_alumno,
            ua.apellido AS apellido_alumno,
            c.id_clase,
            c.fecha,
            a.id_asistencia,
            a.estado AS estado_asistencia,
            a.observaciones
        FROM clase c
        INNER JOIN inscripcion i
            ON i.id_grupo = c.id_grupo
           AND i.estado = 'Activo'
        INNER JOIN alumnos al
            ON al.id_alumno = i.id_alumno
        INNER JOIN users ua
            ON ua.id_usuario = al.id_usuario
        LEFT JOIN asistencia a
            ON a.id_alumno = al.id_alumno
           AND a.id_clase = c.id_clase
        WHERE c.id_clase = $1
        ORDER BY ua.apellido, ua.nombre;
    `;

    const result = await this.databaseService.query(query, [idClase]);

    return result.rows.map((row) => ({
        ...row,
        registrada: row.id_asistencia !== null,
    }));
}


  async eliminarAsistencia(idAlumno: number, idClase: number) {
    const result = await this.databaseService.query(
      `
      DELETE FROM asistencia
      WHERE id_alumno = $1
        AND id_clase = $2
      RETURNING id_asistencia
      `,
      [idAlumno, idClase],
    );

    const eliminada = (result.rowCount ?? 0) > 0;

    return {
      success: true,
      eliminada,
      message: eliminada
        ? 'Asistencia eliminada correctamente.'
        : 'No se encontró la asistencia indicada.',
    };
  }
}