import {
    Body,
    Controller,
    Get,
    Param,
    ParseIntPipe,
    Post,
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
}