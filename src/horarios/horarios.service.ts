import {
    ConflictException,
    Injectable,
    BadRequestException,
} from '@nestjs/common';

import { HorariosRepository } from './horarios.repository/horarios.repository';

@Injectable()
export class HorariosService {

    constructor(
        private readonly horariosRepository: HorariosRepository,
    ) {}

    // Crear un horario para un grupo
    async agregarHorarioGrupo(
        idGrupo: number,
        diaSemana: string,
        horaInicio: string,
        horaFin: string,
    ) {
        const grupoId = Number(idGrupo);

        if (!Number.isInteger(grupoId) || grupoId <= 0) {
            throw new BadRequestException(
                'El ID del grupo no es válido',
            );
        }

        if (!diaSemana) {
            throw new BadRequestException(
                'El día de la semana es obligatorio',
            );
        }

        if (!horaInicio || !horaFin) {
            throw new BadRequestException(
                'La hora de inicio y finalización son obligatorias',
            );
        }

        try {
            return await this.horariosRepository.agregarHorarioGrupo(
                grupoId,
                diaSemana,
                horaInicio,
                horaFin,
            );
        } catch (error: any) {
            console.error('ERROR POSTGRES:', error);

            if (error.code === '23503') {
                throw new ConflictException(
                    'El ID del grupo no existe',
                );
            }

            if (error.code === '23514') {
                throw new ConflictException(
                    'El horario no es válido',
                );
            }

            if (error.code === '23505') {
                throw new ConflictException(
                    'Ya existe un horario para ese grupo en ese día y hora',
                );
            }

            throw new ConflictException(
                'Error agregando horario al grupo',
            );
        }
    }

    // Consultar los horarios de un grupo
    async obtenerHorariosPorGrupo(idGrupo: number) {
        const grupoId = Number(idGrupo);

        if (!Number.isInteger(grupoId) || grupoId <= 0) {
            throw new BadRequestException(
                'El ID del grupo no es válido',
            );
        }

        return this.horariosRepository.horariosPorGrupo(
            grupoId,
        );
    }
}