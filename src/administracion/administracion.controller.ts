import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { AdministracionService } from './administracion.service';

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
}
