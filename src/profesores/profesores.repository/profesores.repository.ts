import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class ProfesoresRepository {
    constructor(
        private readonly databaseService: DatabaseService,
    ) {}

    async obtenerProfesorPorUsuario(idUsuario: number) {
        const result = await this.databaseService.query(
            `
            SELECT *
            FROM obtener_profesor_por_usuario($1::integer)
            `,
            [idUsuario],
        );

        return result.rows[0] ?? null;
    }

    async obtenerAliasMP(idUsuario: number) {
        const result = await this.databaseService.query(
            `
            SELECT c.alias_mp
            FROM public.profesores p
            LEFT JOIN public.profesor_cuenta_mp c
                ON c.id_profesor = p.id_profesor
            WHERE p.id_usuario = $1
            `,
            [idUsuario],
        );

        return result.rows[0] ?? null;
    }

    async guardarAliasMP(idUsuario: number, aliasMP: string) {
        const result = await this.databaseService.query(
            `
            INSERT INTO public.profesor_cuenta_mp (
                id_profesor,
                alias_mp,
                activo,
                fecha_actualizacion
            )
            SELECT
                p.id_profesor,
                $2,
                TRUE,
                NOW()
            FROM public.profesores p
            WHERE p.id_usuario = $1

            ON CONFLICT (id_profesor)
            DO UPDATE SET
                alias_mp = EXCLUDED.alias_mp,
                activo = TRUE,
                fecha_actualizacion = NOW()

            RETURNING alias_mp
            `,
            [idUsuario, aliasMP],
        );

        return result.rows[0] ?? null;
    }
}