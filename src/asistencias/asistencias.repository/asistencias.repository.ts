import { ConflictException, Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class AsistenciasRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async verAsistencias(idAlumno: number) {
    const result = await this.databaseService.query(
      `SELECT * FROM historial_asistencia_alumno($1)`,
      [idAlumno],
    );
    return result.rows;
  }

  async verAsistenciaAlumnoClase(idAlumno: number, idClase: number) {
    const result = await this.databaseService.query(
      `SELECT * FROM asistencia_x_alumno_clase($1, $2)`,
      [idAlumno, idClase],
    );
    return result.rows;
  }

  async buscarAsistencia(idAlumno: number, idClase: number) {
    const result = await this.databaseService.query(
      `SELECT * FROM buscar_asistencia($1, $2)`,
      [idAlumno, idClase],
    );
    return result.rows[0] ?? null;
  }

  async registrarAsistencia(idAlumno: number, idClase: number, estado: string, observaciones = '') {
    try {
      const result = await this.databaseService.query(
        `SELECT registrar_asistencia($1, $2, $3, $4) AS id_asistencia`,
        [idAlumno, idClase, estado, observaciones || null],
      );
      return { success: true, idAsistencia: result.rows[0]?.id_asistencia, message: 'Asistencia registrada correctamente.' };
    } catch (error: any) {
      if (error?.code === '23505' || error?.constraint === 'uq_asistencia_alumno_clase') {
        throw new ConflictException(`Ya existe una asistencia para el alumno ${idAlumno} y la clase ${idClase}.`);
      }
      throw error;
    }
  }

  async registrarAsistenciaConRutinaAnterior(idAlumno: number, idClase: number, estado: string, observaciones = '') {
    // Compatibilidad con el nombre de procedimiento que ya usaba tu repositorio.
    await this.databaseService.query(
      `CALL anotar_asistencia($1, $2, $3, $4)`,
      [idAlumno, idClase, estado, observaciones],
    );
    return { success: true, message: 'Asistencia registrada correctamente.' };
  }

  async eliminarAsistencia(idAlumno: number, idClase: number) {
    await this.databaseService.query(`CALL eliminar_asistencia($1, $2)`, [idAlumno, idClase]);
    return { success: true, message: 'Asistencia eliminada correctamente.' };
  }
}
