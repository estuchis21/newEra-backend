import {
    Body,
    Controller,
    Get,
    Param,
    ParseIntPipe,
    Post,
    Query
} from '@nestjs/common';

import { GruposService } from './grupos.service';
import { Grupos_Alumnos } from './dto/grupos.dto';

@Controller('grupos')
export class GruposController {

    constructor(
        private readonly gruposService: GruposService,
    ) {}

    @Post()
    async crearGrupo(
        @Body() dto: Grupos_Alumnos,
    ) {
        return this.gruposService.crearGrupo(dto);
    }

    @Get('alumno/:id_alumno')
    async obtenerGrupos(
        @Param('id_alumno', ParseIntPipe) id_alumno: number,
    ) {
        return this.gruposService.obtenerGrupos(id_alumno);
    }

    @Get('clases')
    async todasLasClases() {
        return this.gruposService.todasLasClases();
    }

    @Get('clases/:id_clase')
    async clasePorId(
        @Param('id_clase', ParseIntPipe) id_clase: number,
    ) {
        return this.gruposService.clasePorId(id_clase);
    }

    @Get('disponibles')
    async gruposDisponibles() {

        return this.gruposService.gruposDisponibles();

    }
    @Get('profesor/:id_profesor')
    async gruposPorProfesor(
        @Param('id_profesor', ParseIntPipe) id_profesor: number,
    ) {
        return this.gruposService.gruposPorProfesor(id_profesor);
    }

    @Get('profesor/:id_profesor/clases')
    async clasesPorProfesor(
        @Param('id_profesor', ParseIntPipe) id_profesor: number,
        @Query('fecha') fecha?: string,
    ) {
        return this.gruposService.clasesPorProfesor(
            id_profesor,
            fecha ?? null,
        );
    }

    @Get('clase/:id_clase/alumnos')
    async alumnosPorClase(
        @Param('id_clase', ParseIntPipe) id_clase: number,
    ) {
        return this.gruposService.alumnosPorClase(id_clase);
    }

    @Get('profesor/:id_profesor/liquidaciones')
    async liquidacionesPorProfesor(
        @Param('id_profesor', ParseIntPipe) id_profesor: number,
    ) {
        return this.gruposService.liquidacionesPorProfesor(
            id_profesor,
        );
    }
}