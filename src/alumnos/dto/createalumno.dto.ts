import {
  IsBoolean,
  IsDefined,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UsuarioInputDto } from './usuarioinput.dto';

export class CreateAlumnoDto {
  @IsDefined()
  @ValidateNested()
  @Type(() => UsuarioInputDto)
  usuario!: UsuarioInputDto;

  @IsOptional()
  @IsBoolean()
  es_menor?: boolean;
}
