import {
  IsBoolean,
  IsOptional
} from 'class-validator';
import { UsuarioInputDto } from './usuarioinput.dto';


export class CreateAlumnoDto {

usuario!: UsuarioInputDto;


  @IsOptional()
  @IsBoolean()
  es_menor?: boolean;


}