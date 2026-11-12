import {
  IsArray,
  IsString,
  IsNotEmpty,
  IsIn,
  Matches,
  ValidateNested,
  IsInt,
  Min,
  ArrayMinSize,
} from 'class-validator';

import { Type } from 'class-transformer';

export class HorarioGrupoDto {
  @IsString()
  @IsNotEmpty()
  @IsIn([
    'lunes',
    'martes',
    'miércoles',
    'miercoles',
    'jueves',
    'viernes',
    'sábado',
    'sabado',
    'domingo',
  ])
  dia_semana!: string;

  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/)
  hora_inicio!: string;

  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/)
  hora_fin!: string;
}

export class Grupos_Alumnos {
  @IsInt()
  @Min(1)
  @Type(() => Number)
  id_disciplina!: number;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  id_profesor!: number;

  @IsString()
  @IsNotEmpty()
  nivel!: string;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  cupo_max!: number;

  @IsArray()
  @ArrayMinSize(1, {
    message: 'El grupo debe tener al menos un horario.',
  })
  @ValidateNested({ each: true })
  @Type(() => HorarioGrupoDto)
  horarios!: HorarioGrupoDto[];
}