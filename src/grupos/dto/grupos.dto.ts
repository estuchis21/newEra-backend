import {
    IsDateString,
    IsInt,
    IsNotEmpty,
    IsString,
    Min
} from 'class-validator';


export class Grupos_Alumnos {

  @IsInt()
  id_grupo!: number;

  @IsInt()
  id_disciplina!: number;


  @IsInt()
  id_profesor!: number;


  @IsString()
  @IsNotEmpty()
  nivel!: string;


  @IsInt()
  @Min(1)
  cupo_max!: number;


  @IsDateString()
  fecha!: string;


  @IsString()
  @IsNotEmpty()
  hora_inicio!: string;


  @IsString()
  @IsNotEmpty()
  hora_fin!: string;

}