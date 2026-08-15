import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CrearHorarioDto {

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