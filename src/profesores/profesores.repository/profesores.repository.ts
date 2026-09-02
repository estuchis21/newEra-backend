import { Injectable } from '@nestjs/common';

import { DatabaseService } from '../../database/database.service';

@Injectable()
export class ProfesoresRepository {

    constructor(
        private readonly databaseService: DatabaseService,
    ) {}

    async obtenerProfesorPorUsuario(
        idUsuario: number
    ) {

        const result =
            await this.databaseService.query(
                `
                SELECT *
                FROM obtener_profesor_por_usuario(
                    $1::integer
                )
                `,
                [idUsuario]
            );

        console.log(
            'PROFESOR POR USUARIO:',
            result.rows
        );

        return result.rows[0] ?? null;
    }
}