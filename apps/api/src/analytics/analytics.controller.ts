import { Controller, Get, Query } from '@nestjs/common';
import type { PeriodPreset, ProductSort } from '@nodex/shared';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analytics: AnalyticsService) {}

  @Get('dashboard')
  dashboard(
    @Query('preset') preset?: PeriodPreset,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.analytics.dashboard({ preset, from, to });
  }

  @Get('timeseries')
  timeseries(
    @Query('preset') preset?: PeriodPreset,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.analytics.timeseries({ preset, from, to });
  }

  @Get('top-clients')
  topClients(
    @Query('preset') preset?: PeriodPreset,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.analytics.topClients({ preset, from, to });
  }

  @Get('top-products')
  topProducts(
    @Query('sort') sort?: ProductSort,
    @Query('preset') preset?: PeriodPreset,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.analytics.topProducts(
      { preset, from, to },
      sort === 'qty' ? 'qty' : 'revenue',
    );
  }
}
