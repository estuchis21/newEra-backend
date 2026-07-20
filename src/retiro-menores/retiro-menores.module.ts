import { Module } from '@nestjs/common';
import { RetiroMenoresService } from './retiro-menores.service';
import { RetiroMenoresController } from './retiro-menores.controller';
import { RetiroMenoresRepository } from './retiro-menores.repository/retiro-menores.repository';

@Module({
  controllers: [RetiroMenoresController],
  providers: [RetiroMenoresService, RetiroMenoresRepository],
})
export class RetiroMenoresModule {}
