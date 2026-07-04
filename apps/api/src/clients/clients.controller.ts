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
import type { PeriodPreset } from '@nodex/shared';
import { parsePaging } from '../common/query.util';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';

@Controller('clients')
export class ClientsController {
  constructor(private readonly clients: ClientsService) {}

  @Post()
  create(@Body() dto: CreateClientDto) {
    return this.clients.create(dto);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: CreateClientDto) {
    return this.clients.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.clients.remove(id);
  }

  @Get()
  list(
    @Query('preset') preset?: PeriodPreset,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('search') search?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const paging = parsePaging(limit, offset);
    return this.clients.list({ preset, from, to }, search, paging.limit, paging.offset);
  }

  @Get(':id')
  getOne(
    @Param('id', ParseIntPipe) id: number,
    @Query('preset') preset?: PeriodPreset,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.clients.getOne(id, { preset, from, to });
  }
}
