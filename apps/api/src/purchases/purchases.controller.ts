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
import { parsePaging } from '../common/query.util';
import { CreateSaleDto } from './dto/create-sale.dto';
import { PurchasesService } from './purchases.service';

@Controller('purchases')
export class PurchasesController {
  constructor(private readonly purchases: PurchasesService) {}

  @Post()
  create(@Body() dto: CreateSaleDto) {
    return this.purchases.create(dto);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: CreateSaleDto) {
    return this.purchases.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.purchases.remove(id);
  }

  @Get()
  list(
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('preset') preset?: 'today' | 'week' | 'month',
    @Query('search') search?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const paging = parsePaging(limit, offset);
    return this.purchases.list({ preset, from, to }, search, paging.limit, paging.offset);
  }

  @Get(':id')
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.purchases.getOne(id);
  }
}
