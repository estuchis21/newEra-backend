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
        `SELECT * FROM clases_por_alumno($1::integer)`,
        [id_alumno]
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
    async gruposPorProfesor(idProfesor: number) {
        const result = await this.databaseService.query(
            `
            SELECT *
            FROM obtener_grupos_profesor($1)
            `,
            [idProfesor],
        );
 
        return result.rows;
    }
    async clasesPorProfesor(idProfesor: number, fecha: string | null) {
        const result = await this.databaseService.query(
            `
            SELECT *
            FROM clases_por_profesor($1, $2)
            `,
            [idProfesor, fecha],
        );
 
        return result.rows;
    }
    async alumnosPorClase(idClase: number) {
        const result = await this.databaseService.query(
            `
            SELECT *
            FROM alumnos_por_clase($1)
            `,
            [idClase],
        );
 
        return result.rows;
    }
    async registrarRetiro(
        idAlumno: number,
        idAutorizada: number,
        idProfesor: number,
    ) {
        const result = await this.databaseService.query(
            `
            CALL registrar_retiro($1, $2, $3)
            `,
            [
                idAlumno,
                idAutorizada,
                idProfesor,
            ],
        );
 
        return result;
    }
       async liquidacionesPorProfesor(idProfesor: number) {
        const result = await this.databaseService.query(
            `
            SELECT *
            FROM liquidaciones_por_profesor($1)
            `,
            [idProfesor],
        );
 
        return result.rows;
    }
}