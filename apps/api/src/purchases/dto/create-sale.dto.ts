import type { CreateSaleInput, SaleItemInput } from '@nodex/shared';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class SaleItemDto implements SaleItemInput {
  @IsInt()
  @IsPositive()
  productId!: number;

  @IsInt()
  @IsPositive()
  quantity!: number;
}

export class CreateSaleDto implements CreateSaleInput {
  @IsInt()
  @IsPositive()
  clientId!: number;

  @IsOptional()
  @IsString()
  purchaseDate?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SaleItemDto)
  items!: SaleItemDto[];

  @IsInt()
  @Min(0)
  soldPrice!: number;
}
