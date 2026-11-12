import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  Post,
  UseGuards,
} from '@nestjs/common';

import { AdministracionService } from './administracion.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('administracion')
export class AdministracionController {
  constructor(
    private readonly administracionService: AdministracionService,
  ) {}

  @Get('dashboard/:idUsuario')
  dashboard(@Param('idUsuario', ParseIntPipe) idUsuario: number) {
    return this.administracionService.dashboard(idUsuario);
  }

  @Get('alumnos/:idUsuario')
  alumnos(
    @Param('idUsuario', ParseIntPipe) idUsuario: number,
    @Query('buscar') buscar?: string,
  ) {
    return this.administracionService.alumnos(idUsuario, buscar);
  }

  @Get('grupos/:idUsuario')
  grupos(@Param('idUsuario', ParseIntPipe) idUsuario: number) {
    return this.administracionService.grupos(idUsuario);
  }

  @Get('cuotas-pendientes/:idUsuario')
  cuotasPendientes(@Param('idUsuario', ParseIntPipe) idUsuario: number) {
    return this.administracionService.cuotasPendientes(idUsuario);
  }

  @Get('pagos-recientes/:idUsuario')
  pagosRecientes(@Param('idUsuario', ParseIntPipe) idUsuario: number) {
    return this.administracionService.pagosRecientes(idUsuario);
  }

  // ============================================================
  // RECALCULAR CUOTA DE UN ALUMNO
  // ============================================================

  @Post('cuotas/:idAlumno/recalcular')
  @UseGuards(JwtAuthGuard)
  recalcularCuotaAlumno(
    @Param('idAlumno', ParseIntPipe) idAlumno: number,
    @CurrentUser() usuario: { id_usuario: number },
  ) {
    return this.administracionService.recalcularCuotaAlumno(
      usuario.id_usuario,
      idAlumno,
    );
  }
}