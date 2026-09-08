import { Body, Controller, Post } from '@nestjs/common';
import { CrearHorarioDto } from './dto/horarios.dto';
import { HorariosService } from './horarios.service';

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