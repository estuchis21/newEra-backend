
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { HorariosRepository } from './horarios.repository/horarios.repository';

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
    if (horaInicio >= horaFin) {
      throw new BadRequestException(
        'La hora de inicio debe ser anterior a la hora de fin.',
      );
    }

    return this.horariosRepository.agregarHorarioGrupo(
      idGrupo,
      diaSemana,
      horaInicio,
      horaFin,
    );
  }

  async horariosPorGrupo(idGrupo: number) {
    return this.horariosRepository.horariosPorGrupo(idGrupo);
  }

  async actualizarHorario(
    idHorario: number,
    diaSemana: string,
    horaInicio: string,
    horaFin: string,
  ) {
    if (horaInicio >= horaFin) {
      throw new BadRequestException(
        'La hora de inicio debe ser anterior a la hora de fin.',
      );
    }

    const horario = await this.horariosRepository.actualizarHorario(
      idHorario,
      diaSemana,
      horaInicio,
      horaFin,
    );

    if (!horario) {
      throw new NotFoundException(
        'No se encontró el horario solicitado.',
      );
    }

    return horario;
  }

  async eliminarHorario(idHorario: number) {
    const resultado =
      await this.horariosRepository.eliminarHorario(idHorario);

    if (!resultado.success) {
      throw new NotFoundException(resultado.message);
    }

    return resultado;
  }
}
