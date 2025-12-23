import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('challenge')
  challenge(@Body() body: { publicKey: string }) {
    const { nonce, message } = this.auth.createChallenge(body.publicKey);
    return { nonce, message };
  }

  @Post('verify')
  verify(@Body() body: { publicKey: string; signature: string; message: string; nonce: string }) {
    return this.auth.verify(body);
  }

  @Post('dev-login')
  devLogin(@Body() body: { publicKey: string }) {
    return this.auth.devLogin(body.publicKey);
  }
}
