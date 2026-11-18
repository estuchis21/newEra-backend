
import {
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

import { Type } from 'class-transformer';

export class RegistrarTransferenciaDto {
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  monto_transferido!: number;

  @IsDateString()
  fecha_transferencia!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  id_cuenta?: number;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  id_operacion_transferencia?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  observaciones_transferencia?: string;
}
