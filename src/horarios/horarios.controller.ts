import {
    Body,
    Controller,
    Get,
    Param,
    ParseIntPipe,
    Post,
} from '@nestjs/common';

import { CrearHorarioDto } from './dto/horarios.dto';
import { HorariosService } from './horarios.service';

@Controller('horarios')
export class HorariosController {

    constructor(
        private readonly horariosService: HorariosService,
    ) {}

    // Crear un horario para un grupo
    @Post('grupo')
    async agregarHorarioGrupo(
        @Body() crearHorarioDto: CrearHorarioDto,
    ) {
        return this.horariosService.agregarHorarioGrupo(
            crearHorarioDto.idGrupo,
            crearHorarioDto.diaSemana,
            crearHorarioDto.horaInicio,
            crearHorarioDto.horaFin,
        );
    }

    // Obtener los horarios de un grupo
    @Get('grupo/:idGrupo')
    async obtenerHorariosPorGrupo(
        @Param('idGrupo', ParseIntPipe) idGrupo: number,
    ) {
        return this.horariosService.obtenerHorariosPorGrupo(idGrupo);
    }
}
