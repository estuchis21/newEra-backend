import {
    Body,
    Controller,
    Get,
    Param,
    ParseIntPipe,
    Post,
} from '@nestjs/common';

import { AsistenciasService } from './asistencias.service';
import { ConflictException, BadRequestException } from '@nestjs/common';


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


    // ============================================================
    // REGISTRAR ASISTENCIA
    // POST /asistencias
    // ============================================================

  @Post()
  async registrarAsistencia(
    @Body()
    body: {
      idAlumno: number;
      idClase: number;
      estado: string;
      observaciones: string;
    },
  ) {

    // ==========================================
    // VALIDAR BODY
    // ==========================================

    if (!body) {
      throw new ConflictException(
        'El body es obligatorio.',
      );
    }

    // ==========================================
    // VALIDAR ID ALUMNO
    // ==========================================

    if (
      body.idAlumno === undefined ||
      body.idAlumno === null ||
      !Number.isInteger(Number(body.idAlumno)) ||
      Number(body.idAlumno) <= 0
    ) {
      throw new ConflictException(
        'idAlumno debe ser un número entero mayor que 0.',
      );
    }

    // ==========================================
    // VALIDAR ID CLASE
    // ==========================================

    if (
      body.idClase === undefined ||
      body.idClase === null ||
      !Number.isInteger(Number(body.idClase)) ||
      Number(body.idClase) <= 0
    ) {
      throw new ConflictException(
        'idClase debe ser un número entero mayor que 0.',
      );
    }

    // ==========================================
    // VALIDAR ESTADO
    // ==========================================

    if (
      !body.estado ||
      typeof body.estado !== 'string'
    ) {
      throw new ConflictException(
        'El estado es obligatorio.',
      );
    }

    const estado = body.estado
      .trim()
      .toLowerCase();

    if (
      estado !== 'presente' &&
      estado !== 'ausente'
    ) {
      throw new ConflictException(
        'El estado debe ser "presente" o "ausente".',
      );
    }

    // ==========================================
    // VALIDAR OBSERVACIONES
    // ==========================================

    if (
      body.observaciones !== undefined &&
      body.observaciones !== null &&
      typeof body.observaciones !== 'string'
    ) {
      throw new ConflictException(
        'Las observaciones deben ser texto.',
      );
    }

    // ==========================================
    // REGISTRAR
    // ==========================================

    return this.asistenciasService.registrarAsistencia(
      Number(body.idAlumno),
      Number(body.idClase),
      estado,
      body.observaciones?.trim() || '',
    );
  }
}


