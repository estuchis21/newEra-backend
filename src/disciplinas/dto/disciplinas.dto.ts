import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateDisciplinaDto {

    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    disciplina!: string;

}