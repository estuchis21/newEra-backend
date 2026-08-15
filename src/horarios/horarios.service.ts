import { Injectable } from '@nestjs/common';
import { HorariosRepository } from '../horarios/horarios.repository/horarios.repository';

@Injectable()
export class HorariosService {

    constructor(
        private readonly horariosRepository: HorariosRepository,
    ) {}

    async agregarHorarioGrupo(
        idGrupo: number,
        diaSemana: string,
        horaInicio: string,
        horaFin: string,
    ) {

        if (!Number.isInteger(idGrupo) || idGrupo <= 0) {
            throw new Error('El ID del grupo no es válido');
        }

        if (!diaSemana) {
            throw new Error('El día de la semana es obligatorio');
        }

        if (!horaInicio || !horaFin) {
            throw new Error('La hora de inicio y finalización son obligatorias');
        }

        return this.horariosRepository.agregarHorarioGrupo(
            idGrupo,
            diaSemana,
            horaInicio,
            horaFin,
        );
    }
}