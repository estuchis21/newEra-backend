import {
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  Matches,
} from 'class-validator';

export class RegistrarCuentaCobroDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  alias?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{22}$/)
  cbu_cvu?: string;

  @IsString()
  @MaxLength(150)
  titular!: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  cuit_cuil?: string;

  @IsIn(['CBU', 'CVU'])
  tipo_cuenta!: 'CBU' | 'CVU';
}