import {
    IsInt
} from 'class-validator';


export class CreateGrupoClaseDto {

  @IsInt()
  id_alumno!: number;

}