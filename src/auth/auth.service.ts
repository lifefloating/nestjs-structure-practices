import { Inject, Injectable } from '@nestjs/common';

import { AuthInstanceInjectKey } from './auth.constant';
import { InjectAuthInstance } from './auth.interface';

@Injectable()
export class AuthService {
  constructor(
    @Inject(AuthInstanceInjectKey)
    private readonly authInstance: InjectAuthInstance,
  ) {}
  getOauthUserAccount(providerAccountId: string) {
    console.log(providerAccountId);
    return {
      id: '',
    };
  }
  getOauthProviders() {
    return Object.keys(this.authInstance.get().options.socialProviders || {});
  }
}
