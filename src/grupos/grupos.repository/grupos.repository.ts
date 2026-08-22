import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class GruposRepository {

    constructor(
        private readonly databaseService: DatabaseService,
    ) {}

    async crearGrupo(
        idDisciplina: number,
        idProfesor: number,
        nivel: string,
        cupoMax: number,
    ) {
        const result = await this.databaseService.query(
            `
            CALL crear_grupo($1, $2, $3, $4)
            `,
            [
                idDisciplina,
                idProfesor,
                nivel,
                cupoMax,
            ],
        );

        return result;
    }

    async obtenerGrupos(id_alumno: number) {
        const result = await this.databaseService.query(
            `
            SELECT clases_por_alumnos($1) AS clases
            `,
            [id_alumno],
        );

        return result.rows[0]?.clases ?? [];
    }

    async todasLasClases() {
        const result = await this.databaseService.query(
            `
            SELECT *
            FROM todas_las_clases()
            `,
        );

        return result.rows;
    }

    async clasePorId(id_clase: number) {
        const result = await this.databaseService.query(
            `
            SELECT *
            FROM buscar_clase_por_id($1)
            `,
            [id_clase],
        );

        return result.rows[0] ?? null;
    }

    async gruposDisponibles() {
        const result = await this.databaseService.query(
            `
            SELECT *
            FROM grupos_disponibles()
            `,
        );

        return result.rows;
    }
}