import { Controller, Get, Req } from '@nestjs/common';
import type { AuthedRequest } from './telegram-auth.guard';

/** Проверка авторизации: 200 + принципал, если admin; иначе guard вернёт 401. */
@Controller('auth')
export class AuthController {
  @Get('me')
  me(@Req() req: AuthedRequest) {
    return { telegramId: req.admin?.telegramId ?? null, user: req.admin?.user ?? null };
  }
}
