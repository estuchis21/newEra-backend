
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class RegistrarAsistenciaDto {
  @Type(() => Number)
  @IsInt()
  @Min(1, {
    message: 'id_alumno debe ser un número entero mayor que 0.',
  })
  id_alumno!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1, {
    message: 'id_clase debe ser un número entero mayor que 0.',
  })
  id_clase!: number;

  @IsString()
  @IsIn(['presente', 'ausente'], {
    message: 'El estado debe ser "presente" o "ausente".',
  })
  estado!: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  observaciones?: string;
}
