
import {
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  Matches,
  ValidateIf,
} from 'class-validator';

export class RegistrarCuentaCobroDto {
  @ValidateIf((o) => !o.cbu_cvu)
  @IsString()
  @MaxLength(100)
  alias?: string;

  @ValidateIf((o) => !o.alias)
  @IsString()
  @Matches(/^[0-9]{22}$/, {
    message: 'El CBU/CVU debe contener exactamente 22 dígitos.',
  })
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
