
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Get,
  Param,
  BadRequestException,
} from '@nestjs/common';

import { AlumnosService } from './alumnos.service';

import { CreateAlumnoDto } from './dto/createalumno.dto';
import { LoginDto } from './dto/login.dto';

@Controller('alumnos')
export class AlumnosController {
  constructor(
    private readonly alumnosService: AlumnosService,
  ) {}

  // ============================================================
  // LOGIN
  // ============================================================

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    const result = await this.alumnosService.login(
      loginDto,
    );

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
    @Param('id_usuario') id_usuario: string,
  ) {
    console.log(
      '[ALUMNOS] Buscando ID de alumno:',
      id_usuario,
    );

    const result =
      await this.alumnosService.obtenerIdAlumnoPorUsuario(
        Number(id_usuario),
      );

    console.log('[ALUMNOS] ID obtenido:', result);

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
  async findByEmail(@Param('email') email: string) {
    const result =
      await this.alumnosService.encontrarAlumnoPorMail(
        email,
      );

    if (!result) {
      throw new BadRequestException(
        'No se encontró el usuario.',
      );
    }

    // No devolver hashes de contraseñas.
    const { contrasena, password, ...usuario } =
      result as any;

    return {
      statusCode: HttpStatus.OK,
      message: 'Alumno encontrado',
      data: usuario,
    };
  }

  // ============================================================
  // REGISTRAR ALUMNO
  // ============================================================

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createAlumnoDto: CreateAlumnoDto,
  ) {
    const result =
      await this.alumnosService.RegistrarAlumno(
        createAlumnoDto,
      );

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Alumno registrado exitosamente',
      data: result,
    };
  }

  // ============================================================
  // SOLICITAR RECUPERACIÓN DE CONTRASEÑA
  // ============================================================

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(
    @Body('email') email: string,
  ) {
    const result =
      await this.alumnosService.solicitarRecuperacion(
        email,
      );

    return {
      statusCode: HttpStatus.OK,
      ...result,
    };
  }

  // ============================================================
  // RESTABLECER CONTRASEÑA
  // ============================================================

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Body('token') token: string,
    @Body('nuevaContrasena') nuevaContrasena: string,
  ) {
    const result =
      await this.alumnosService.restablecerContrasena(
        token,
        nuevaContrasena,
      );

    return {
      statusCode: HttpStatus.OK,
      ...result,
    };
  }
}
