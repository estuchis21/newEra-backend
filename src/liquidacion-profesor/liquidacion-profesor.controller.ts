import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import {
  LiquidacionProfesorService,
} from './liquidacion-profesor.service';

import { RegistrarTransferenciaDto } from './dto/liquidacion-profesor.dto';

@Controller('liquidaciones-profesores')
export class LiquidacionProfesorController {
  constructor(private readonly service: LiquidacionProfesorService) {}

  @Post('generar/:idCuota')
  generarPorCuota(@Param('idCuota', ParseIntPipe) idCuota: number) {
    return this.service.generarPorCuota(idCuota);
  }

  @Get()
  obtenerTodas() {
    return this.service.obtenerTodas();
  }

  @Get('resumen')
  obtenerResumen() {
    return this.service.obtenerResumen();
  }

  @Get('profesor/:idProfesor')
  obtenerPorProfesor(@Param('idProfesor', ParseIntPipe) idProfesor: number) {
    return this.service.obtenerPorProfesor(idProfesor);
  }

  @Get('cuota/:idCuota')
  obtenerPorCuota(@Param('idCuota', ParseIntPipe) idCuota: number) {
    return this.service.obtenerPorCuota(idCuota);
  }

  @Get(':idLiquidacion')
  obtenerPorId(@Param('idLiquidacion', ParseIntPipe) id: number) {
    return this.service.obtenerPorId(id);
  }

  // El cliente administrativo debe enviar los datos de la transferencia real.
  @Patch(':idLiquidacion/pagar')
  marcarPagada(
    @Param('idLiquidacion', ParseIntPipe) id: number,
    @Body() body: RegistrarTransferenciaDto,
  ) {
    return this.service.marcarPagada(id, body);
  }

  @Patch(':idLiquidacion/anular')
  anular(@Param('idLiquidacion', ParseIntPipe) id: number) {
    return this.service.anular(id);
  }
}
