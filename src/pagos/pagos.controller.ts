
import {
  Body,
  Controller,
  Post,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';

import { PagosService } from './pagos.service';

@Controller('pagos')
export class PagosController {
  constructor(
    private readonly pagosService: PagosService,
  ) {}

  // ============================================================
  // CREAR PAGO
  // ============================================================

  @Post('crear')
  async crearPago(
    @Body() body: { id_cuota: number },
  ) {
    const idCuota = Number(body?.id_cuota);

    if (!Number.isInteger(idCuota) || idCuota <= 0) {
      return {
        success: false,
        mensaje: 'id_cuota inválido',
      };
    }

    return this.pagosService.crearPago(idCuota);
  }

  // ============================================================
  // WEBHOOK MERCADO PAGO
  // ============================================================

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async webhookMercadoPago(
    @Body() body: any,
    @Query() query: Record<string, any>,
  ) {
    const idMercadoPago =
      body?.data?.id ??
      body?.id ??
      query?.['data.id'] ??
      query?.id;

    const id = Number(idMercadoPago);

    if (!Number.isSafeInteger(id) || id <= 0) {
      return {
        success: false,
        procesado: false,
        mensaje: 'Notificación sin ID de pago válido',
      };
    }

    return this.pagosService.procesarWebhookMercadoPago(id);
  }
}
