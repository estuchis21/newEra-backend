import { Module } from '@nestjs/common';
import { GruposService } from './grupos.service';
import { GruposController } from './grupos.controller';
import { GruposRepository } from './grupos.repository/grupos.repository';

@Module({
  controllers: [GruposController],
  providers: [GruposService, GruposRepository],
})
export class GruposModule {}
aaa