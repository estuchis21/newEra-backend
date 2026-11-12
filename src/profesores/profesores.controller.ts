import {
    Controller,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Body,
    Req,
    UseGuards,
    UnauthorizedException,
} from '@nestjs/common';

import { ProfesoresService } from './profesores.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('profesores')
export class ProfesoresController {
    constructor(
        private readonly profesoresService: ProfesoresService,
    ) {}

    @Get('usuario/:id_usuario')
    async obtenerProfesorPorUsuario(
        @Param('id_usuario', ParseIntPipe) id_usuario: number,
    ) {
        return this.profesoresService.obtenerProfesorPorUsuario(
            id_usuario,
        );
    }

    @UseGuards(JwtAuthGuard)
    @Get('mi-cuenta-mp')
    async obtenerMiCuentaMP(@Req() req: any) {
        const idUsuario = req.user?.id_usuario;

        if (!idUsuario) {
            throw new UnauthorizedException(
                'No se pudo identificar al usuario autenticado',
            );
        }

        return this.profesoresService.obtenerAliasMP(idUsuario);
    }

    @UseGuards(JwtAuthGuard)
    @Patch('mi-cuenta-mp')
    async guardarMiCuentaMP(
        @Req() req: any,
        @Body('alias_mp') aliasMP: string,
    ) {
        const idUsuario = req.user?.id_usuario;

        if (!idUsuario) {
            throw new UnauthorizedException(
                'No se pudo identificar al usuario autenticado',
            );
        }

        return this.profesoresService.guardarAliasMP(
            idUsuario,
            aliasMP,
        );
    }
}