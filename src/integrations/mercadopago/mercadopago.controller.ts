import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';
import { PagosService } from '../../pagos/pagos.service';

@Controller('pagos')
export class MercadopagoController {
  constructor(private readonly pagosService: PagosService) {}

  // POST /api/pagos/crear-preferencia
  @Post('crear-preferencia')
  crearPreferencia(@Body() body: { idCuota?: number }) {
    const idCuota = Number(body?.idCuota);
    if (!Number.isSafeInteger(idCuota) || idCuota <= 0) {
      throw new BadRequestException('idCuota inválido.');
    }
    return this.pagosService.crearPago(idCuota);
  }

  // POST /api/pagos/webhook
  // Mercado Pago notifica; el backend consulta luego el pago real por API.
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async webhook(@Body() body: any, @Query() query: Record<string, any>) {
    const rawId =
      body?.data?.id ??
      body?.id ??
      query?.['data.id'] ??
      query?.id;

    const id = Number(rawId);
    if (!Number.isSafeInteger(id) || id <= 0) {
      // Respondemos 200 para no provocar reintentos infinitos por una
      // notificación que no corresponde a un pago.
      return { received: true, procesado: false, mensaje: 'ID inválido.' };
    }

    const resultado = await this.pagosService.procesarWebhookMercadoPago(id);
    return { received: true, ...resultado };
  }
}
