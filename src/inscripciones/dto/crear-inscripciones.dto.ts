import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class CrearInscripcionDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  id_alumno!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  id_grupo!: number;
}