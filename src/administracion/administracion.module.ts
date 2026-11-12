import { Module } from '@nestjs/common';
import { AdministracionController } from './administracion.controller';
import { AdministracionService } from './administracion.service';
import { DatabaseModule } from '../database/database.module';
import { CuotasModule } from '../cuotas/cuotas.module';

@Module({
  imports: [
    DatabaseModule,
    CuotasModule,
  ],
  controllers: [AdministracionController],
  providers: [AdministracionService],
})
export class AdministracionModule {}