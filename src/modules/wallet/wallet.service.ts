import { Injectable, BadRequestException } from '@nestjs/common';
import * as nacl from 'tweetnacl';
import * as bs58 from 'bs58';
import { v4 as uuidv4 } from 'uuid';
import { UsersService } from '../users/users.service';

/**
 * Interfaz para las solicitudes de firma.
 */
export interface SignRequest {
  /** Identificador del usuario en la aplicación */
  userId: string;
  /** Mensaje generado por el backend que debe ser firmado */
  message: string;
  /** Nonce utilizado para evitar replay attacks */
  nonce: string;
}

/**
 * El servicio Wallet gestiona la generación de mensajes de firma y
 * la verificación de firmas provenientes de wallets Phantom. Cuando
 * la firma es válida, se actualiza el usuario asociando la dirección
 * pública de la wallet.
 */
@Injectable()
export class WalletService {
  /** Almacena temporalmente los mensajes emitidos a cada usuario. */
  private readonly pendingMessages: Map<string, SignRequest> = new Map();

  constructor(private readonly usersService: UsersService) {}

  /**
   * Genera un mensaje único para que el usuario firme con su wallet. El
   * mensaje contiene una descripción, el identificador del usuario y un
   * nonce para evitar ataques de repetición. El mensaje emitido se
   * almacena temporalmente en memoria y debe coincidir al momento de
   * verificar la firma.
   *
   * @param userId identificador interno del usuario
   * @returns el mensaje generado
   */
  requestMessage(userId: string): string {
    // Verificar que el usuario exista
    this.usersService.findById(userId);
    // Crear un nonce único
    const nonce = uuidv4();
    const message =
      `Sol Bounties quiere verificar tu billetera.\n` +
      `Usuario: ${userId}\n` +
      `Nonce: ${nonce}\n` +
      `Emitido: ${new Date().toISOString()}`;
    // Almacenar solicitud
    this.pendingMessages.set(userId, { userId, message, nonce });
    return message;
  }

  /**
   * Verifica la firma proporcionada por el usuario. Comprueba que el
   * mensaje corresponde al emitido previamente y que la firma coincide
   * con la clave pública. Si es válida, asocia la dirección de la wallet
   * al usuario y elimina la solicitud pendiente.
   *
   * @param userId identificador del usuario
   * @param publicKey clave pública de la wallet en base58
   * @param signature firma generada por la wallet en base58
   * @param message mensaje que se firmó
   */
  verifySignature(
    userId: string,
    publicKey: string,
    signature: string,
    message: string,
  ): boolean {
    const pending = this.pendingMessages.get(userId);
    if (!pending || pending.message !== message) {
      throw new BadRequestException(
        'El mensaje no coincide con la solicitud pendiente.',
      );
    }
    // Verificar la firma usando tweetnacl
    const msgBytes = new TextEncoder().encode(message);
    const sigBytes = bs58.decode(signature);
    const pubKeyBytes = bs58.decode(publicKey);
    const valid = nacl.sign.detached.verify(msgBytes, sigBytes, pubKeyBytes);
    if (!valid) {
      throw new BadRequestException('La firma proporcionada no es válida.');
    }
    // Asociar la wallet al usuario
    this.usersService.updateWalletAddress(userId, publicKey);
    // Limpiar la solicitud pendiente
    this.pendingMessages.delete(userId);
    return true;
  }
}