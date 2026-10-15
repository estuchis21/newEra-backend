import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';

import { DatabaseService } from '../database/database.service';
import { InscripcionesRepository } from './inscripciones.repository/inscripciones.repository';

@Injectable()
export class InscripcionesService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly inscripcionesRepository: InscripcionesRepository,
  ) {}

  async crearInscripcion(idAlumno: number, idGrupo: number) {
    const alumno = await this.databaseService.query(
      `SELECT id_alumno
       FROM public.alumnos
       WHERE id_alumno = $1`,
      [idAlumno],
    );

    if (alumno.rows.length === 0) {
      throw new NotFoundException(
        `No existe el alumno con ID ${idAlumno}.`,
      );
    }

    const grupo = await this.databaseService.query(
      `SELECT id_grupo, activo
       FROM public.grupos
       WHERE id_grupo = $1`,
      [idGrupo],
    );

    if (grupo.rows.length === 0) {
      throw new NotFoundException(
        `No existe el grupo con ID ${idGrupo}.`,
      );
    }

    if (!grupo.rows[0].activo) {
      throw new ConflictException(
        'No se puede inscribir a un grupo inactivo.',
      );
    }

    const existente = await this.databaseService.query(
      `SELECT id_inscripcion
       FROM public.inscripcion
       WHERE id_alumno = $1
         AND id_grupo = $2
         AND estado = 'Activo'`,
      [idAlumno, idGrupo],
    );

    if (existente.rows.length > 0) {
      throw new ConflictException(
        'El alumno ya está inscripto en este grupo.',
      );
    }

    return this.inscripcionesRepository.crearInscripcion(
      idAlumno,
      idGrupo,
    );
  }

  async eliminarInscripcion(idInscripcion: number) {
    return this.inscripcionesRepository.eliminarInscripcion(
      idInscripcion,
    );
  }

  async cancelarInscripcion(idAlumno: number, idGrupo: number) {
    return this.inscripcionesRepository.cancelarInscripcion(
      idAlumno,
      idGrupo,
    );
  }

  async obtenerInscripcionesPorAlumno(idAlumno: number) {
    return this.inscripcionesRepository.obtenerInscripcionesPorAlumno(
      idAlumno,
    );
  }
}
