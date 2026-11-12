
import {
    Injectable,
    NotFoundException,
    ConflictException,
} from '@nestjs/common';

import { DatabaseService } from '../database/database.service';
import { InscripcionesRepository } from './inscripciones.repository/inscripciones.repository';
import { CuotasRepository } from '../cuotas/cuotas.repository/cuotas.repository';

@Injectable()
export class InscripcionesService {
    constructor(
        private readonly databaseService: DatabaseService,
        private readonly inscripcionesRepository: InscripcionesRepository,
        private readonly cuotasRepository: CuotasRepository,
    ) {}

    async crearInscripcion(
        idAlumno: number,
        idGrupo: number,
    ) {
        return this.databaseService.transaction(async (client) => {
            const alumno = await client.query(
                `
                SELECT id_alumno
                FROM public.alumnos
                WHERE id_alumno = $1
                `,
                [idAlumno],
            );

            if (alumno.rows.length === 0) {
                throw new NotFoundException(
                    `No existe el alumno con ID ${idAlumno}.`,
                );
            }

            const grupo = await client.query(
                `
                SELECT id_grupo, activo
                FROM public.grupos
                WHERE id_grupo = $1
                FOR UPDATE
                `,
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

            const existente = await client.query(
                `
                SELECT id_inscripcion
                FROM public.inscripcion
                WHERE id_alumno = $1
                  AND id_grupo = $2
                  AND estado = 'Activo'
                `,
                [idAlumno, idGrupo],
            );

            if (existente.rows.length > 0) {
                throw new ConflictException(
                    'El alumno ya está inscripto en este grupo.',
                );
            }

            const resultado =
                await this.inscripcionesRepository.crearInscripcion(
                    client,
                    idAlumno,
                    idGrupo,
                );

            await this.cuotasRepository.recalcularCuotaMes(
                client,
                idAlumno,
            );

            return resultado;
        });
    }

    async eliminarInscripcion(idInscripcion: number) {
        return this.databaseService.transaction(async (client) => {
            const result = await client.query(
                `
                SELECT id_alumno, id_grupo
                FROM public.inscripcion
                WHERE id_inscripcion = $1
                FOR UPDATE
                `,
                [idInscripcion],
            );

            const row = result.rows[0];

            if (!row) {
                throw new NotFoundException(
                    'La inscripción no existe.',
                );
            }

            const resultado =
                await this.inscripcionesRepository.eliminarInscripcion(
                    client,
                    idInscripcion,
                    row.id_alumno,
                    row.id_grupo,
                );

            await this.cuotasRepository.recalcularCuotaMes(
                client,
                row.id_alumno,
            );

            return resultado;
        });
    }

    async cancelarInscripcion(
        idAlumno: number,
        idGrupo: number,
    ) {
        return this.databaseService.transaction(async (client) => {
            const resultado =
                await this.inscripcionesRepository.cancelarInscripcion(
                    client,
                    idAlumno,
                    idGrupo,
                );

            await this.cuotasRepository.recalcularCuotaMes(
                client,
                idAlumno,
            );

            return resultado;
        });
    }

    async obtenerInscripcionesPorAlumno(idAlumno: number) {
        return this.inscripcionesRepository
            .obtenerInscripcionesPorAlumno(idAlumno);
    }
}
