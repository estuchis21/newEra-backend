import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class HorariosRepository {

    constructor(
        private readonly databaseService: DatabaseService,
    ) {}

    async agregarHorarioGrupo(
        idGrupo: number,
        diaSemana: string,
        horaInicio: string,
        horaFin: string,
    ) {
        await this.databaseService.query(
            `
            CALL agregar_horario_grupo($1, $2, $3, $4);
            `,
            [
                idGrupo,
                diaSemana,
                horaInicio,
                horaFin,
            ],
        );

        return {
            mensaje: 'Horario agregado correctamente',
        };
    }
}