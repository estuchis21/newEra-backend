import {
    Controller,
    Get,
    Param,
    ParseIntPipe,
} from '@nestjs/common';

import { ProfesoresService } from './profesores.service';

@Controller('profesores')
export class ProfesoresController {

    constructor(
        private readonly profesoresService: ProfesoresService,
    ) {}

    @Get('usuario/:id_usuario')
    async obtenerProfesorPorUsuario(
        @Param('id_usuario', ParseIntPipe) id_usuario: number,
    ) {

        console.log(
            'ID USUARIO RECIBIDO:',
            id_usuario
        );

        return this.profesoresService.obtenerProfesorPorUsuario(
            id_usuario
        );
    }
}