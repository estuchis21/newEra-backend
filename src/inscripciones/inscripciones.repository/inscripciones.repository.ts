import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class InscripcionesRepository {

    constructor(
        private readonly databaseService: DatabaseService,
    ) {}

    async crearInscripcion(
        idAlumno: number,
        idGrupo: number,
    ) {
        const result = await this.databaseService.query(
            `
            CALL crear_inscripcion($1, $2)
            `,
            [
                idAlumno,
                idGrupo,
            ],
        );

        return result;
    }

    async obtenerInscripcionesPorAlumno(
        idAlumno: number,
    ) {
        const result = await this.databaseService.query(
            `
            SELECT *
            FROM inscripciones_por_alumno($1)
            `,
            [idAlumno],
        );

        return result.rows;
    }
}