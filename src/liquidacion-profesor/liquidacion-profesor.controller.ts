
import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';

import { LiquidacionProfesorService } from './liquidacion-profesor.service';
import { RegistrarTransferenciaDto } from './dto/liquidacion-profesor.dto';
import { RegistrarCuentaCobroDto } from './dto/registrar-cuenta-cobro.dto';

@Controller('liquidaciones-profesores')
export class LiquidacionProfesorController {
  constructor(
    private readonly service: LiquidacionProfesorService,
  ) {}

  @Post('generar/:idCuota')
  generarPorCuota(
    @Param('idCuota', ParseIntPipe) idCuota: number,
  ) {
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
  obtenerPorProfesor(
    @Param('idProfesor', ParseIntPipe) idProfesor: number,
  ) {
    return this.service.obtenerPorProfesor(idProfesor);
  }

  @Get('profesor/:idProfesor/cuenta')
  obtenerCuentaActivaPorProfesor(
    @Param('idProfesor', ParseIntPipe) idProfesor: number,
  ) {
    return this.service.obtenerCuentaActivaPorProfesor(
      idProfesor,
    );
  }

  @Post('profesor/:idProfesor/cuenta')
  guardarCuentaCobro(
    @Param('idProfesor', ParseIntPipe) idProfesor: number,
    @Body() dto: RegistrarCuentaCobroDto,
  ) {
    return this.service.guardarCuentaCobro(
      idProfesor,
      dto,
    );
  }

  @Get('profesor/:idProfesor/cuenta-cobro')
  obtenerCuentaCobro(
    @Param('idProfesor', ParseIntPipe) idProfesor: number,
  ) {
    return this.service.obtenerCuentaCobro(idProfesor);
  }

  @Get('cuota/:idCuota')
  obtenerPorCuota(
    @Param('idCuota', ParseIntPipe) idCuota: number,
  ) {
    return this.service.obtenerPorCuota(idCuota);
  }

  @Get(':idLiquidacion')
  obtenerPorId(
    @Param('idLiquidacion', ParseIntPipe) id: number,
  ) {
    return this.service.obtenerPorId(id);
  }

  @Get(':idLiquidacion/transferencias')
  obtenerHistorialTransferencias(
    @Param('idLiquidacion', ParseIntPipe) id: number,
  ) {
    return this.service.obtenerHistorialTransferencias(id);
  }

  @Patch(':idLiquidacion/pagar')
  marcarPagada(
    @Param('idLiquidacion', ParseIntPipe) id: number,
    @Body() dto: RegistrarTransferenciaDto,
  ) {
    return this.service.marcarPagada(id, dto);
  }

  @Patch(':idLiquidacion/anular')
  anular(
    @Param('idLiquidacion', ParseIntPipe) id: number,
  ) {
    return this.service.anular(id);
  }
}
