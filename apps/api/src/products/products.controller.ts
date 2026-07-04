import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import type { PeriodPreset, ProductSort } from '@nodex/shared';
import { parsePaging } from '../common/query.util';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly products: ProductsService) {}

  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.products.create(dto);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProductDto) {
    return this.products.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.products.remove(id);
  }

  @Get()
  list(
    @Query('preset') preset?: PeriodPreset,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('search') search?: string,
    @Query('sort') sort?: ProductSort,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const paging = parsePaging(limit, offset);
    return this.products.list(
      { preset, from, to },
      search,
      sort === 'qty' ? 'qty' : 'revenue',
      paging.limit,
      paging.offset,
    );
  }

  @Get(':id')
  getOne(
    @Param('id', ParseIntPipe) id: number,
    @Query('preset') preset?: PeriodPreset,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.products.getOne(id, { preset, from, to });
  }
}
