import { Module } from '@nestjs/common';
import { CuotasController } from './cuotas.controller';
import { CuotasRepository } from './cuotas.repository/cuotas.repository';
import { CuotasService } from './cuotas.service';

@Module({

    controllers: [
        CuotasController,
    ],

    providers: [
        CuotasService,
        CuotasRepository,
    ],

    exports: [
        CuotasService,
        CuotasRepository,
    ],

})
export class CuotasModule {}