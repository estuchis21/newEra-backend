import { Module } from '@nestjs/common';
import { BoletinesService } from './boletines.service';
import { BoletinesController } from './boletines.controller';
import { BoletinesRepository } from './boletines.repository/boletines.repository';

@Module({
  controllers: [BoletinesController],
  providers: [BoletinesService, BoletinesRepository],
})
export class BoletinesModule {}
