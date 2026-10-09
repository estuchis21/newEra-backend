
import { Module } from '@nestjs/common';

import { CreditosController } from './creditos.controller';
import { CreditosService } from './creditos.service';
import { CreditosRepository } from './creditos.repository';

@Module({
  controllers: [CreditosController],
  providers: [CreditosService, CreditosRepository],
  exports: [CreditosService],
})
export class CreditosModule {}