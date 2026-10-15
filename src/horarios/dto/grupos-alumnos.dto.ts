
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsString,
  IsIn,
  IsNumber,
  Min,
  Matches,
  ValidateNested,
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
  @Type(() => Number)
  @IsInt()
  @Min(1)
  id_disciplina!: number;

  @IsString()
  @IsNotEmpty()
  nivel!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  cupo_max!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  id_profesor!: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HorarioGrupoDto)
  horarios!: HorarioGrupoDto[];
}
