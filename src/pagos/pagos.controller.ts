import {
  Body,
  Controller,
  Post,
} from '@nestjs/common';

import { PagosService } from './pagos.service';

@Controller('pagos')
export class PagosController {
  constructor(
    private readonly pagosService: PagosService,
  ) {}

  @Post('crear')
  async crearPago(
    @Body()
    body: {
      id_cuota: number;
    },
  ) {
    const idCuota = Number(body?.id_cuota);

    if (!Number.isInteger(idCuota) || idCuota <= 0) {
      return {
        success: false,
        mensaje: 'id_cuota inválido',
      };
    }

    return await this.pagosService.crearPago(
      idCuota,
    );
  }
}
