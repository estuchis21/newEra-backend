
import {
  Injectable,
  BadRequestException,
} from '@nestjs/common';

import { AsistenciasRepository } from
  './asistencias.repository/asistencias.repository';

@Injectable()
export class AsistenciasService {
  constructor(
    private readonly asistenciasRepository: AsistenciasRepository,
  ) {}

  async verAsistencias(idAlumno: number) {
    this.validarId(idAlumno, 'id_alumno');

    return this.asistenciasRepository.verAsistencias(idAlumno);
  }

  async verAsistenciaAlumnoClase(
    idAlumno: number,
    idClase: number,
  ) {
    this.validarId(idAlumno, 'id_alumno');
    this.validarId(idClase, 'id_clase');

    return this.asistenciasRepository.verAsistenciaAlumnoClase(
      idAlumno,
      idClase,
    );
  }

  async registrarAsistencia(
    idAlumno: number,
    idClase: number,
    estado: string,
    observaciones: string,
  ) {
    this.validarId(idAlumno, 'id_alumno');
    this.validarId(idClase, 'id_clase');

    if (!['presente', 'ausente'].includes(estado)) {
      throw new BadRequestException(
        'El estado debe ser "presente" o "ausente".',
      );
    }

    return this.asistenciasRepository.registrarAsistencia(
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
    this.validarId(idGrupo, 'id_grupo');
    this.validarId(idProfesor, 'id_profesor');

    return this.asistenciasRepository.obtenerAsistenciasPorGrupoYProfesor(
      idGrupo,
      idProfesor,
    );
  }

  async obtenerAsistenciasPorClase(idClase: number) {
    this.validarId(idClase, 'id_clase');

    return this.asistenciasRepository.obtenerAsistenciasPorClase(
      idClase,
    );
  }

  private validarId(id: number, campo: string): void {
    if (!Number.isInteger(id) || id <= 0) {
      throw new BadRequestException(
        `${campo} debe ser un número entero mayor que 0.`,
      );
    }
  }
}
