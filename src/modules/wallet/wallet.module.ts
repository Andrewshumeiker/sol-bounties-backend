import { Module } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { UsersModule } from '../users/users.module';

/**
 * El módulo Wallet agrupa la lógica necesaria para solicitar
 * mensajes de firma a los usuarios y validar la firma de
 * conexiones con la wallet Phantom. Este módulo depende del
 * UsersModule para actualizar la entidad de usuario cuando
 * una wallet ha sido verificada.
 */
@Module({
  imports: [UsersModule],
  controllers: [WalletController],
  providers: [WalletService],
})
export class WalletModule {}