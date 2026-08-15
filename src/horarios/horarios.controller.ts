import { Body, Controller, Post } from '@nestjs/common';
import { HorariosService } from './horarios.service';
import { CrearHorarioDto } from './dto/horarios.dto';

@Controller('horarios')
export class HorariosController {

    constructor(
        private readonly horariosService: HorariosService,
    ) {}

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
}