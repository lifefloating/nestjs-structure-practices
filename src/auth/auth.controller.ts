import { Controller, Delete, Get, Inject, Post, Query } from '@nestjs/common';

import { AuthInstanceInjectKey } from './auth.constant';
import { InjectAuthInstance } from './auth.interface';
import { AuthService } from './auth.service';

@Controller('/better-auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    @Inject(AuthInstanceInjectKey)
    private readonly authInstance: InjectAuthInstance,
  ) {}

  @Get('token')
  getOrVerifyToken(@Query('token') token?: string, @Query('id') id?: string) {
    console.log(token, id);
  }

  @Post('token')
  async generateToken() {}

  @Delete('token')
  deleteToken() {
    return 'OK';
  }

  @Get('session')
  async getSession() {}
  @Get('providers')
  getProviders() {
    return this.authInstance.get().api.getProviders();
  }
}
