
import { Injectable } from '@nestjs/common';
import { PoolClient } from 'pg';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class InscripcionesRepository {
  constructor(
    private readonly databaseService: DatabaseService,
  ) {}

  async crearInscripcion(
    client: PoolClient,
    idAlumno: number,
    idGrupo: number,
  ) {
    await client.query(
      `CALL public.crear_inscripcion($1, $2)`,
      [idAlumno, idGrupo],
    );

    return {
      success: true,
      mensaje: 'Inscripción creada correctamente.',
    };
  }

  async eliminarInscripcion(
    client: PoolClient,
    idInscripcion: number,
    idAlumno: number,
    idGrupo: number,
  ) {
    await client.query(
      `SELECT public.cancelar_inscripcion($1, $2)`,
      [idAlumno, idGrupo],
    );

    return {
      success: true,
      mensaje: 'Inscripción cancelada correctamente.',
    };
  }

  async cancelarInscripcion(
    client: PoolClient,
    idAlumno: number,
    idGrupo: number,
  ) {
    await client.query(
      `SELECT public.cancelar_inscripcion($1, $2)`,
      [idAlumno, idGrupo],
    );

    return {
      success: true,
      mensaje: 'Inscripción cancelada correctamente.',
    };
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
