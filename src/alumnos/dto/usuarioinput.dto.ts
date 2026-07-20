import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class UsuarioInputDto {

  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @IsString()
  @IsNotEmpty()
  apellido!: string;

  @IsString()
  @IsNotEmpty()
  dni!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  contrasena!: string;

  @IsString()
  @IsNotEmpty()
  username!: string;

  @IsString()
  celular!: string;

  @IsInt()
  id_rol!: number;

}