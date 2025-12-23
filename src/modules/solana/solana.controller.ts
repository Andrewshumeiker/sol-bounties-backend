import { Controller, Get, Param } from '@nestjs/common';
import { SolanaService } from './solana.service';

/**
 * SolanaController expone endpoints REST para interactuar con la red de Solana.
 * Actualmente cuenta con un endpoint para consultar el balance de una cuenta
 * pública. Los clientes (por ejemplo, una app frontend conectada con Phantom)
 * pueden utilizar este endpoint para recuperar su saldo una vez que conocen
 * su clave pública.
 */
@Controller('solana')
export class SolanaController {
  constructor(private readonly solanaService: SolanaService) {}

  /**
   * Devuelve el balance en SOL de la dirección dada. La respuesta incluye
   * tanto la dirección como el saldo para facilitar la identificación.
   *
   * `GET /solana/balance/:address`
   *
   * @param address Dirección pública de Solana obtenida desde el cliente (Phantom)
   * @returns Objeto con la dirección y el saldo en SOL
   */
  @Get('balance/:address')
  async getBalance(@Param('address') address: string) {
    const balance = await this.solanaService.getBalance(address);
    return { address, balance };
  }
}