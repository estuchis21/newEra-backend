
import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
;
import { HorariosRepository } from './horarios.repository/horarios.repository';
import { Grupos_Alumnos } from './dto/grupos-alumnos.dto';
import { GruposRepository } from '../grupos/grupos.repository/grupos.repository';

@Injectable()
export class GruposService {
  constructor(
    private readonly gruposRepository: GruposRepository,
    private readonly horariosRepository: HorariosRepository,
  ) {}

  async crearGrupo(dto: Grupos_Alumnos) {
    if (dto.cupo_max <= 0) {
      throw new BadRequestException(
        'El cupo máximo debe ser mayor que cero.',
      );
    }

    if (!dto.horarios || dto.horarios.length === 0) {
      throw new BadRequestException(
        'Debés ingresar al menos un horario para el grupo.',
      );
    }

    for (const horario of dto.horarios) {
      if (horario.hora_inicio >= horario.hora_fin) {
        throw new BadRequestException(
          `La hora de inicio debe ser anterior a la hora de fin (${horario.dia_semana}).`,
        );
      }
    }

    try {
      // El repositorio debe devolver el ID del grupo recién creado.
      const grupo = await this.gruposRepository.crearGrupo(
        dto.id_disciplina,
        dto.id_profesor,
        dto.nivel,
        dto.cupo_max,
      );

      const idGrupo = Number(grupo.id_grupo);

      if (!Number.isInteger(idGrupo) || idGrupo <= 0) {
        throw new InternalServerErrorException(
          'No se pudo obtener el ID del grupo creado.',
        );
      }

      // Guardar todos los horarios asociados al grupo.
      const horariosGuardados = [];

      for (const horario of dto.horarios) {
        const resultado =
          await this.horariosRepository.agregarHorarioGrupo(
            idGrupo,
            horario.dia_semana,
            horario.hora_inicio,
            horario.hora_fin,
          );

        horariosGuardados.push(resultado);
      }

      return {
        success: true,
        mensaje: 'Grupo y horarios creados correctamente.',
        id_grupo: idGrupo,
        horarios: horariosGuardados,
      };
    } catch (error: any) {
      if (
        error instanceof BadRequestException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }

      throw new InternalServerErrorException({
        mensaje: 'Ocurrió un error al crear el grupo y sus horarios.',
        detalle: error.message,
      });
    }
  }
}
