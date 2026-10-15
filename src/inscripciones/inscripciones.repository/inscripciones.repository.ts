import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class InscripcionesRepository {
  constructor(
    private readonly databaseService: DatabaseService,
  ) {}

  async crearInscripcion(idAlumno: number, idGrupo: number) {
    await this.databaseService.query(
      `CALL public.crear_inscripcion($1, $2)`,
      [idAlumno, idGrupo],
    );

    return {
      success: true,
      mensaje: 'Inscripción creada correctamente.',
    };
  }

  async eliminarInscripcion(idInscripcion: number) {
    const result = await this.databaseService.query(
      `SELECT id_alumno, id_grupo
       FROM public.inscripcion
       WHERE id_inscripcion = $1`,
      [idInscripcion],
    );

    const row = result.rows[0];

    if (!row) {
      return {
        success: false,
        mensaje: 'Inscripción inexistente.',
      };
    }

    await this.databaseService.query(
      `CALL public.cancelar_inscripcion($1, $2)`,
      [row.id_alumno, row.id_grupo],
    );

    return {
      success: true,
      mensaje: 'Inscripción cancelada correctamente.',
    };
  }

  async cancelarInscripcion(idAlumno: number, idGrupo: number) {
    await this.databaseService.query(
      `CALL public.cancelar_inscripcion($1, $2)`,
      [idAlumno, idGrupo],
    );

    return { success: true };
  }

  async obtenerInscripcionesPorAlumno(idAlumno: number) {
    const result = await this.databaseService.query(
      `SELECT *
       FROM public.inscripciones_por_alumno($1)`,
      [idAlumno],
    );

    return result.rows;
  }
}