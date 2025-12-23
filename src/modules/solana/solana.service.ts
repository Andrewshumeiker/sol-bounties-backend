import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';

/**
 * SolanaService establece una conexión con el nodo RPC de Solana y expone
 * métodos utilitarios para interactuar con la blockchain. En esta primera
 * versión, el servicio permite consultar el balance nativo (SOL) de una
 * dirección pública. La conexión se inicializa con el endpoint definido en
 * la variable de entorno `SOLANA_RPC_ENDPOINT`, con un valor por defecto
 * apuntando a `https://api.mainnet-beta.solana.com` si no se define ninguno.
 */
@Injectable()
export class SolanaService {
  private readonly connection: Connection;

  constructor(private readonly configService: ConfigService) {
    // Obtiene el endpoint RPC desde las variables de entorno o usa el valor por defecto
    const rpcEndpoint =
      this.configService.get<string>('SOLANA_RPC_ENDPOINT') ||
      'https://api.mainnet-beta.solana.com';
    this.connection = new Connection(rpcEndpoint);
  }

  /**
   * Obtiene el balance de una dirección de Solana en SOL. Si la dirección
   * proporcionada no es válida, lanza una excepción `BadRequestException`.
   *
   * @param address Dirección pública de Solana en formato base58
   * @returns Promesa que resuelve el saldo en SOL
   */
  async getBalance(address: string): Promise<number> {
    try {
      const publicKey = new PublicKey(address);
      const lamports = await this.connection.getBalance(publicKey);
      return lamports / LAMPORTS_PER_SOL;
    } catch (error) {
      // Capturamos errores como direcciones inválidas y propagamos una excepción controlada
      throw new BadRequestException(
        'La dirección de Solana proporcionada no es válida.',
      );
    }
  }
}