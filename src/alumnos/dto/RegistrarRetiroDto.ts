import { IsInt } from 'class-validator';

export class RegistrarRetiroDto {
  @IsInt()
  idAlumno!: number;

  @IsInt()
  idAutorizada!: number;
}