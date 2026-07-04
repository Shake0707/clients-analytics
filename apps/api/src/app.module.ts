import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { appConfig } from './config/app.config';
import { AuthController } from './auth/auth.controller';
import { TelegramAuthGuard } from './auth/telegram-auth.guard';
import { PrismaModule } from './prisma/prisma.module';
import { ClientsModule } from './clients/clients.module';
import { ProductsModule } from './products/products.module';
import { PurchasesModule } from './purchases/purchases.module';
import { AnalyticsModule } from './analytics/analytics.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['../../.env', '.env'],
      load: [appConfig],
    }),
    PrismaModule,
    ClientsModule,
    ProductsModule,
    PurchasesModule,
    AnalyticsModule,
  ],
  controllers: [AppController, AuthController],
  providers: [AppService, { provide: APP_GUARD, useClass: TelegramAuthGuard }],
})
export class AppModule {}
