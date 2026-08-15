import {
    Body,
    Controller,
    Get,
    Param,
    ParseIntPipe,
    Post,
} from '@nestjs/common';

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


    // ============================================================
    // REGISTRAR ASISTENCIA
    // POST /asistencias
    // ============================================================

    @Post()
    async registrarAsistencia(

        @Body() body: {
            idAlumno: number;
            idClase: number;
            estado: string;
            observaciones: string;
        },

    ) {

        return this.asistenciasService.registrarAsistencia(

            body.idAlumno,

            body.idClase,

            body.estado,

            body.observaciones,

        );

    }

}
