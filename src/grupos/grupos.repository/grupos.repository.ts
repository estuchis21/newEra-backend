import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class GruposRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async crearGrupo(idDisciplina: number, idProfesor: number, nivel: string, cupoMax: number) {
    const result = await this.databaseService.query(
      `SELECT crear_grupo($1, $2, $3, $4) AS id_grupo`,
      [idDisciplina, idProfesor, nivel, cupoMax],
    );
    return result.rows[0];
  }

  async actualizarGrupo(idGrupo: number, idDisciplina: number, idProfesor: number, nivel: string, cupoMax: number, activo: boolean) {
    await this.databaseService.query(
      `CALL actualizar_grupo($1, $2, $3, $4, $5, $6)`,
      [idGrupo, idDisciplina, idProfesor, nivel, cupoMax, activo],
    );
    return { success: true };
  }

  async obtenerGrupos(idAlumno: number) {
    const result = await this.databaseService.query(`SELECT * FROM clases_por_alumno($1::integer)`, [idAlumno]);
    return result.rows;
  }

  async gruposPorAlumno(idAlumno: number) {
    const result = await this.databaseService.query(`SELECT * FROM grupos_por_alumno($1)`, [idAlumno]);
    return result.rows;
  }

  async sesionesPorAlumno(idAlumno: number, desde: string | null = null, hasta: string | null = null) {
    const result = await this.databaseService.query(`SELECT * FROM sesiones_por_alumno($1, $2::date, $3::date)`, [idAlumno, desde, hasta]);
    return result.rows;
  }

  async todasLasClases() {
    const result = await this.databaseService.query(`SELECT * FROM todas_las_clases()`);
    return result.rows;
  }

  async clasePorId(idClase: number) {
    const result = await this.databaseService.query(`SELECT * FROM buscar_clase_por_id($1)`, [idClase]);
    return result.rows[0] ?? null;
  }

  async gruposDisponibles() {
    const result = await this.databaseService.query(`SELECT * FROM grupos_disponibles()`);
    return result.rows;
  }

  async gruposPorProfesor(idProfesor: number) {
    const result = await this.databaseService.query(`SELECT * FROM obtener_grupos_profesor($1)`, [idProfesor]);
    return result.rows;
  }

  async clasesPorProfesor(idProfesor: number, fecha: string | null = null) {
    const result = await this.databaseService.query(`SELECT * FROM clases_por_profesor($1, $2::date)`, [idProfesor, fecha]);
    return result.rows;
  }

  async alumnosPorClase(idClase: number) {
    const result = await this.databaseService.query(`SELECT * FROM alumnos_por_clase($1)`, [idClase]);
    return result.rows;
  }

  async registrarRetiro(idAlumno: number, idAutorizada: number, idProfesor: number) {
    await this.databaseService.query(`CALL registrar_retiro($1, $2, $3)`, [idAlumno, idAutorizada, idProfesor]);
    return { success: true, message: 'Retiro registrado correctamente.' };
  }

  async liquidacionesPorProfesor(idProfesor: number) {
    const result = await this.databaseService.query(`SELECT * FROM liquidaciones_por_profesor($1)`, [idProfesor]);
    return result.rows;
  }
}
