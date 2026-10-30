
import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

export interface CrearBoletinData {
    id_alumno: number;
    id_grupo: number;
    id_profesor: number;
    id_periodo: number;
    anio: number;
    fecha_evaluacion?: string;
    observaciones?: string | null;
}

export interface ActualizarBoletinData {
    observaciones?: string | null;
    fecha_evaluacion?: string;
}

export interface FiltrosBoletines {
    id_alumno?: number;
    id_grupo?: number;
    id_profesor?: number;
    id_periodo?: number;
    anio?: number;
}

@Injectable()
export class BoletinesRepository {

    constructor(
        private readonly databaseService: DatabaseService,
    ) {}

    // ========================================================
    // LISTAR TODOS LOS BOLETINES CON FILTROS
    // ========================================================

    async obtenerTodos(filtros: FiltrosBoletines = {}) {

        const {
            id_alumno = null,
            id_grupo = null,
            id_profesor = null,
            id_periodo = null,
            anio = null,
        } = filtros;

        const query = `
            SELECT
                b.id_boletin,

                b.id_alumno,
                ua.nombre AS nombre_alumno,
                ua.apellido AS apellido_alumno,

                b.id_grupo,
                g.nivel,

                d.id_disciplina,
                d.disciplina,

                b.id_profesor,
                up.nombre AS nombre_profesor,
                up.apellido AS apellido_profesor,

                b.id_periodo,
                pe.periodo,

                pe.fecha_inicio,
                pe.fecha_fin,

                b.anio,
                b.fecha_evaluacion,
                b.observaciones

            FROM boletin b

            INNER JOIN alumnos a
                ON a.id_alumno = b.id_alumno

            INNER JOIN users ua
                ON ua.id_usuario = a.id_usuario

            INNER JOIN grupos g
                ON g.id_grupo = b.id_grupo

            INNER JOIN disciplinas d
                ON d.id_disciplina = g.id_disciplina

            INNER JOIN profesores p
                ON p.id_profesor = b.id_profesor

            INNER JOIN users up
                ON up.id_usuario = p.id_usuario

            INNER JOIN periodo_evaluacion pe
                ON pe.id_periodo = b.id_periodo

            WHERE
                ($1::INTEGER IS NULL OR b.id_alumno = $1)
                AND ($2::INTEGER IS NULL OR b.id_grupo = $2)
                AND ($3::INTEGER IS NULL OR b.id_profesor = $3)
                AND ($4::INTEGER IS NULL OR b.id_periodo = $4)
                AND ($5::INTEGER IS NULL OR b.anio = $5)

            ORDER BY
                b.anio DESC,
                pe.fecha_inicio DESC,
                ua.apellido ASC,
                ua.nombre ASC;
        `;

        const result = await this.databaseService.query(query, [
            id_alumno,
            id_grupo,
            id_profesor,
            id_periodo,
            anio,
        ]);

        return result.rows;
    }

    // ========================================================
    // OBTENER BOLETIN POR ID
    // ========================================================

    async obtenerPorId(id_boletin: number) {

        const query = `
            SELECT
                b.id_boletin,

                b.id_alumno,
                ua.nombre AS nombre_alumno,
                ua.apellido AS apellido_alumno,
                ua.dni AS dni_alumno,

                b.id_grupo,
                g.nivel,

                d.id_disciplina,
                d.disciplina,

                b.id_profesor,
                up.nombre AS nombre_profesor,
                up.apellido AS apellido_profesor,

                b.id_periodo,
                pe.periodo,
                pe.fecha_inicio,
                pe.fecha_fin,

                b.anio,
                b.fecha_evaluacion,
                b.observaciones

            FROM boletin b

            INNER JOIN alumnos a
                ON a.id_alumno = b.id_alumno

            INNER JOIN users ua
                ON ua.id_usuario = a.id_usuario

            INNER JOIN grupos g
                ON g.id_grupo = b.id_grupo

            INNER JOIN disciplinas d
                ON d.id_disciplina = g.id_disciplina

            INNER JOIN profesores p
                ON p.id_profesor = b.id_profesor

            INNER JOIN users up
                ON up.id_usuario = p.id_usuario

            INNER JOIN periodo_evaluacion pe
                ON pe.id_periodo = b.id_periodo

            WHERE b.id_boletin = $1;
        `;

        const result = await this.databaseService.query(query, [
            id_boletin,
        ]);

        return result.rows[0] ?? null;
    }

    // ========================================================
    // OBTENER BOLETINES DE UN ALUMNO
    // ========================================================

    async obtenerPorAlumno(id_alumno: number) {

        return this.obtenerTodos({ id_alumno });
    }

    // ========================================================
    // OBTENER BOLETINES DE UN GRUPO
    // ========================================================

    async obtenerPorGrupo(id_grupo: number) {

        return this.obtenerTodos({ id_grupo });
    }

    // ========================================================
    // OBTENER BOLETINES DE UN PROFESOR
    // ========================================================

    async obtenerPorProfesor(id_profesor: number) {

        return this.obtenerTodos({ id_profesor });
    }

    // ========================================================
    // OBTENER BOLETINES POR PERIODO
    // ========================================================

    async obtenerPorPeriodo(id_periodo: number) {

        return this.obtenerTodos({ id_periodo });
    }

    // ========================================================
    // CREAR BOLETIN
    // ========================================================

    async crear(data: CrearBoletinData) {

        const query = `
            INSERT INTO boletin (
                id_alumno,
                id_grupo,
                id_profesor,
                id_periodo,
                anio,
                fecha_evaluacion,
                observaciones
            )

            SELECT
                $1,
                $2,
                $3,
                $4,
                $5,
                COALESCE($6::DATE, CURRENT_DATE),
                $7

            WHERE EXISTS (
                SELECT 1

                FROM inscripcion i

                INNER JOIN grupos g
                    ON g.id_grupo = i.id_grupo

                INNER JOIN periodo_evaluacion pe
                    ON pe.id_periodo = $4

                WHERE i.id_alumno = $1
                  AND i.id_grupo = $2
                  AND i.estado = 'Activo'
                  AND g.id_profesor = $3
                  AND pe.fecha_inicio <= COALESCE($6::DATE, CURRENT_DATE)
                  AND pe.fecha_fin >= COALESCE($6::DATE, CURRENT_DATE)
            )

            RETURNING id_boletin;
        `;

        const result = await this.databaseService.query(query, [
            data.id_alumno,
            data.id_grupo,
            data.id_profesor,
            data.id_periodo,
            data.anio,
            data.fecha_evaluacion ?? null,
            data.observaciones ?? null,
        ]);

        return result.rows[0] ?? null;
    }

    // ========================================================
    // ACTUALIZAR BOLETIN
    // ========================================================

    async actualizar(
        id_boletin: number,
        data: ActualizarBoletinData,
    ) {

        const campos: string[] = [];
        const valores: any[] = [id_boletin];

        if (data.observaciones !== undefined) {
            valores.push(data.observaciones);

            campos.push(
                `observaciones = $${valores.length}`
            );
        }

        if (data.fecha_evaluacion !== undefined) {
            valores.push(data.fecha_evaluacion);

            campos.push(
                `fecha_evaluacion = $${valores.length}`
            );
        }

        if (campos.length === 0) {
            return null;
        }

        const query = `
            UPDATE boletin

            SET ${campos.join(', ')}

            WHERE id_boletin = $1

            RETURNING id_boletin;
        `;

        const result = await this.databaseService.query(
            query,
            valores,
        );

        return result.rows[0] ?? null;
    }

    // ========================================================
    // ELIMINAR BOLETIN
    // ========================================================

    async eliminar(id_boletin: number) {

        const query = `
            DELETE FROM boletin

            WHERE id_boletin = $1

            RETURNING id_boletin;
        `;

        const result = await this.databaseService.query(query, [
            id_boletin,
        ]);

        return result.rows[0] ?? null;
    }

    // ========================================================
    // VERIFICAR EXISTENCIA
    // ========================================================

    async existe(id_boletin: number): Promise<boolean> {

        const query = `
            SELECT EXISTS (
                SELECT 1
                FROM boletin
                WHERE id_boletin = $1
            ) AS existe;
        `;

        const result = await this.databaseService.query(query, [
            id_boletin,
        ]);

        return result.rows[0]?.existe ?? false;
    }

}
