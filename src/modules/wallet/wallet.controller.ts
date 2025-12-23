import { Body, Controller, Post } from '@nestjs/common';
import { WalletService } from './wallet.service';

/**
 * Controlador para las operaciones relacionadas con la wallet. Exponen
 * endpoints para solicitar mensajes de firma y verificar firmas.
 */
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  /**
   * Endpoint para solicitar un mensaje de firma. El cliente debe
   * proporcionar su identificador de usuario. Se devuelve el mensaje
   * generado que deberá ser firmado por la wallet.
   */
  @Post('request-message')
  requestMessage(@Body() body: { userId: string }) {
    const { userId } = body;
    const message = this.walletService.requestMessage(userId);
    return { message };
  }

  /**
   * Endpoint para verificar la firma de una wallet. El cliente debe
   * proporcionar su identificador de usuario, la clave pública de la
   * wallet, el mensaje recibido previamente y la firma generada.
   */
  @Post('verify')
  verify(
    @Body()
    body: {
      userId: string;
      publicKey: string;
      signature: string;
      message: string;
    },
  ) {
    const { userId, publicKey, signature, message } = body;
    const verified = this.walletService.verifySignature(
      userId,
      publicKey,
      signature,
      message,
    );
    return { verified };
  }
}