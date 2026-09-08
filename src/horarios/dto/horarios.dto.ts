import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CrearHorarioDto {

    @Type(() => Number)
    @IsInt()
    idGrupo!: number;

    @IsString()
    @IsNotEmpty()
    diaSemana!: string;

    @IsString()
    @IsNotEmpty()
    horaInicio!: string;

    @IsString()
    @IsNotEmpty()
    horaFin!: string;
}