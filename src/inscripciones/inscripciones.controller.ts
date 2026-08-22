import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseIntPipe,
    Post,
} from '@nestjs/common';

import { InscripcionesService } from './inscripciones.service';

@Controller('inscripciones')
export class InscripcionesController {

  constructor(
    private readonly inscripcionesService: InscripcionesService,
  ) {}

  // ============================================================
  // CREAR INSCRIPCIÓN
  // ============================================================

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async crearInscripcion(
    @Body() body: {
      idAlumno: number;
      idGrupo: number;
    }
  ) {

    console.log('=================================');
    console.log('BODY:', body);
    console.log('ID ALUMNO:', body.idAlumno);
    console.log('ID GRUPO:', body.idGrupo);
    console.log('=================================');

    const result =
      await this.inscripcionesService.crearInscripcion(
        body.idAlumno,
        body.idGrupo
      );

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Inscripción creada correctamente',
      data: result
    };
  }


  // ============================================================
  // OBTENER INSCRIPCIONES DE UN ALUMNO
  // ============================================================

  @Get('alumno/:idAlumno')
  async obtenerInscripcionesPorAlumno(
    @Param('idAlumno', ParseIntPipe) idAlumno: number,
  ) {

    return await this.inscripcionesService.obtenerInscripcionesPorAlumno(
      idAlumno,
    );
  }

}