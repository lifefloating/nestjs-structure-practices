import { Inject, Injectable } from '@nestjs/common';
import { I18nContext, I18nService } from 'nestjs-i18n';

@Injectable()
export class AppService {
  @Inject()
  private readonly i18n: I18nService;

  getI18n(): string {
    return this.i18n.t('login.hello', { lang: I18nContext.current()?.lang });
  }
}
