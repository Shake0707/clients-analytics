import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { appConfig } from '../config/app.config';
import { IS_PUBLIC_KEY } from './public.decorator';
import { verifyInitData, type TelegramUser } from './telegram.util';

export interface AdminPrincipal {
  telegramId: number;
  user?: TelegramUser;
}

export interface AuthedRequest extends Request {
  admin?: AdminPrincipal;
}

/**
 * Глобальный guard: только админ по Telegram initData (§2, §5.1).
 * Заголовок: `Authorization: tma <initData>`.
 * AUTH_DEV_BYPASS=1 — пропускает всех как фиктивного админа (локальная отладка).
 */
@Injectable()
export class TelegramAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject(appConfig.KEY) private readonly config: ConfigType<typeof appConfig>,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const req = context.switchToHttp().getRequest<AuthedRequest>();

    if (this.config.devBypass) {
      req.admin = { telegramId: 0, user: { id: 0, first_name: 'Dev' } };
      return true;
    }

    if (!this.config.botToken) {
      throw new UnauthorizedException('BOT_TOKEN not configured');
    }

    const header = req.headers['authorization'] ?? '';
    const initData = header.startsWith('tma ') ? header.slice(4) : '';
    const check = verifyInitData(
      initData,
      this.config.botToken,
      this.config.initDataTtl,
    );
    if (!check.ok || !check.user) {
      throw new UnauthorizedException(check.reason ?? 'invalid initData');
    }

    if (!this.config.adminIds.includes(check.user.id)) {
      throw new UnauthorizedException('not an admin');
    }

    req.admin = { telegramId: check.user.id, user: check.user };
    return true;
  }
}
