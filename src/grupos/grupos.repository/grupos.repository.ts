import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class GruposRepository {
  constructor(
    private readonly databaseService: DatabaseService,
  ) {}

  
  async crearGrupo(
    idDisciplina: number,
    idProfesor: number,
    nivel: string,
    cupoMax: number,
  ) {
    const result = await this.databaseService.query(
      `SELECT public.crear_grupo($1, $2, $3, $4) AS id_grupo`,
      [idDisciplina, idProfesor, nivel, cupoMax],
    );

    return {
      id_grupo: Number(result.rows[0].id_grupo),
    };
  }


  async actualizarGrupo(
    idGrupo: number,
    idDisciplina: number,
    idProfesor: number,
    nivel: string,
    cupoMax: number,
    activo: boolean,
  ) {
    const result = await this.databaseService.query(
      `
      UPDATE grupos
      SET
        id_disciplina = $2,
        id_profesor = $3,
        nivel = $4,
        cupo_max = $5,
        activo = $6
      WHERE id_grupo = $1
      RETURNING *
      `,
      [
        idGrupo,
        idDisciplina,
        idProfesor,
        nivel,
        cupoMax,
        activo,
      ],
    );

    return result.rows[0] ?? null;
  }

  
  async obtenerGruposPorAlumno(idAlumno: number) {
    const result = await this.databaseService.query(
      `
      SELECT
        g.id_grupo,
        g.id_disciplina,
        d.disciplina,
        g.id_profesor,
        CONCAT(u.nombre, ' ', u.apellido) AS profesor,
        g.nivel,
        g.cupo_max,
        g.activo,
        i.id_inscripcion,
        i.fecha_inscripcion,
        i.estado AS estado_inscripcion,
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id_horario', h.id_horario,
              'dia_semana', h.dia_semana,
              'hora_inicio', h.hora_inicio,
              'hora_fin', h.hora_fin
            )
            ORDER BY h.dia_semana, h.hora_inicio
          ) FILTER (WHERE h.id_horario IS NOT NULL),
          '[]'::json
        ) AS horarios
      FROM inscripcion i
      INNER JOIN grupos g
        ON g.id_grupo = i.id_grupo
      INNER JOIN disciplinas d
        ON d.id_disciplina = g.id_disciplina
      INNER JOIN profesores p
        ON p.id_profesor = g.id_profesor
      INNER JOIN users u
        ON u.id_usuario = p.id_usuario
      LEFT JOIN horario_grupo h
        ON h.id_grupo = g.id_grupo
      WHERE i.id_alumno = $1
        AND i.estado = 'Activo'
      GROUP BY
        g.id_grupo,
        g.id_disciplina,
        d.disciplina,
        g.id_profesor,
        u.nombre,
        u.apellido,
        g.nivel,
        g.cupo_max,
        g.activo,
        i.id_inscripcion,
        i.fecha_inscripcion,
        i.estado
      ORDER BY g.id_grupo;
      `,
      [idAlumno],
    );

    return result.rows;
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
        g.id_grupo,
        d.disciplina,
        g.nivel,
        r.id_reserva,
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

  async todasLasClases() {
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
      INNER JOIN tipos_clase tc ON tc.id_tipo_clase = c.id_tipo_clase
      LEFT JOIN grupos g ON g.id_grupo = c.id_grupo
      LEFT JOIN disciplinas d ON d.id_disciplina = g.id_disciplina
      ORDER BY c.fecha, c.hora_inicio
      `,
    );

    return result.rows;
  }

  async clasePorId(idClase: number) {
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
      INNER JOIN tipos_clase tc ON tc.id_tipo_clase = c.id_tipo_clase
      LEFT JOIN grupos g ON g.id_grupo = c.id_grupo
      LEFT JOIN disciplinas d ON d.id_disciplina = g.id_disciplina
      WHERE c.id_clase = $1
      `,
      [idClase],
    );

    return result.rows[0] ?? null;
  }

  async gruposDisponibles() {
    const result = await this.databaseService.query(
      `
      SELECT
        g.id_grupo,
        g.id_disciplina,
        d.disciplina,
        g.id_profesor,
        u.nombre AS nombre_profesor,
        u.apellido AS apellido_profesor,
        g.nivel,
        g.cupo_max,
        g.activo,
        COUNT(i.id_inscripcion)::integer AS alumnos_inscriptos,
        GREATEST(
          g.cupo_max - COUNT(i.id_inscripcion)::integer,
          0
        ) AS cupos_disponibles,
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id_horario', h.id_horario,
              'dia_semana', h.dia_semana,
              'hora_inicio', h.hora_inicio,
              'hora_fin', h.hora_fin
            )
            ORDER BY h.dia_semana, h.hora_inicio
          ) FILTER (WHERE h.id_horario IS NOT NULL),
          '[]'::json
        ) AS horarios
      FROM grupos g
      INNER JOIN disciplinas d ON d.id_disciplina = g.id_disciplina
      INNER JOIN profesores p ON p.id_profesor = g.id_profesor
      INNER JOIN users u ON u.id_usuario = p.id_usuario
      LEFT JOIN inscripcion i
        ON i.id_grupo = g.id_grupo
       AND i.estado = 'Activo'
      LEFT JOIN horario_grupo h ON h.id_grupo = g.id_grupo
      WHERE g.activo = TRUE
      GROUP BY
        g.id_grupo,
        g.id_disciplina,
        d.disciplina,
        g.id_profesor,
        u.nombre,
        u.apellido,
        g.nivel,
        g.cupo_max,
        g.activo
      HAVING COUNT(i.id_inscripcion) < g.cupo_max
      ORDER BY d.disciplina, g.nivel
      `,
    );

    return result.rows;
  }

  async gruposPorProfesor(idProfesor: number) {
    const result = await this.databaseService.query(
      `
      SELECT
        g.id_grupo,
        g.nivel,
        g.cupo_max,
        d.disciplina,
        COUNT(i.id_inscripcion)::int AS cantidad_alumnos
      FROM public.grupos g
      INNER JOIN public.disciplinas d
        ON d.id_disciplina = g.id_disciplina
      LEFT JOIN public.inscripcion i
        ON i.id_grupo = g.id_grupo
        AND i.estado = 'Activo'
      WHERE g.id_profesor = $1
      GROUP BY
        g.id_grupo,
        g.nivel,
        g.cupo_max,
        d.disciplina
      ORDER BY g.id_grupo;
      `,
      [idProfesor],
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

  async alumnosPorClase(idClase: number) {
    const result = await this.databaseService.query(
      `
      SELECT
        a.id_alumno,
        u.id_usuario,
        u.nombre,
        u.apellido,
        u.email,
        i.estado AS estado_inscripcion,
        asi.estado AS estado_asistencia,
        asi.observaciones
      FROM clase c
      INNER JOIN inscripcion i ON i.id_grupo = c.id_grupo
      INNER JOIN alumnos a ON a.id_alumno = i.id_alumno
      INNER JOIN users u ON u.id_usuario = a.id_usuario
      LEFT JOIN asistencia asi
        ON asi.id_alumno = a.id_alumno
       AND asi.id_clase = c.id_clase
      WHERE c.id_clase = $1
        AND i.estado = 'Activo'
      ORDER BY u.apellido, u.nombre
      `,
      [idClase],
    );

    return result.rows;
  }

  async registrarRetiro(
    idAlumno: number,
    idAutorizada: number,
    idProfesor: number,
  ) {
    const result = await this.databaseService.query(
      `
      INSERT INTO retiro_menor (
        id_alumno,
        id_autorizada,
        id_profesor
      )
      VALUES ($1, $2, $3)
      RETURNING *
      `,
      [idAlumno, idAutorizada, idProfesor],
    );

    return {
      success: true,
      message: 'Retiro registrado correctamente.',
      retiro: result.rows[0],
    };
  }

  async alumnosPorGrupo(idGrupo: number) {
    const resultado = await this.databaseService.query(
            `
            SELECT DISTINCT
                a.id_alumno,
                u.nombre,
                u.apellido,
                u.dni
            FROM inscripcion i
            INNER JOIN alumnos a
                ON a.id_alumno = i.id_alumno
            INNER JOIN users u
                ON u.id_usuario = a.id_usuario
            WHERE i.id_grupo = $1
            ORDER BY u.apellido, u.nombre;
            `,
            [idGrupo],
        );


    return resultado.rows;
    }

  async liquidacionesPorProfesor(idProfesor: number) {
    const result = await this.databaseService.query(
      `
      SELECT
        lp.id_liquidacion,
        lp.id_profesor,
        lp.id_reserva,
        lp.monto_base,
        lp.porcentaje,
        lp.monto_profesor,
        lp.monto_academia,
        lp.fecha_generacion,
        lp.estado,
        r.id_alumno,
        r.id_clase,
        c.fecha,
        c.hora_inicio,
        c.hora_fin
      FROM liquidacion_profesor lp
      INNER JOIN reserva r ON r.id_reserva = lp.id_reserva
      INNER JOIN clase c ON c.id_clase = r.id_clase
      WHERE lp.id_profesor = $1
      ORDER BY lp.fecha_generacion DESC
      `,
      [idProfesor],
    );

    return result.rows;
  }
}