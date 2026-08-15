import { Injectable } from '@nestjs/common';
import {DatabaseService} from '../../database/database.service';

@Injectable()
export class AsistenciasRepository {
    constructor(
        private readonly databaseService: DatabaseService,
    ) {}

    async verAsistencias(idAlumno: number) {
        const result = await this.databaseService.query(
            `
            SELECT * FROM obtener_asistencia_alumno($1) as asistencia
            `,
            [idAlumno],
        );

        return result;
    }

    async verAsistenciaAlumnoClase (idAlumno: number, idClase: number) {
        const result = await this.databaseService.query(
            `
            SELECT * FROM asistencia_x_alumno_clase($1, $2) as asistencia
            `,
            [idAlumno, idClase],
        );

        return result;
    }

    async registrarAsistencia(
        idAlumno: number,
        idClase: number,
        estado: string,
        observaciones: string,
    ) {
        await this.databaseService.query(
            `
            CALL AnotarAsistencia($1, $2, $3, $4)
            `,
            [idAlumno, idClase, estado, observaciones],
        );
    }
}
