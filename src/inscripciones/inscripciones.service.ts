import { Injectable } from '@nestjs/common';
import { InscripcionesRepository } from './inscripciones.repository/inscripciones.repository';

@Injectable()
export class InscripcionesService {

    constructor(
        private readonly inscripcionesRepository: InscripcionesRepository,
    ) {}

    async crearInscripcion(
        idAlumno: number,
        idGrupo: number,
    ) {
        return await this.inscripcionesRepository.crearInscripcion(
            idAlumno,
            idGrupo,
        );
    }

    async eliminarInscripcion(idInscripcion: number) {
        return await this.inscripcionesRepository.eliminarInscripcion(
            idInscripcion
        );
    }

    async obtenerInscripcionesPorAlumno(
        idAlumno: number,
    ) {
        return await this.inscripcionesRepository.obtenerInscripcionesPorAlumno(
            idAlumno,
        );
    }
}