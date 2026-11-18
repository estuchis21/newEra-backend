
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

  // Registrar una transferencia manual realizada por el administrador.
  @Patch(':idLiquidacion/pagar')
  marcarPagada(
    @Param('idLiquidacion', ParseIntPipe) idLiquidacion: number,
    @Body() dto: RegistrarTransferenciaDto,
  ) {
    return this.service.marcarPagada(idLiquidacion, dto);
  }

  // Registrar o reemplazar la cuenta activa de un profesor.
  @Post(':idProfesor/cuenta-cobro')
  guardarCuentaCobro(
    @Param('idProfesor', ParseIntPipe) idProfesor: number,
    @Body() dto: RegistrarCuentaCobroDto,
  ) {
    return this.service.guardarCuentaCobro(idProfesor, dto);
  }

  // Consultar la cuenta activa de un profesor.
  @Get(':idProfesor/cuenta-cobro')
  obtenerCuentaCobro(
    @Param('idProfesor', ParseIntPipe) idProfesor: number,
  ) {
    return this.service.obtenerCuentaCobro(idProfesor);
  }

  // Consultar el historial de transferencias de una liquidación.
  @Get(':idLiquidacion/historial')
  obtenerHistorial(
    @Param('idLiquidacion', ParseIntPipe) idLiquidacion: number,
  ) {
    return this.service.obtenerHistorialTransferencias(
      idLiquidacion,
    );
  }
}
