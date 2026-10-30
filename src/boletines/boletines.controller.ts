
import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Param,
    Body,
    Query,
    ParseIntPipe,
    BadRequestException,
} from '@nestjs/common';

import { BoletinesService } from './boletines.service';

import type {
    CrearBoletinData,
    ActualizarBoletinData,
    FiltrosBoletines,
} from '../boletines/boletines.repository/boletines.repository';

@Controller('boletines')
export class BoletinesController {

    constructor(
        private readonly boletinesService: BoletinesService,
    ) {}

    // ========================================================
    // CONVERTIR FILTROS A NUMEROS
    // ========================================================

    private convertirFiltro(valor?: string): number | undefined {

        if (valor === undefined || valor === '') {
            return undefined;
        }

        const numero = Number(valor);

        if (!Number.isInteger(numero) || numero <= 0) {
            throw new BadRequestException(
                'Los filtros deben contener números enteros positivos',
            );
        }

        return numero;
    }

    // ========================================================
    // GET /boletines
    // LISTAR TODOS CON FILTROS OPCIONALES
    // ========================================================

    @Get()
    async obtenerTodos(
        @Query('id_alumno') id_alumno?: string,
        @Query('id_grupo') id_grupo?: string,
        @Query('id_profesor') id_profesor?: string,
        @Query('id_periodo') id_periodo?: string,
        @Query('anio') anio?: string,
    ) {

        const filtros: FiltrosBoletines = {
            id_alumno: this.convertirFiltro(id_alumno),
            id_grupo: this.convertirFiltro(id_grupo),
            id_profesor: this.convertirFiltro(id_profesor),
            id_periodo: this.convertirFiltro(id_periodo),
            anio: this.convertirFiltro(anio),
        };

        return this.boletinesService.obtenerTodos(filtros);
    }

    // ========================================================
    // GET /boletines/alumno/:idAlumno
    // ========================================================

    @Get('alumno/:idAlumno')
    async obtenerPorAlumno(
        @Param('idAlumno', ParseIntPipe) idAlumno: number,
    ) {

        return this.boletinesService.obtenerPorAlumno(idAlumno);
    }

    // ========================================================
    // GET /boletines/grupo/:idGrupo
    // ========================================================

    @Get('grupo/:idGrupo')
    async obtenerPorGrupo(
        @Param('idGrupo', ParseIntPipe) idGrupo: number,
    ) {

        return this.boletinesService.obtenerPorGrupo(idGrupo);
    }

    // ========================================================
    // GET /boletines/profesor/:idProfesor
    // ========================================================

    @Get('profesor/:idProfesor')
    async obtenerPorProfesor(
        @Param('idProfesor', ParseIntPipe) idProfesor: number,
    ) {

        return this.boletinesService.obtenerPorProfesor(idProfesor);
    }

    // ========================================================
    // GET /boletines/periodo/:idPeriodo
    // ========================================================

    @Get('periodo/:idPeriodo')
    async obtenerPorPeriodo(
        @Param('idPeriodo', ParseIntPipe) idPeriodo: number,
    ) {

        return this.boletinesService.obtenerPorPeriodo(idPeriodo);
    }

    // ========================================================
    // GET /boletines/:idBoletin
    // ========================================================

    @Get(':idBoletin')
    async obtenerPorId(
        @Param('idBoletin', ParseIntPipe) idBoletin: number,
    ) {

        return this.boletinesService.obtenerPorId(idBoletin);
    }

    // ========================================================
    // POST /boletines
    // ========================================================

    @Post()
    async crear(
        @Body() data: CrearBoletinData,
    ) {

        return this.boletinesService.crear(data);
    }

    // ========================================================
    // PATCH /boletines/:idBoletin
    // ========================================================

    @Patch(':idBoletin')
    async actualizar(
        @Param('idBoletin', ParseIntPipe) idBoletin: number,
        @Body() data: ActualizarBoletinData,
    ) {

        return this.boletinesService.actualizar(
            idBoletin,
            data,
        );
    }

    // ========================================================
    // DELETE /boletines/:idBoletin
    // ========================================================

    @Delete(':idBoletin')
    async eliminar(
        @Param('idBoletin', ParseIntPipe) idBoletin: number,
    ) {

        return this.boletinesService.eliminar(idBoletin);
    }

}
