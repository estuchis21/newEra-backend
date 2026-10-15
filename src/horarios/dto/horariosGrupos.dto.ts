import {
    IsNotEmpty,
    IsString,
    Matches
} from "class-validator";

export class HorarioGrupoDto {
    @IsString()
    @IsNotEmpty()
    dia_semana!: string;

    @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
    hora_inicio!: string;

    @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
    hora_fin!: string;
}