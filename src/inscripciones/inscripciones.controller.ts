import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Delete,
} from '@nestjs/common';

import { InscripcionesService } from './inscripciones.service';

@Controller('inscripciones')
export class InscripcionesController {
  constructor(
    private readonly inscripcionesService: InscripcionesService,
  ) {}

  @Post()
  crearInscripcion(
    @Body('id_alumno', ParseIntPipe) idAlumno: number,
    @Body('id_grupo', ParseIntPipe) idGrupo: number,
  ) {
    return this.inscripcionesService.crearInscripcion(
      idAlumno,
      idGrupo,
    );
  }

  @Get('alumno/:idAlumno')
  obtenerPorAlumno(
    @Param('idAlumno', ParseIntPipe) idAlumno: number,
  ) {
    return this.inscripcionesService.obtenerInscripcionesPorAlumno(
      idAlumno,
    );
  }

  @Delete(':idInscripcion')
  eliminarInscripcion(
    @Param('idInscripcion', ParseIntPipe) idInscripcion: number,
  ) {
    return this.inscripcionesService.eliminarInscripcion(
      idInscripcion,
    );
  }
}