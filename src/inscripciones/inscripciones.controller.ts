import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Delete,
} from '@nestjs/common';

import { CrearInscripcionDto } from './dto/crear-inscripciones.dto';

import { InscripcionesService } from './inscripciones.service';

@Controller('inscripciones')
export class InscripcionesController {
  constructor(
    private readonly inscripcionesService: InscripcionesService,
  ) {}

  @Post()
  crearInscripcion(@Body() dto: CrearInscripcionDto) {
    return this.inscripcionesService.crearInscripcion(
      dto.id_alumno,
      dto.id_grupo,
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