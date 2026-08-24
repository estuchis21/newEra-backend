import { Injectable } from '@nestjs/common';
import { AsistenciasRepository } from './asistencias.repository/asistencias.repository';
import { BadRequestException } from '@nestjs/common';

@Injectable()
export class AsistenciasService {
    constructor(
        private readonly asistenciasRepository: AsistenciasRepository,
    ) {}
    async verAsistencias(idAlumno: number) {
        if (!Number.isInteger(idAlumno) || idAlumno <= 0) {
            throw new Error('El ID del alumno no es válido');
        }
        return this.asistenciasRepository.verAsistencias(idAlumno);
    }

    async verAsistenciaAlumnoClase(idAlumno: number, idClase: number) {
        if (!Number.isInteger(idAlumno) || idAlumno <= 0) {
            throw new Error('El ID del alumno no es válido');
        }
        if (!Number.isInteger(idClase) || idClase <= 0) {
            throw new Error('El ID de la clase no es válido');
        }
        return this.asistenciasRepository.verAsistenciaAlumnoClase(idAlumno, idClase);
    }
    async registrarAsistencia(
        idAlumno: number,
        idClase: number,
        estado: string,
        observaciones: string,
    ) {

        return this.asistenciasRepository.registrarAsistencia(
        idAlumno,
        idClase,
        estado,
        observaciones,
        );
    }
}
