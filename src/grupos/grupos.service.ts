import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';

import { GruposRepository } from '../grupos/grupos.repository/grupos.repository';
import { Grupos_Alumnos } from '../grupos/dto/grupos.dto';

@Injectable()
export class GruposService {
  constructor(
    private readonly gruposRepository: GruposRepository,
  ) {}

  async crearGrupo(dto: Grupos_Alumnos) {
    if (dto.cupo_max <= 0) {
      throw new ConflictException(
        'El cupo debe ser mayor a 0',
      );
    }

    if (!dto.horarios || dto.horarios.length === 0) {
      throw new ConflictException(
        'El grupo debe tener al menos un horario.',
      );
    }

    const dias: Record<string, string> = {
      lunes: 'Lunes',
      martes: 'Martes',
      miércoles: 'Miércoles',
      miercoles: 'Miércoles',
      jueves: 'Jueves',
      viernes: 'Viernes',
      sábado: 'Sábado',
      sabado: 'Sábado',
      domingo: 'Domingo',
    };

    const horariosNormalizados = dto.horarios.map((horario) => {
      const dia = dias[horario.dia_semana.toLowerCase()];

      if (!dia) {
        throw new ConflictException(
          `Día de la semana no válido: ${horario.dia_semana}`,
        );
      }

      if (horario.hora_inicio >= horario.hora_fin) {
        throw new ConflictException(
          `La hora de inicio debe ser anterior a la hora de fin (${dia}).`,
        );
      }

      return {
        dia_semana: dia,
        hora_inicio: horario.hora_inicio,
        hora_fin: horario.hora_fin,
      };
    });

    try {
      const grupo = await this.gruposRepository.crearGrupo(
        dto.id_disciplina,
        dto.id_profesor,
        dto.nivel,
        dto.cupo_max,
        horariosNormalizados,
      );

      return {
        message: 'Grupo creado correctamente',
        id_grupo: grupo.id_grupo,
        horarios_guardados: grupo.horarios_guardados,
      };
    } catch (error: any) {
      if (error.code === '23505') {
        throw new ConflictException(
          'No se puede crear el grupo: ya existe un grupo con esa disciplina, profesor y nivel.',
        );
      }

      if (error.code === '23503') {
        throw new ConflictException(
          'No se puede crear el grupo porque la disciplina o el profesor indicado no existe.',
        );
      }

      console.error('Error creando grupo:', error);

      throw new ConflictException(
        'Error creando grupo. No se guardaron los datos.',
      );
    }
  }

  async obtenerGrupos(id_alumno: number) {
    const clases = await this.gruposRepository.obtenerGruposPorAlumno(
      id_alumno,
    );

    if (clases.length === 0) {
      throw new NotFoundException(
        'No se encontraron clases para el alumno',
      );
    }

    return clases;
  }

  async todasLasClases() {
    const clases = await this.gruposRepository.todasLasClases();

    if (clases.length === 0) {
      throw new NotFoundException(
        'No existen clases registradas',
      );
    }

    return clases;
  }

  async clasePorId(id_clase: number) {
    const clase = await this.gruposRepository.clasePorId(
      id_clase,
    );

    if (!clase) {
      throw new NotFoundException(
        'No se encontró la clase',
      );
    }

    return clase;
  }

  async gruposDisponibles() {
    return this.gruposRepository.gruposDisponibles();
  }

  async gruposPorProfesor(idProfesor: number) {
    const grupos = await this.gruposRepository.gruposPorProfesor(
      idProfesor,
    );

    if (grupos.length === 0) {
      throw new NotFoundException(
        'El profesor no tiene grupos asignados',
      );
    }

    return grupos;
  }

  async clasesPorProfesor(
    idProfesor: number,
    fecha: string | null,
  ) {
    return this.gruposRepository.clasesPorProfesor(
      idProfesor,
      fecha,
    );
  }

  async alumnosPorClase(idClase: number) {
    const alumnos = await this.gruposRepository.alumnosPorClase(
      idClase,
    );

    if (alumnos.length === 0) {
      throw new NotFoundException(
        'No hay alumnos en esta clase',
      );
    }

    return alumnos;
  }

  async liquidacionesPorProfesor(idProfesor: number) {
    return this.gruposRepository.liquidacionesPorProfesor(
      idProfesor,
    );
  }

  async alumnosPorGrupo(idGrupo: number) {
    return this.gruposRepository.alumnosPorGrupo(idGrupo);
  }
}