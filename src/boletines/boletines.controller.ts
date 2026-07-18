import { Controller } from '@nestjs/common';
import { BoletinesService } from './boletines.service';

@Controller('boletines')
export class BoletinesController {
  constructor(private readonly boletinesService: BoletinesService) {}
}
