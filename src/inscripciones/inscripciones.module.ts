
import { Module } from '@nestjs/common';

import { InscripcionesController } from './inscripciones.controller';
import { InscripcionesRepository } from './inscripciones.repository/inscripciones.repository';
import { InscripcionesService } from './inscripciones.service';
import { CuotasModule } from '../cuotas/cuotas.module';

@Module({
    imports: [
        CuotasModule,
    ],
    controllers: [
        InscripcionesController,
    ],
    providers: [
        InscripcionesService,
        InscripcionesRepository,
    ],
    exports: [
        InscripcionesService,
    ],
})
export class InscripcionesModule {}
