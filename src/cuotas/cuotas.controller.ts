import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';

import { CuotasService } from './cuotas.service';

@Controller('cuotas')
export class CuotasController {
  constructor(
    private readonly cuotasService:
      CuotasService,
  ) {}

  // ============================================================
  // CREAR CUOTA
  // ============================================================

  @Post()
  async crearCuota(
    @Body()
    body: {
      id_alumno: number;
      id_paquete: number;
    },
  ) {
    return await this.cuotasService.crearCuota(
      Number(body.id_alumno),
      Number(body.id_paquete),
    );
  }

  // ============================================================
  // OBTENER CUOTAS DEL ALUMNO
  // ============================================================

  @Get('alumno/:idAlumno')
  async obtenerCuotasAlumno(
    @Param(
      'idAlumno',
      ParseIntPipe,
    )
    idAlumno: number,
  ) {
    return await this.cuotasService
      .obtenerCuotasAlumno(idAlumno);
  }
}