import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post
} from '@nestjs/common';

import { DisciplinasService } from './disciplinas.service';
import {CreateDisciplinaDto} from './dto/disciplinas.dto';

@Controller('disciplinas')
export class DisciplinasController {

  constructor(
    private readonly disciplinasService: DisciplinasService
  ) {}

  @Post('crear')
  async crearDisciplina(
    @Body() dto: CreateDisciplinaDto
  ) {
    return this.disciplinasService.crearDisciplina(
      dto
    );
  }

  @Get(':id')
  async existeDisciplina(
    @Param('id', ParseIntPipe) id: number
  ) {
    return this.disciplinasService.obtenerDisciplina(
      id
    );
  }

}