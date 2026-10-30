
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
} from '@nestjs/common';

import { RetiroMenoresService } from './retiro-menores.service';

import type {
    CrearPersonaAutorizada,
    ActualizarPersonaAutorizada,
    RegistrarRetiro,
} from '../retiro-menores/retiro-menores.repository/retiro-menores.repository';

@Controller('retiros')
export class RetiroMenoresController {

    constructor(
        private readonly retiroService: RetiroMenoresService,
    ) {}

    // ========================================================
    // PERSONAS AUTORIZADAS
    // ========================================================

    // POST /retiros/personas-autorizadas

    @Post('personas-autorizadas')
    crearPersonaAutorizada(
        @Body() data: CrearPersonaAutorizada,
    ) {
        return this.retiroService.crearPersonaAutorizada(data);
    }

    // GET /retiros/personas-autorizadas/alumno/1

    @Get('personas-autorizadas/alumno/:idAlumno')
    obtenerPersonasAutorizadas(
        @Param('idAlumno', ParseIntPipe) idAlumno: number,
    ) {
        return this.retiroService.obtenerPersonasAutorizadas(
            idAlumno,
        );
    }

    // GET /retiros/personas-autorizadas/1

    @Get('personas-autorizadas/:idAutorizada')
    obtenerPersonaAutorizada(
        @Param('idAutorizada', ParseIntPipe) idAutorizada: number,
    ) {
        return this.retiroService.obtenerPersonaAutorizada(
            idAutorizada,
        );
    }

    // PATCH /retiros/personas-autorizadas/1

    @Patch('personas-autorizadas/:idAutorizada')
    actualizarPersonaAutorizada(
        @Param('idAutorizada', ParseIntPipe) idAutorizada: number,
        @Body() data: ActualizarPersonaAutorizada,
    ) {
        return this.retiroService.actualizarPersonaAutorizada(
            idAutorizada,
            data,
        );
    }

    // DELETE /retiros/personas-autorizadas/1

    @Delete('personas-autorizadas/:idAutorizada')
    desactivarPersonaAutorizada(
        @Param('idAutorizada', ParseIntPipe) idAutorizada: number,
    ) {
        return this.retiroService.desactivarPersonaAutorizada(
            idAutorizada,
        );
    }

    // ========================================================
    // REGISTROS DE RETIROS
    // ========================================================

    // POST /retiros

    @Post()
    registrarRetiro(
        @Body() data: RegistrarRetiro,
    ) {
        return this.retiroService.registrarRetiro(data);
    }

    // GET /retiros/historial

    @Get('historial')
    obtenerHistorial(
        @Query('id_alumno') id_alumno?: string,
        @Query('id_profesor') id_profesor?: string,
    ) {
        return this.retiroService.obtenerHistorial(
            id_alumno === undefined ? undefined : Number(id_alumno),
            id_profesor === undefined ? undefined : Number(id_profesor),
        );
    }

    // GET /retiros/1/planilla

    @Get(':idRetiro/planilla')
    obtenerPlanilla(
        @Param('idRetiro', ParseIntPipe) idRetiro: number,
    ) {
        return this.retiroService.obtenerPlanilla(idRetiro);
    }

    // GET /retiros/1

    @Get(':idRetiro')
    obtenerRetiro(
        @Param('idRetiro', ParseIntPipe) idRetiro: number,
    ) {
        return this.retiroService.obtenerPlanilla(idRetiro);
    }

}
