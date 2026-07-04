import type { CreateClientInput } from '@nodex/shared';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateClientDto implements CreateClientInput {
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  surname?: string;

  @IsString()
  @MinLength(7)
  @MaxLength(30)
  telNumber!: string;
}
