import { Module } from '@nestjs/common';

import { SolanaService } from './solana.service';
import { SolanaController } from './solana.controller';

/**
 * SolanaModule encapsula la lógica necesaria para interactuar con la red de Solana.
 * Proporciona servicios para consultar el balance de una cuenta utilizando el
 * endpoint JSON-RPC configurado en las variables de entorno.
 */
@Module({
  controllers: [SolanaController],
  providers: [SolanaService],
})
export class SolanaModule {}