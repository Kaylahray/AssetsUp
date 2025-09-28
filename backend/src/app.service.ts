import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
  getHello(): string {
    // The language is automatically detected from the request context
    return this.i18n.t('translation.GREETING', { lang: I18nContext.current().lang });
  }

  getNotFoundError(): string {
    // This will throw an exception with a translated message
    throw new NotFoundException(
      this.i18n.t('translation.ERROR.NOT_FOUND', { lang: I18nContext.current().lang }),
    );
  }
}
