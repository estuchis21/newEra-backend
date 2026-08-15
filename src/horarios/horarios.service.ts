import { ConflictException, Injectable } from '@nestjs/common';
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

        try{
            return await this.horariosRepository.agregarHorarioGrupo(
                idGrupo,
                diaSemana,
                horaInicio,
                horaFin,
            );
        }
        catch (error: any) {
            if (error.code === '23503') {
                throw new ConflictException('El ID del grupo no existe');
            }
            if (error.code === '23514') {
                throw new ConflictException('El horario no es válido');
            }
            if (error.code === '23505') {
                throw new ConflictException('Ya existe un horario para ese grupo en ese día y hora');
            }
            throw new ConflictException('Error agregando horario al grupo');
        }
    }
}