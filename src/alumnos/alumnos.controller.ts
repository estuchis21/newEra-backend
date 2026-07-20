import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post
} from '@nestjs/common';

import { AlumnosService } from './alumnos.service';
import { CreateAlumnoDto } from './dto/createalumno.dto';
import { LoginDto } from './dto/login.dto';


@Controller('alumnos')
export class AlumnosController {


  constructor(
    private readonly alumnosService: AlumnosService
  ) {}



  @Post('/login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto
  ) {


    const result =
      await this.alumnosService.login(
        loginDto
      );


    return {

      statusCode: HttpStatus.OK,

      message:
      'Login exitoso',

      data: result

    };

  }





  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createAlumnoDto: CreateAlumnoDto
  ) {


    const result =
      await this.alumnosService.RegistrarAlumno(
        createAlumnoDto
      );


    return {

      statusCode:
      HttpStatus.CREATED,

      message:
      'Alumno registrado exitosamente',

      data: result

    };

  }


}