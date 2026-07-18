import { Controller } from '@nestjs/common';
import { DisciplinasService } from './disciplinas.service';

@Controller('disciplinas')
export class DisciplinasController {
  constructor(private readonly disciplinasService: DisciplinasService) {}
}
