
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';

import { HorariosService } from './horarios.service';

@Controller('horarios')
export class HorariosController {
  constructor(
    private readonly horariosService: HorariosService,
  ) {}

  @Post(':idGrupo')
  agregarHorarioGrupo(
    @Param('idGrupo', ParseIntPipe) idGrupo: number,
    @Body()
    body: {
      dia_semana: string;
      hora_inicio: string;
      hora_fin: string;
    },
  ) {
    return this.horariosService.agregarHorarioGrupo(
      idGrupo,
      body.dia_semana,
      body.hora_inicio,
      body.hora_fin,
    );
  }

  @Get('grupo/:idGrupo')
  horariosPorGrupo(
    @Param('idGrupo', ParseIntPipe) idGrupo: number,
  ) {
    return this.horariosService.horariosPorGrupo(idGrupo);
  }

  @Put(':idHorario')
  actualizarHorario(
    @Param('idHorario', ParseIntPipe) idHorario: number,
    @Body()
    body: {
      dia_semana: string;
      hora_inicio: string;
      hora_fin: string;
    },
  ) {
    return this.horariosService.actualizarHorario(
      idHorario,
      body.dia_semana,
      body.hora_inicio,
      body.hora_fin,
    );
  }

  @Delete(':idHorario')
  eliminarHorario(
    @Param('idHorario', ParseIntPipe) idHorario: number,
  ) {
    return this.horariosService.eliminarHorario(idHorario);
  }
}
