import { Controller } from '@nestjs/common';
import { CuotasService } from './cuotas.service';

@Controller('cuotas')
export class CuotasController {
  constructor(private readonly cuotasService: CuotasService) {}
}
