import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Get,
  Param,
} from '@nestjs/common';

import { AlumnosService } from './alumnos.service';
import { CreateAlumnoDto } from './dto/createalumno.dto';
import { LoginDto } from './dto/login.dto';

@Controller('alumnos')
export class AlumnosController {

  constructor(
    private readonly alumnosService: AlumnosService
  ) {}

  // ============================================================
  // LOGIN
  // ============================================================

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto
  ) {

    const result =
      await this.alumnosService.login(loginDto);

    return {
      statusCode: HttpStatus.OK,
      message: 'Login exitoso',
      data: result,
    };
  }


  // ============================================================
  // OBTENER ID ALUMNO POR ID USUARIO
  // ============================================================

  @Get('obtenerIdAlumnoPorUsuario/:id_usuario')
  @HttpCode(HttpStatus.OK)
  async obtenerIdAlumnoPorUsuario(
    @Param('id_usuario') id_usuario: string
  ) {

    console.log('=================================');
    console.log('BUSCANDO ID ALUMNO');
    console.log('ID USUARIO:', id_usuario);
    console.log('=================================');

    const result =
      await this.alumnosService.obtenerIdAlumnoPorUsuario(
        Number(id_usuario)
      );

    console.log('ID ALUMNO OBTENIDO:', result);

    return {
      statusCode: HttpStatus.OK,
      message: 'ID de alumno obtenido',
      data: result,
    };
  }


  // ============================================================
  // BUSCAR ALUMNO POR EMAIL
  // ============================================================

  @Get('findByEmail/:email')
  @HttpCode(HttpStatus.OK)
  async findByEmail(
    @Param('email') email: string
  ) {

    const result =
      await this.alumnosService.encontrarAlumnoPorMail(
        email
      );

    return {
      statusCode: HttpStatus.OK,
      message: 'Alumno encontrado',
      data: result,
    };
  }


  // ============================================================
  // REGISTRAR ALUMNO
  // ============================================================

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
      statusCode: HttpStatus.CREATED,
      message: 'Alumno registrado exitosamente',
      data: result,
    };
  }
}