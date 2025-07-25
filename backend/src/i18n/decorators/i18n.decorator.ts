import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { I18nContext } from 'nestjs-i18n';

export const CurrentLanguage = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const i18n = I18nContext.current(ctx);
    return i18n?.lang || 'en';
  },
);

export const Translate = createParamDecorator(
  (key: string, ctx: ExecutionContext) => {
    const i18n = I18nContext.current(ctx);
    return i18n?.translate(key) || key;
  },
);