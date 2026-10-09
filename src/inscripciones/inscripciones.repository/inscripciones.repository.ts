import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class InscripcionesRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async crearInscripcion(idAlumno: number, idGrupo: number) {
    const result = await this.databaseService.query(`SELECT crear_inscripcion($1, $2) AS id_inscripcion`, [idAlumno, idGrupo]);
    return result.rows[0];
  }

  async eliminarInscripcion(idInscripcion: number) {
    // La rutina SQL de referencia cancela por alumno y grupo, no por id_inscripcion.
    const result = await this.databaseService.query(
      `SELECT id_alumno, id_grupo FROM inscripcion WHERE id_inscripcion = $1`,
      [idInscripcion],
    );
    const row = result.rows[0];
    if (!row) return { success: false, mensaje: 'Inscripción inexistente.' };
    await this.databaseService.query(`CALL cancelar_inscripcion($1, $2)`, [row.id_alumno, row.id_grupo]);
    return { mensaje: 'Inscripción cancelada correctamente.' };
  }

  async cancelarInscripcion(idAlumno: number, idGrupo: number) {
    await this.databaseService.query(`CALL cancelar_inscripcion($1, $2)`, [idAlumno, idGrupo]);
    return { success: true };
  }

  async obtenerInscripcionesPorAlumno(idAlumno: number) {
    const result = await this.databaseService.query(`SELECT * FROM inscripciones_por_alumno($1)`, [idAlumno]);
    return result.rows;
  }
}
