import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';

import { RegistrarAsistenciaDto } from './dto/registrar-asistencia.dto';

import { ConflictException } from '@nestjs/common';
import { AsistenciasService } from './asistencias.service';


@Controller('asistencias')
export class AsistenciasController {

    constructor(
        private readonly asistenciasService: AsistenciasService,
    ) {}


    // ============================================================
    // OBTENER TODAS LAS ASISTENCIAS DE UN ALUMNO
    // GET /asistencias/alumno/:idAlumno
    // ============================================================

    @Get('alumno/:idAlumno')
    async verAsistencias(
        @Param('idAlumno', ParseIntPipe) idAlumno: number,
    ) {

        return this.asistenciasService.verAsistencias(
            idAlumno,
        );

    }


    // ============================================================
    // OBTENER ASISTENCIA DE UN ALUMNO EN UNA CLASE
    // GET /asistencias/alumno/:idAlumno/clase/:idClase
    // ============================================================

    @Get('alumno/:idAlumno/clase/:idClase')
    async verAsistenciaAlumnoClase(
        @Param('idAlumno', ParseIntPipe) idAlumno: number,

        @Param('idClase', ParseIntPipe) idClase: number,
    ) {

        return this.asistenciasService.verAsistenciaAlumnoClase(
            idAlumno,
            idClase,
        );

    }

    
@Get('clase/:idClase')
async obtenerAsistenciasPorClase(
    @Param('idClase', ParseIntPipe) idClase: number,
) {
    return this.asistenciasService.obtenerAsistenciasPorClase(idClase);
}



    // ============================================================
    // REGISTRAR ASISTENCIA
    // POST /asistencias
    // ============================================================


  @Post()
  async registrarAsistencia(
    @Body() dto: RegistrarAsistenciaDto,
  ) {
    return this.asistenciasService.registrarAsistencia(
      dto.id_alumno,
      dto.id_clase,
      dto.estado,
      dto.observaciones?.trim() ?? '',
    );
  }


  
  @Get('grupo/:idGrupo/profesor/:idProfesor')
  async obtenerAsistenciasPorGrupoYProfesor(
      @Param('idGrupo', ParseIntPipe) idGrupo: number,
      @Param('idProfesor', ParseIntPipe) idProfesor: number,
  ) {
      return this.asistenciasService.obtenerAsistenciasPorGrupoYProfesor(
          idGrupo,
          idProfesor,
      );
  }

}


