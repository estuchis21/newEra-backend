import { Body, Controller, Post, BadRequestException } from '@nestjs/common';
import { PagosService } from './pagos.service';

@Controller('pagos')
export class PagosController {
  constructor(private readonly pagosService: PagosService) {}

  // POST /api/pagos/crear
  @Post('crear')
  crearPago(@Body() body: { id_cuota?: number }) {
    const idCuota = Number(body?.id_cuota);
    if (!Number.isSafeInteger(idCuota) || idCuota <= 0) {
      throw new BadRequestException('id_cuota inválido.');
    }
    return this.pagosService.crearPago(idCuota);
  }
}
