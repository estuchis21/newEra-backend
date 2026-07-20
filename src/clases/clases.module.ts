import { Module } from '@nestjs/common';
import { ClasesService } from './clases.service';
import { ClasesController } from './clases.controller';
import { ClasesRepository } from './clases.repository/clases.repository';

@Module({
  controllers: [ClasesController],
  providers: [ClasesService, ClasesRepository],
})
export class ClasesModule {}
