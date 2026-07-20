import { Controller } from '@nestjs/common';
import { RetiroMenoresService } from './retiro-menores.service';

@Controller('retiro-menores')
export class RetiroMenoresController {
  constructor(private readonly retiroMenoresService: RetiroMenoresService) {}
}
