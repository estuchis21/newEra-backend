
import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';

import { CreditosService } from './creditos.service';

class ComprarPaqueteDto {
  idPaquete!: number;
}

@Controller('creditos')
export class CreditosController {
  constructor(
    private readonly creditosService: CreditosService,
  ) {}

  // GET /creditos/alumno/1/saldo
  @Get('alumno/:idAlumno/saldo')
  obtenerSaldo(
    @Param('idAlumno', ParseIntPipe) idAlumno: number,
  ) {
    return this.creditosService.obtenerSaldo(idAlumno);
  }

  // POST /creditos/alumno/1/comprar
  // Body: { "idPaquete": 1 }
  @Post('alumno/:idAlumno/comprar')
  @HttpCode(HttpStatus.OK)
  comprarPaquete(
    @Param('idAlumno', ParseIntPipe) idAlumno: number,
    @Body() dto: ComprarPaqueteDto,
  ) {
    return this.creditosService.comprarPaquete(
      idAlumno,
      Number(dto.idPaquete),
    );
  }
}