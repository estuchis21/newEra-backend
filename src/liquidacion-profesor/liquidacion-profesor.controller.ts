import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  ParseIntPipe,
} from '@nestjs/common';

import { LiquidacionProfesorService } from './liquidacion-profesor.service';

@Controller('liquidaciones-profesores')
export class LiquidacionProfesorController {
  constructor(
    private readonly liquidacionService: LiquidacionProfesorService,
  ) {}

  // =====================================================
  // GENERAR LIQUIDACIONES DE UNA CUOTA PAGADA
  // =====================================================

  @Post('generar/:idCuota')
  generarPorCuota(
    @Param('idCuota', ParseIntPipe) idCuota: number,
  ) {
    return this.liquidacionService.generarPorCuota(idCuota);
  }

  // =====================================================
  // OBTENER TODAS
  // =====================================================

  @Get()
  obtenerTodas() {
    return this.liquidacionService.obtenerTodas();
  }

  // =====================================================
  // RESUMEN FINANCIERO
  // =====================================================

  @Get('resumen')
  obtenerResumen() {
    return this.liquidacionService.obtenerResumen();
  }

  // =====================================================
  // OBTENER POR PROFESOR
  // =====================================================

  @Get('profesor/:idProfesor')
  obtenerPorProfesor(
    @Param('idProfesor', ParseIntPipe) idProfesor: number,
  ) {
    return this.liquidacionService.obtenerPorProfesor(idProfesor);
  }

  // =====================================================
  // OBTENER POR CUOTA
  // =====================================================

  @Get('cuota/:idCuota')
  obtenerPorCuota(
    @Param('idCuota', ParseIntPipe) idCuota: number,
  ) {
    return this.liquidacionService.obtenerPorCuota(idCuota);
  }

  // =====================================================
  // OBTENER POR ID
  // =====================================================

  @Get(':idLiquidacion')
  obtenerPorId(
    @Param('idLiquidacion', ParseIntPipe) idLiquidacion: number,
  ) {
    return this.liquidacionService.obtenerPorId(idLiquidacion);
  }

  // =====================================================
  // MARCAR COMO PAGADA
  // =====================================================

  @Patch(':idLiquidacion/pagar')
  marcarPagada(
    @Param('idLiquidacion', ParseIntPipe) idLiquidacion: number,
  ) {
    return this.liquidacionService.marcarPagada(idLiquidacion);
  }

  // =====================================================
  // ANULAR
  // =====================================================

  @Patch(':idLiquidacion/anular')
  anular(
    @Param('idLiquidacion', ParseIntPipe) idLiquidacion: number,
  ) {
    return this.liquidacionService.anular(idLiquidacion);
  }
}