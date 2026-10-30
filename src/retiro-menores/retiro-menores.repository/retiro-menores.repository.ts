
import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

export interface CrearPersonaAutorizada {
    id_alumno: number;
    nombre: string;
    apellido: string;
    dni: string;
    parentesco?: string;
    telefono?: string;
}

export interface ActualizarPersonaAutorizada {
    nombre?: string;
    apellido?: string;
    dni?: string;
    parentesco?: string;
    telefono?: string;
}

export interface RegistrarRetiro {
    id_alumno: number;
    id_autorizada: number;
    id_profesor: number;
    observaciones?: string;
}

@Injectable()
export class RetiroMenoresRepository {

    constructor(
        private readonly databaseService: DatabaseService,
    ) {}

    // ========================================================
    // REGISTRAR PERSONA AUTORIZADA
    // ========================================================

    async crearPersonaAutorizada(data: CrearPersonaAutorizada) {

        const query = `
            INSERT INTO persona_autorizada (
                id_alumno,
                nombre,
                apellido,
                dni,
                parentesco,
                telefono
            )

            SELECT
                $1, $2, $3, $4, $5, $6

            WHERE EXISTS (
                SELECT 1
                FROM alumnos
                WHERE id_alumno = $1
                  AND es_menor = TRUE
            )

            RETURNING *;
        `;

        const result = await this.databaseService.query(query, [
            data.id_alumno,
            data.nombre,
            data.apellido,
            data.dni,
            data.parentesco ?? null,
            data.telefono ?? null,
        ]);

        return result.rows[0] ?? null;
    }

    // ========================================================
    // LISTAR PERSONAS AUTORIZADAS DE UN ALUMNO
    // ========================================================

    async obtenerPersonasAutorizadas(id_alumno: number) {

        const query = `
            SELECT
                pa.id_autorizada,
                pa.id_alumno,
                pa.nombre,
                pa.apellido,
                pa.dni,
                pa.parentesco,
                pa.telefono,
                pa.activo

            FROM persona_autorizada pa

            WHERE pa.id_alumno = $1

            ORDER BY
                pa.activo DESC,
                pa.apellido ASC,
                pa.nombre ASC;
        `;

        const result = await this.databaseService.query(query, [
            id_alumno,
        ]);

        return result.rows;
    }

    // ========================================================
    // OBTENER PERSONA AUTORIZADA POR ID
    // ========================================================

    async obtenerPersonaAutorizada(id_autorizada: number) {

        const query = `
            SELECT
                pa.*,
                u.nombre AS nombre_alumno,
                u.apellido AS apellido_alumno

            FROM persona_autorizada pa

            INNER JOIN alumnos a
                ON a.id_alumno = pa.id_alumno

            INNER JOIN users u
                ON u.id_usuario = a.id_usuario

            WHERE pa.id_autorizada = $1;
        `;

        const result = await this.databaseService.query(query, [
            id_autorizada,
        ]);

        return result.rows[0] ?? null;
    }

    // ========================================================
    // ACTUALIZAR PERSONA AUTORIZADA
    // ========================================================

    async actualizarPersonaAutorizada(
        id_autorizada: number,
        data: ActualizarPersonaAutorizada,
    ) {

        const campos: string[] = [];
        const valores: any[] = [id_autorizada];

        const propiedades = [
            'nombre',
            'apellido',
            'dni',
            'parentesco',
            'telefono',
        ] as const;

        for (const propiedad of propiedades) {

            if (data[propiedad] !== undefined) {

                valores.push(data[propiedad]);

                campos.push(
                    `${propiedad} = $${valores.length}`,
                );
            }
        }

        if (campos.length === 0) {
            return null;
        }

        const query = `
            UPDATE persona_autorizada

            SET ${campos.join(', ')}

            WHERE id_autorizada = $1
              AND activo = TRUE

            RETURNING *;
        `;

        const result = await this.databaseService.query(
            query,
            valores,
        );

        return result.rows[0] ?? null;
    }

    // ========================================================
    // DESACTIVAR AUTORIZACION
    // ========================================================

    async desactivarPersonaAutorizada(id_autorizada: number) {

        const query = `
            UPDATE persona_autorizada

            SET activo = FALSE

            WHERE id_autorizada = $1
              AND activo = TRUE

            RETURNING id_autorizada;
        `;

        const result = await this.databaseService.query(query, [
            id_autorizada,
        ]);

        return result.rows[0] ?? null;
    }

    // ========================================================
    // REGISTRAR RETIRO DE MENOR
    // ========================================================

    async registrarRetiro(data: RegistrarRetiro) {

        const query = `
            INSERT INTO retiro_menor (
                id_alumno,
                id_autorizada,
                id_profesor,
                nombre_autorizado_snapshot,
                apellido_autorizado_snapshot,
                dni_autorizado_snapshot,
                parentesco_snapshot,
                observaciones
            )

            SELECT
                a.id_alumno,
                pa.id_autorizada,
                p.id_profesor,
                pa.nombre,
                pa.apellido,
                pa.dni,
                pa.parentesco,
                $4

            FROM alumnos a

            INNER JOIN persona_autorizada pa
                ON pa.id_alumno = a.id_alumno

            INNER JOIN profesores p
                ON p.id_profesor = $3

            WHERE a.id_alumno = $1
              AND a.es_menor = TRUE
              AND pa.id_autorizada = $2
              AND pa.activo = TRUE

              AND EXISTS (
                  SELECT 1

                  FROM inscripcion i

                  INNER JOIN grupos g
                      ON g.id_grupo = i.id_grupo

                  WHERE i.id_alumno = a.id_alumno
                    AND i.estado = 'Activo'
                    AND g.id_profesor = p.id_profesor
              )

            RETURNING id_retiro;
        `;

        const result = await this.databaseService.query(query, [
            data.id_alumno,
            data.id_autorizada,
            data.id_profesor,
            data.observaciones ?? null,
        ]);

        return result.rows[0] ?? null;
    }

    // ========================================================
    // OBTENER RETIRO POR ID
    // ========================================================

    async obtenerRetiroPorId(id_retiro: number) {

        const query = `
            SELECT
                r.id_retiro,

                r.fecha_hora,

                r.observaciones,

                r.id_alumno,

                ua.nombre AS nombre_alumno,
                ua.apellido AS apellido_alumno,
                ua.dni AS dni_alumno,

                a.es_menor,

                r.id_autorizada,

                r.nombre_autorizado_snapshot AS nombre_autorizado,
                r.apellido_autorizado_snapshot AS apellido_autorizado,
                r.dni_autorizado_snapshot AS dni_autorizado,
                r.parentesco_snapshot AS parentesco,

                r.id_profesor,

                up.nombre AS nombre_profesor,
                up.apellido AS apellido_profesor

            FROM retiro_menor r

            INNER JOIN alumnos a
                ON a.id_alumno = r.id_alumno

            INNER JOIN users ua
                ON ua.id_usuario = a.id_usuario

            INNER JOIN profesores p
                ON p.id_profesor = r.id_profesor

            INNER JOIN users up
                ON up.id_usuario = p.id_usuario

            WHERE r.id_retiro = $1;
        `;

        const result = await this.databaseService.query(query, [
            id_retiro,
        ]);

        return result.rows[0] ?? null;
    }

    // ========================================================
    // HISTORIAL DE RETIROS
    // ========================================================

    async obtenerHistorial(
        id_alumno?: number,
        id_profesor?: number,
    ) {

        const query = `
            SELECT
                r.id_retiro,
                r.fecha_hora,

                r.id_alumno,
                ua.nombre AS nombre_alumno,
                ua.apellido AS apellido_alumno,

                r.nombre_autorizado_snapshot AS nombre_autorizado,
                r.apellido_autorizado_snapshot AS apellido_autorizado,
                r.dni_autorizado_snapshot AS dni_autorizado,
                r.parentesco_snapshot AS parentesco,

                r.id_profesor,
                up.nombre AS nombre_profesor,
                up.apellido AS apellido_profesor,

                r.observaciones

            FROM retiro_menor r

            INNER JOIN alumnos a
                ON a.id_alumno = r.id_alumno

            INNER JOIN users ua
                ON ua.id_usuario = a.id_usuario

            INNER JOIN profesores p
                ON p.id_profesor = r.id_profesor

            INNER JOIN users up
                ON up.id_usuario = p.id_usuario

            WHERE
                ($1::INTEGER IS NULL OR r.id_alumno = $1)

                AND

                ($2::INTEGER IS NULL OR r.id_profesor = $2)

            ORDER BY r.fecha_hora DESC;
        `;

        const result = await this.databaseService.query(query, [
            id_alumno ?? null,
            id_profesor ?? null,
        ]);

        return result.rows;
    }

}
